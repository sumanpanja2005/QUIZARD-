import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';

// @desc    Get admin dashboard metrics & stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCompetitions = await Quiz.countDocuments();
    const totalPublishedCompetitions = await Quiz.countDocuments({ status: 'published' });
    const totalQuestions = await Question.countDocuments();
    const totalSubmissions = await QuizAttempt.countDocuments({ status: 'completed' });

    // Recent registered students (last 6)
    const recentStudents = await User.find({ role: 'student' })
      .select('name username email status createdAt institution')
      .sort({ createdAt: -1 })
      .limit(6);

    // Recent quiz activities/submissions (last 8)
    const recentSubmissions = await QuizAttempt.find({ status: 'completed' })
      .populate('studentId', 'name username profileImage email')
      .populate('quizId', 'title subject totalMarks')
      .sort({ submittedAt: -1 })
      .limit(8);

    // Subject breakdown
    const subjectStats = await Quiz.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalCompetitions,
          totalPublishedCompetitions,
          totalQuestions,
          totalSubmissions,
        },
        recentStudents,
        recentSubmissions,
        subjectStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students with performance metrics
// @route   GET /api/admin/students
// @access  Private (Admin)
export const getAdminStudents = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 15 } = req.query;
    const query = { role: 'student' };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { institution: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .select('name username email status institution profileImage createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Enhance students with quiz counts & total points
    const studentIds = students.map((s) => s._id);
    const attempts = await QuizAttempt.aggregate([
      { $match: { studentId: { $in: studentIds }, status: 'completed' } },
      {
        $group: {
          _id: '$studentId',
          totalPoints: { $sum: '$score' },
          quizzesAttempted: { $sum: 1 },
          avgScore: { $avg: '$percentage' },
        },
      },
    ]);

    const attemptMap = new Map();
    attempts.forEach((a) => {
      attemptMap.set(a._id.toString(), a);
    });

    const enhancedStudents = students.map((s) => {
      const stats = attemptMap.get(s._id.toString()) || {
        totalPoints: 0,
        quizzesAttempted: 0,
        avgScore: 0,
      };
      return {
        ...s.toObject(),
        totalPoints: stats.totalPoints,
        quizzesAttempted: stats.quizzesAttempted,
        avgScore: Number((stats.avgScore || 0).toFixed(1)),
      };
    });

    res.status(200).json({
      success: true,
      count: enhancedStudents.length,
      data: enhancedStudents,
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

// @desc    Toggle student status (active/blocked)
// @route   PUT /api/admin/students/:id/status
// @access  Private (Admin)
export const toggleStudentStatus = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    student.status = student.status === 'active' ? 'blocked' : 'active';
    await student.save();

    res.status(200).json({
      success: true,
      message: `Student account has been ${student.status === 'active' ? 'activated' : 'blocked'}.`,
      data: {
        id: student._id,
        status: student.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all submissions across competitions
// @route   GET /api/admin/submissions
// @access  Private (Admin)
export const getAdminSubmissions = async (req, res, next) => {
  try {
    const { quizId, studentId, page = 1, limit = 20 } = req.query;
    const query = { status: 'completed' };

    if (quizId && quizId !== 'All') {
      query.quizId = quizId;
    }

    if (studentId) {
      query.studentId = studentId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await QuizAttempt.countDocuments(query);

    const submissions = await QuizAttempt.find(query)
      .populate('studentId', 'name username email profileImage institution')
      .populate('quizId', 'title subject totalMarks duration passingPercentage')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
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
