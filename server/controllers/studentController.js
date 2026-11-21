import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { getStudentRank } from '../services/rankingService.js';

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private (Student)
export const getProfile = async (req, res, next) => {
  try {
    const student = await User.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const rank = await getStudentRank(student._id);

    // Get aggregated stats
    const attempts = await QuizAttempt.find({ studentId: student._id, status: 'completed' });
    const totalPoints = attempts.reduce((acc, att) => acc + att.score, 0);
    const avgScore =
      attempts.length > 0
        ? Number((attempts.reduce((acc, att) => acc + att.percentage, 0) / attempts.length).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      data: {
        id: student._id,
        name: student.name,
        username: student.username,
        email: student.email,
        bio: student.bio,
        institution: student.institution,
        profileImage: student.profileImage,
        role: student.role,
        createdAt: student.createdAt,
        stats: {
          rank,
          totalPoints,
          quizzesAttempted: attempts.length,
          averagePercentage: avgScore,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private (Student)
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, institution, profileImage, newPassword, currentPassword } = req.body;
    const student = await User.findById(req.user.id).select('+password');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    if (name) student.name = name.trim();
    if (bio !== undefined) student.bio = bio.trim();
    if (institution !== undefined) student.institution = institution.trim();
    if (profileImage !== undefined) student.profileImage = profileImage;

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change your password.',
        });
      }
      const isMatch = await student.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match.',
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long.',
        });
      }
      student.password = newPassword;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: student._id,
        name: student.name,
        username: student.username,
        email: student.email,
        bio: student.bio,
        institution: student.institution,
        profileImage: student.profileImage,
        role: student.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student dashboard data
// @route   GET /api/students/dashboard
// @access  Private (Student)
export const getDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // 1. Fetch completed attempts for student
    const completedAttempts = await QuizAttempt.find({
      studentId,
      status: 'completed',
    })
      .populate('quizId', 'title subject totalMarks duration difficulty')
      .sort({ submittedAt: -1 });

    const totalQuizzesAttempted = completedAttempts.length;
    const totalPointsEarned = completedAttempts.reduce((acc, a) => acc + (a.score || 0), 0);
    const averageScore =
      totalQuizzesAttempted > 0
        ? Number(
            (
              completedAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0) /
              totalQuizzesAttempted
            ).toFixed(1)
          )
        : 0;

    // 2. Calculate current global ranking
    const currentGlobalRanking = await getStudentRank(studentId);

    // 3. Fetch active / available competitions
    const now = new Date();
    const availableCompetitions = await Quiz.find({
      status: 'published',
      endDate: { $gte: now },
    })
      .select('title description subject duration totalMarks startDate endDate difficulty allowRetakes')
      .sort({ startDate: 1 })
      .limit(6);

    // Map attempts to check if student already attempted each competition
    const attemptedQuizIds = new Set(
      completedAttempts.map((a) => a.quizId?._id?.toString() || a.quizId?.toString())
    );

    const competitionsWithStatus = availableCompetitions.map((quiz) => {
      const isAttempted = attemptedQuizIds.has(quiz._id.toString());
      const canAttempt = !isAttempted || quiz.allowRetakes;
      const isStarted = new Date(quiz.startDate) <= now;
      return {
        ...quiz.toObject(),
        isAttempted,
        canAttempt,
        isStarted,
      };
    });

    // 4. Recent quiz history (last 5)
    const recentQuizHistory = completedAttempts.slice(0, 5).map((att) => ({
      attemptId: att._id,
      quizId: att.quizId?._id,
      quizTitle: att.quizId?.title || 'Competition',
      subject: att.quizId?.subject || 'General',
      score: att.score,
      totalMarks: att.quizId?.totalMarks || 0,
      percentage: att.percentage,
      timeTaken: att.timeTaken,
      submittedAt: att.submittedAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        welcomeMessage: `Welcome back, ${student.name}!`,
        student: {
          id: student._id,
          name: student.name,
          username: student.username,
          profileImage: student.profileImage,
          institution: student.institution,
        },
        stats: {
          totalQuizzesAttempted,
          totalPointsEarned,
          averageScore,
          currentGlobalRanking: currentGlobalRanking || '-',
        },
        availableCompetitions: competitionsWithStatus,
        recentQuizHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};
