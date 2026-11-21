import QuizAttempt from '../models/QuizAttempt.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import { calculateQuizScore } from '../services/scoringService.js';
import { getCompetitionLeaderboard, getStudentRank } from '../services/rankingService.js';

// @desc    Start or resume a quiz attempt
// @route   POST /api/attempts/start
// @access  Private (Student)
export const startAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.body;
    const studentId = req.user.id;

    if (!quizId) {
      return res.status(400).json({ success: false, message: 'Quiz ID is required.' });
    }

    const quiz = await Quiz.findById(quizId).populate({
      path: 'questions',
      options: { sort: { order: 1, createdAt: 1 } },
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz competition not found.' });
    }

    if (quiz.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'This quiz competition is currently not active.',
      });
    }

    const now = new Date();
    if (new Date(quiz.startDate) > now) {
      return res.status(400).json({
        success: false,
        message: `This competition has not started yet. It starts at ${new Date(quiz.startDate).toLocaleString()}.`,
      });
    }

    if (new Date(quiz.endDate) < now) {
      return res.status(400).json({
        success: false,
        message: 'This competition has ended.',
      });
    }

    // Check if user already completed this quiz
    const previousCompleted = await QuizAttempt.findOne({
      studentId,
      quizId,
      status: 'completed',
    });

    if (previousCompleted && !quiz.allowRetakes) {
      return res.status(403).json({
        success: false,
        message: 'You have already submitted this competition. Retakes are not permitted.',
        attemptId: previousCompleted._id,
      });
    }

    // Check if an in-progress attempt already exists
    let attempt = await QuizAttempt.findOne({
      studentId,
      quizId,
      status: 'in_progress',
    });

    const durationSeconds = quiz.duration * 60;

    if (attempt) {
      // Check if time expired already while in progress
      const elapsedSeconds = Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000);
      if (elapsedSeconds >= durationSeconds + 30) {
        // Auto-finalize timed out attempt
        attempt.status = 'timed_out';
        attempt.timeTaken = durationSeconds;
        await attempt.save();

        if (!quiz.allowRetakes) {
          return res.status(400).json({
            success: false,
            message: 'Your previous attempt timed out.',
          });
        }
        // If retakes allowed, create fresh one below
        attempt = null;
      }
    }

    if (!attempt) {
      attempt = await QuizAttempt.create({
        studentId,
        quizId,
        answers: [],
        startedAt: new Date(),
        status: 'in_progress',
      });
    }

    const elapsedSeconds = Math.max(
      0,
      Math.floor((new Date().getTime() - new Date(attempt.startedAt).getTime()) / 1000)
    );
    const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);

    // Sanitize questions: NEVER send correctAnswer to frontend during live quiz!
    const sanitizedQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      marks: q.marks,
      order: q.order,
    }));

    res.status(200).json({
      success: true,
      message: 'Quiz attempt initialized.',
      data: {
        attemptId: attempt._id,
        quiz: {
          id: quiz._id,
          title: quiz.title,
          subject: quiz.subject,
          duration: quiz.duration,
          totalMarks: quiz.totalMarks,
          totalQuestions: sanitizedQuestions.length,
          questions: sanitizedQuestions,
        },
        savedAnswers: attempt.answers,
        startedAt: attempt.startedAt,
        remainingSeconds,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers and compute score securely
// @route   POST /api/attempts/submit
// @access  Private (Student)
export const submitAttempt = async (req, res, next) => {
  try {
    const { attemptId, answers = [] } = req.body;
    const studentId = req.user.id;

    if (!attemptId) {
      return res.status(400).json({ success: false, message: 'Attempt ID is required.' });
    }

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      studentId,
    });

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Quiz attempt record not found.' });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This quiz attempt has already been submitted.',
        attemptId: attempt._id,
      });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Associated quiz not found.' });
    }

    const now = new Date();
    const durationSeconds = quiz.duration * 60;
    const elapsedSeconds = Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000);
    // Allow small grace window (30 seconds) for network latency
    const timeTaken = Math.min(Math.max(1, elapsedSeconds), durationSeconds);

    // SECURE BACKEND SCORING: Calculate marks based on DB records
    const scoreResult = await calculateQuizScore(quiz._id, answers);

    attempt.answers = scoreResult.processedAnswers;
    attempt.score = scoreResult.score;
    attempt.percentage = scoreResult.percentage;
    attempt.totalQuestions = scoreResult.totalQuestions;
    attempt.correctAnswersCount = scoreResult.correctAnswersCount;
    attempt.timeTaken = timeTaken;
    attempt.submittedAt = now;
    attempt.status = elapsedSeconds > durationSeconds + 60 ? 'timed_out' : 'completed';

    await attempt.save();

    // Recalculate rank in this competition
    const compLeaderboard = await getCompetitionLeaderboard(quiz._id, { limit: 1000 });
    const studentCompRank = compLeaderboard.rankings.find(
      (r) => r.studentId.toString() === studentId.toString()
    );

    // Recalculate student global rank
    const globalRank = await getStudentRank(studentId);

    res.status(200).json({
      success: true,
      message: 'Quiz submitted successfully!',
      data: {
        attemptId: attempt._id,
        quizId: quiz._id,
        quizTitle: quiz.title,
        subject: quiz.subject,
        score: attempt.score,
        totalMarks: scoreResult.totalMarks,
        percentage: attempt.percentage,
        totalQuestions: scoreResult.totalQuestions,
        correctAnswersCount: scoreResult.correctAnswersCount,
        wrongAnswersCount: scoreResult.totalQuestions - scoreResult.correctAnswersCount,
        timeTaken: attempt.timeTaken,
        submittedAt: attempt.submittedAt,
        competitionRank: studentCompRank ? studentCompRank.rank : 1,
        globalRank: globalRank || 1,
        questionReviews: scoreResult.questionReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own attempts history
// @route   GET /api/attempts/my-attempts
// @access  Private (Student)
export const getMyAttempts = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { page = 1, limit = 15 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await QuizAttempt.countDocuments({
      studentId,
      status: { $in: ['completed', 'timed_out'] },
    });

    const attempts = await QuizAttempt.find({
      studentId,
      status: { $in: ['completed', 'timed_out'] },
    })
      .populate('quizId', 'title subject totalMarks duration difficulty')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full result for a specific attempt (with question review)
// @route   GET /api/attempts/:id/result
// @access  Private
export const getAttemptResult = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id)
      .populate('quizId', 'title subject totalMarks duration passingPercentage difficulty')
      .populate('studentId', 'name username email profileImage institution');

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Quiz attempt not found.' });
    }

    // Only owner of attempt or admin can view results
    const isOwner = req.user && req.user.id.toString() === attempt.studentId._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. You cannot view another student’s quiz attempt results.',
      });
    }

    // Build question reviews with correct answers for educational post-quiz learning
    const questions = await Question.find({ quizId: attempt.quizId._id }).sort({ order: 1, createdAt: 1 });
    const answerMap = new Map();
    attempt.answers.forEach((ans) => {
      answerMap.set(ans.questionId.toString(), ans);
    });

    const questionReviews = questions.map((q) => {
      const studentAns = answerMap.get(q._id.toString());
      return {
        questionId: q._id,
        questionText: q.questionText,
        options: q.options,
        selectedOption: studentAns ? studentAns.selectedOption : null,
        correctAnswer: q.correctAnswer,
        isCorrect: studentAns ? studentAns.isCorrect : false,
        marks: q.marks,
        marksAwarded: studentAns ? studentAns.marksAwarded : 0,
        explanation: q.explanation,
      };
    });

    // Competition rank
    const compLeaderboard = await getCompetitionLeaderboard(attempt.quizId._id, { limit: 1000 });
    const studentCompRank = compLeaderboard.rankings.find(
      (r) => r.studentId.toString() === attempt.studentId._id.toString()
    );

    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        quiz: attempt.quizId,
        student: attempt.studentId,
        score: attempt.score,
        totalMarks: attempt.quizId?.totalMarks || 0,
        percentage: attempt.percentage,
        timeTaken: attempt.timeTaken,
        submittedAt: attempt.submittedAt,
        status: attempt.status,
        correctAnswersCount: attempt.correctAnswersCount,
        totalQuestions: attempt.totalQuestions || questions.length,
        competitionRank: studentCompRank ? studentCompRank.rank : null,
        questionReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};
