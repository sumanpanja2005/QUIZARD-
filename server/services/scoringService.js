import Question from '../models/Question.js';
import Quiz from '../models/Quiz.js';

export const calculateQuizScore = async (quizId, submittedAnswers = []) => {
  // Fetch all questions for this quiz from DB with correctAnswer
  const questions = await Question.find({ quizId }).sort({ order: 1, createdAt: 1 });

  if (!questions || questions.length === 0) {
    throw new Error('No questions found for this quiz.');
  }

  // Create a map of questionId -> question
  const questionMap = new Map();
  let totalMarks = 0;

  questions.forEach((q) => {
    questionMap.set(q._id.toString(), q);
    totalMarks += q.marks || 1;
  });

  // Create a map of submitted answers: questionId -> selectedOption
  const answerMap = new Map();
  submittedAnswers.forEach((ans) => {
    if (ans && ans.questionId) {
      answerMap.set(ans.questionId.toString(), ans.selectedOption);
    }
  });

  let earnedScore = 0;
  let correctCount = 0;
  const processedAnswers = [];
  const questionReviews = [];

  questions.forEach((question) => {
    const qIdStr = question._id.toString();
    const selectedOption = answerMap.get(qIdStr) || null;
    const isCorrect = selectedOption !== null && selectedOption === question.correctAnswer;
    const marksAwarded = isCorrect ? question.marks : 0;

    if (isCorrect) {
      earnedScore += marksAwarded;
      correctCount += 1;
    }

    processedAnswers.push({
      questionId: question._id,
      selectedOption,
      isCorrect,
      marksAwarded,
    });

    // Provide complete feedback for result screen
    questionReviews.push({
      questionId: question._id,
      questionText: question.questionText,
      options: question.options,
      selectedOption,
      correctAnswer: question.correctAnswer,
      isCorrect,
      marks: question.marks,
      marksAwarded,
      explanation: question.explanation,
    });
  });

  const percentage = totalMarks > 0 ? Number(((earnedScore / totalMarks) * 100).toFixed(2)) : 0;

  return {
    score: earnedScore,
    totalMarks,
    percentage,
    totalQuestions: questions.length,
    correctAnswersCount: correctCount,
    processedAnswers,
    questionReviews,
  };
};
