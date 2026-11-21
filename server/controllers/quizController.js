import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';

// @desc    Get all quizzes (filtered by status for students, full for admin)
// @route   GET /api/quizzes
// @access  Public / Protected
export const getQuizzes = async (req, res, next) => {
  try {
    const { subject, status, search, page = 1, limit = 12 } = req.query;
    const query = {};

    // If user is not admin, only show published quizzes
    if (!req.user || req.user.role !== 'admin') {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    if (subject && subject !== 'All') {
      query.subject = subject;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Quiz.countDocuments(query);
    const quizzes = await Quiz.find(query)
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // For students, check if they have attempted each quiz
    let attemptedMap = new Map();
    if (req.user && req.user.role === 'student') {
      const attempts = await QuizAttempt.find({
        studentId: req.user.id,
        status: 'completed',
      }).select('quizId score percentage');
      attempts.forEach((a) => {
        attemptedMap.set(a.quizId.toString(), {
          score: a.score,
          percentage: a.percentage,
        });
      });
    }

    const enhancedQuizzes = quizzes.map((quiz) => {
      const qObj = quiz.toObject();
      const userAttempt = attemptedMap.get(quiz._id.toString());
      return {
        ...qObj,
        questionCount: quiz.questions ? quiz.questions.length : 0,
        isAttempted: !!userAttempt,
        userScore: userAttempt ? userAttempt.score : null,
        userPercentage: userAttempt ? userAttempt.percentage : null,
      };
    });

    res.status(200).json({
      success: true,
      count: enhancedQuizzes.length,
      data: enhancedQuizzes,
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

// @desc    Get single quiz by ID (Sanitizes questions for students to prevent cheating)
// @route   GET /api/quizzes/:id
// @access  Public / Protected
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'name username')
      .populate({
        path: 'questions',
        options: { sort: { order: 1, createdAt: 1 } },
      });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz competition not found.' });
    }

    const isAdmin = req.user && req.user.role === 'admin';

    // If quiz is not published and user is not admin, deny access
    if (quiz.status !== 'published' && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'This quiz competition is currently not available.',
      });
    }

    let questions = quiz.questions || [];

    // CRITICAL SECURITY REQUIREMENT:
    // For students or non-admins taking the quiz, NEVER expose correctAnswer or explanation
    if (!isAdmin) {
      questions = questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        marks: q.marks,
        order: q.order,
      }));
    }

    let hasAttempted = false;
    let previousAttempt = null;
    if (req.user && req.user.role === 'student') {
      previousAttempt = await QuizAttempt.findOne({
        studentId: req.user.id,
        quizId: quiz._id,
        status: 'completed',
      }).sort({ submittedAt: -1 });
      hasAttempted = !!previousAttempt;
    }

    res.status(200).json({
      success: true,
      data: {
        ...quiz.toObject(),
        questions,
        questionCount: questions.length,
        hasAttempted,
        previousAttempt: previousAttempt
          ? {
              score: previousAttempt.score,
              percentage: previousAttempt.percentage,
              timeTaken: previousAttempt.timeTaken,
              submittedAt: previousAttempt.submittedAt,
              attemptId: previousAttempt._id,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new quiz competition
// @route   POST /api/quizzes
// @access  Private (Admin)
export const createQuiz = async (req, res, next) => {
  try {
    const {
      title,
      description,
      subject,
      duration,
      startDate,
      endDate,
      status,
      allowRetakes,
      passingPercentage,
      difficulty,
    } = req.body;

    if (!title || !subject || !duration || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, subject, duration, and end date.',
      });
    }

    if (new Date(endDate) <= new Date(startDate || Date.now())) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date.',
      });
    }

    const quiz = await Quiz.create({
      title,
      description,
      subject,
      duration: Number(duration),
      startDate: startDate || Date.now(),
      endDate,
      status: status || 'draft',
      allowRetakes: !!allowRetakes,
      passingPercentage: passingPercentage || 50,
      difficulty: difficulty || 'Medium',
      createdBy: req.user.id,
      questions: [],
      totalMarks: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Quiz competition created successfully!',
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update quiz competition
// @route   PUT /api/quizzes/:id
// @access  Private (Admin)
export const updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz competition not found.' });
    }

    const {
      title,
      description,
      subject,
      duration,
      startDate,
      endDate,
      status,
      allowRetakes,
      passingPercentage,
      difficulty,
    } = req.body;

    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (subject) quiz.subject = subject;
    if (duration) quiz.duration = Number(duration);
    if (startDate) quiz.startDate = startDate;
    if (endDate) quiz.endDate = endDate;
    if (status) quiz.status = status;
    if (allowRetakes !== undefined) quiz.allowRetakes = allowRetakes;
    if (passingPercentage !== undefined) quiz.passingPercentage = passingPercentage;
    if (difficulty) quiz.difficulty = difficulty;

    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz competition updated successfully!',
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete quiz competition
// @route   DELETE /api/quizzes/:id
// @access  Private (Admin)
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz competition not found.' });
    }

    // Delete all questions associated with this quiz
    await Question.deleteMany({ quizId: quiz._id });

    // Delete all attempts associated with this quiz
    await QuizAttempt.deleteMany({ quizId: quiz._id });

    // Delete the quiz
    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quiz competition and all associated questions and records deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add question dynamically to a quiz
// @route   POST /api/quizzes/:id/questions
// @access  Private (Admin)
export const addQuestion = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz competition not found.' });
    }

    const { questionText, options, correctAnswer, marks = 1, explanation } = req.body;

    if (!questionText || !options || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Question text, options, and correct answer are required.',
      });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'A question must provide at least two options.',
      });
    }

    // Determine current order
    const count = await Question.countDocuments({ quizId: quiz._id });

    const newQuestion = await Question.create({
      quizId: quiz._id,
      questionText,
      options,
      correctAnswer,
      marks: Number(marks) || 1,
      explanation: explanation || '',
      order: count + 1,
    });

    // Add question ref to quiz & recalculate total marks
    quiz.questions.push(newQuestion._id);
    quiz.totalMarks = (quiz.totalMarks || 0) + Number(newQuestion.marks);
    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Question added successfully!',
      data: newQuestion,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question
