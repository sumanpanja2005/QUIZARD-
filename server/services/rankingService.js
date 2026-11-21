import mongoose from 'mongoose';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';

export const getGlobalLeaderboard = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);

  // Aggregate student performance from completed attempts
  const aggregated = await QuizAttempt.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: '$studentId',
        totalPoints: { $sum: '$score' },
        quizzesAttempted: { $sum: 1 },
        averagePercentage: { $avg: '$percentage' },
        averageTime: { $avg: '$timeTaken' },
        lastActive: { $max: '$submittedAt' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    { $match: { 'student.status': 'active', 'student.role': 'student' } },
    {
      $project: {
        _id: 1,
        studentId: '$_id',
        name: '$student.name',
        username: '$student.username',
        email: '$student.email',
        profileImage: '$student.profileImage',
        institution: '$student.institution',
        totalPoints: 1,
        quizzesAttempted: 1,
        averagePercentage: { $round: ['$averagePercentage', 1] },
        averageTime: { $round: ['$averageTime', 0] },
        lastActive: 1,
      },
    },
    // Tiebreaker rule: highest points first, lowest average time second, highest averagePercentage third
    {
      $sort: {
        totalPoints: -1,
        averageTime: 1,
        averagePercentage: -1,
        quizzesAttempted: -1,
      },
    },
  ]);

  // Also include registered students who haven't completed any quiz yet
  const studentIdsWithAttempts = new Set(aggregated.map((item) => item._id.toString()));
  const allStudents = await User.find({ role: 'student', status: 'active' }).select(
    'name username email profileImage institution createdAt'
  );

  const studentsWithoutAttempts = allStudents
    .filter((s) => !studentIdsWithAttempts.has(s._id.toString()))
    .map((s) => ({
      _id: s._id,
      studentId: s._id,
      name: s.name,
      username: s.username,
      email: s.email,
      profileImage: s.profileImage,
      institution: s.institution || '',
      totalPoints: 0,
      quizzesAttempted: 0,
      averagePercentage: 0,
      averageTime: 0,
      lastActive: s.createdAt,
    }));

  const fullRankedList = [...aggregated, ...studentsWithoutAttempts].map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  const totalStudents = fullRankedList.length;
  const topThree = fullRankedList.slice(0, 3);
  const paginatedStudents = fullRankedList.slice(skip, skip + Number(limit));

  return {
    topThree,
    students: paginatedStudents,
    pagination: {
      total: totalStudents,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalStudents / Number(limit)) || 1,
    },
  };
};

export const getStudentRank = async (studentId) => {
  const { students } = await getGlobalLeaderboard({ page: 1, limit: 10000 });
  const entry = students.find((s) => s.studentId.toString() === studentId.toString());
  return entry ? entry.rank : null;
};

export const getCompetitionLeaderboard = async (quizId, { page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);

  // We want the best attempt per student for this quiz
  const matchQuiz = new mongoose.Types.ObjectId(quizId);

  const pipeline = [
    { $match: { quizId: matchQuiz, status: 'completed' } },
    {
      $sort: {
        score: -1,
        timeTaken: 1,
        submittedAt: 1,
      },
    },
    {
      $group: {
        _id: '$studentId',
        bestScore: { $first: '$score' },
        percentage: { $first: '$percentage' },
        timeTaken: { $first: '$timeTaken' },
        submittedAt: { $first: '$submittedAt' },
        attemptId: { $first: '$_id' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $project: {
        studentId: '$_id',
        attemptId: 1,
        name: '$student.name',
        username: '$student.username',
        profileImage: '$student.profileImage',
        score: '$bestScore',
        percentage: 1,
        timeTaken: 1,
        submittedAt: 1,
      },
    },
    {
      $sort: {
        score: -1,
        timeTaken: 1,
        submittedAt: 1,
      },
    },
  ];

  const fullResults = await QuizAttempt.aggregate(pipeline);
  const ranked = fullResults.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  const total = ranked.length;
  const topThree = ranked.slice(0, 3);
  const paginatedResults = ranked.slice(skip, skip + Number(limit));

  return {
    topThree,
    rankings: paginatedResults,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
    },
  };
};