// @route   PUT /api/quizzes/:id/questions/:questionId
// @access  Private (Admin)
export const updateQuestion = async (req, res, next) => {
  try {
    const { questionText, options, correctAnswer, marks, explanation } = req.body;
    const question = await Question.findOne({
      _id: req.params.questionId,
      quizId: req.params.id,
    });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const oldMarks = question.marks;

    if (questionText) question.questionText = questionText;
    if (options) question.options = options;
    if (correctAnswer) question.correctAnswer = correctAnswer;
    if (marks !== undefined) question.marks = Number(marks);
    if (explanation !== undefined) question.explanation = explanation;

    await question.save();

    // Recalculate total marks for the quiz if marks changed
    if (marks !== undefined && Number(marks) !== oldMarks) {
      const allQuestions = await Question.find({ quizId: req.params.id });
      const totalMarks = allQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);
      await Quiz.findByIdAndUpdate(req.params.id, { totalMarks });
    }

    res.status(200).json({
      success: true,
      message: 'Question updated successfully!',
      data: question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete question
// @route   DELETE /api/quizzes/:id/questions/:questionId
// @access  Private (Admin)
export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findOne({
      _id: req.params.questionId,
      quizId: req.params.id,
    });

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    await question.deleteOne();

    // Remove from quiz questions array and update total marks
    const allQuestions = await Question.find({ quizId: req.params.id });
    const totalMarks = allQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);

    await Quiz.findByIdAndUpdate(req.params.id, {
      $pull: { questions: question._id },
      totalMarks,
    });

    res.status(200).json({
      success: true,
      message: 'Question removed successfully!',
    });
  } catch (error) {
    next(error);
  }
};
