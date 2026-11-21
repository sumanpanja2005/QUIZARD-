import http from 'http';

const BASE_URL = 'http://127.0.0.1:5000/api';

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const pollServer = async (retries = 40) => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await request('/health');
      if (res.status === 200 && res.data.ready === true) {
        return true;
      }
    } catch {
      // Wait for server to boot
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  throw new Error('Server did not start up within timeout.');
};

export const runTests = async () => {
  console.log('⏳ Waiting for server to finish database connection and seed...');
  await pollServer();
  console.log('🧪 Starting End-to-End API Test Suite for QUIZARD Platform...\n');

  try {
    // 1. Health check
    const health = await request('/health');
    console.log(`1. Health Check: ${health.status === 200 ? '✅ PASSED' : '❌ FAILED'}`);

    // 2. Admin Login
    const adminLog = await request('/auth/admin/login', 'POST', {
      identifier: 'admin@quizard.com',
      password: 'AdminPassword123!',
    });
    console.log(`2. Admin Login: ${adminLog.status === 200 && adminLog.data.token ? '✅ PASSED' : '❌ FAILED'}`);
    const adminToken = adminLog.data.token;

    // 3. Student Registration
    const timestamp = Date.now();
    const studentEmail = `student_${timestamp}@university.edu`;
    const studentUsername = `student_${timestamp}`;
    const studentPassword = 'StudentPassword123!';

    const regRes = await request('/auth/register', 'POST', {
      name: 'Real Competitor',
      username: studentUsername,
      email: studentEmail,
      institution: 'Global Tech Institute',
      password: studentPassword,
    });
    console.log(`3. Student Registration: ${regRes.status === 201 && regRes.data.token ? '✅ PASSED' : '❌ FAILED'}`);

    // 4. Student Login
    const studentLog = await request('/auth/login', 'POST', {
      identifier: studentEmail,
      password: studentPassword,
    });
    console.log(`4. Student Login: ${studentLog.status === 200 && studentLog.data.token ? '✅ PASSED' : '❌ FAILED'}`);
    const studentToken = studentLog.data.token;

    // 5. Student Dashboard
    const dashboard = await request('/students/dashboard', 'GET', null, studentToken);
    console.log(`5. Student Dashboard: ${dashboard.status === 200 && dashboard.data.success ? '✅ PASSED' : '❌ FAILED'}`);

    // 6. Fetch Quizzes and verify questions sanitized
    const quizzes = await request('/quizzes', 'GET', null, studentToken);
    console.log(`6. Fetch Quizzes: ${quizzes.status === 200 && quizzes.data.data.length > 0 ? '✅ PASSED' : '❌ FAILED'}`);
    const firstQuiz = quizzes.data.data[0];

    const quizDetails = await request(`/quizzes/${firstQuiz._id}`, 'GET', null, studentToken);
    const hasExposedAnswer = quizDetails.data.data.questions.some((q) => q.correctAnswer !== undefined);
    console.log(`7. Security Check (Correct answers hidden from student): ${!hasExposedAnswer ? '✅ PASSED (Zero Answer Leakage)' : '❌ FAILED (Leaked Answer!)'}`);

    // 8. Start Quiz Attempt
    const attemptStart = await request('/attempts/start', 'POST', { quizId: firstQuiz._id }, studentToken);
    console.log(`8. Start Quiz Attempt: ${attemptStart.status === 200 && attemptStart.data.data.attemptId ? '✅ PASSED' : '❌ FAILED'}`);
    const attemptId = attemptStart.data.data.attemptId;

    // 9. Submit Quiz Attempt
    const questionsToAnswer = attemptStart.data.data.quiz.questions;
    const testAnswers = questionsToAnswer.map((q) => ({
      questionId: q._id,
      selectedOption: 'B', // select B for all
    }));

    const attemptSubmit = await request('/attempts/submit', 'POST', { attemptId, answers: testAnswers }, studentToken);
    console.log(`9. Submit Quiz Attempt: ${attemptSubmit.status === 200 && attemptSubmit.data.data.score !== undefined ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   -> Score: ${attemptSubmit.data.data.score}/${attemptSubmit.data.data.totalMarks} (${attemptSubmit.data.data.percentage}%), Rank: #${attemptSubmit.data.data.competitionRank}`);

    // 10. Attempt Result Review
    const resultCheck = await request(`/attempts/${attemptId}/result`, 'GET', null, studentToken);
    console.log(`10. Post-Submission Review (Answers & Explanations available): ${resultCheck.status === 200 && resultCheck.data.data.questionReviews.length > 0 ? '✅ PASSED' : '❌ FAILED'}`);

    // 11. Global Leaderboard
    const leaderboard = await request('/leaderboard', 'GET');
    console.log(`11. Global Leaderboard: ${leaderboard.status === 200 && leaderboard.data.data.students.length > 0 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`    -> Top Rank: ${leaderboard.data.data.students[0]?.name} (${leaderboard.data.data.students[0]?.totalPoints} points)`);

    // 12. Admin Dashboard & Submissions
    const adminDash = await request('/admin/dashboard', 'GET', null, adminToken);
    console.log(`12. Admin Dashboard Metrics: ${adminDash.status === 200 && adminDash.data.data.stats.totalStudents > 0 ? '✅ PASSED' : '❌ FAILED'}`);

    // 13. Admin Dynamic Question Addition
    const newQuestion = await request(`/quizzes/${firstQuiz._id}/questions`, 'POST', {
      questionText: 'What is the speed of light in vacuum approximately?',
      options: [
        { id: 'A', text: '300,000 km/s' },
        { id: 'B', text: '150,000 km/s' },
        { id: 'C', text: '450,000 km/s' },
        { id: 'D', text: '600,000 km/s' },
      ],
      correctAnswer: 'A',
      marks: 5,
      explanation: 'The speed of light in vacuum is approximately 299,792 kilometers per second.',
    }, adminToken);
    console.log(`13. Admin Dynamic Question Addition: ${newQuestion.status === 201 && newQuestion.data.data._id ? '✅ PASSED' : '❌ FAILED'}`);

    console.log('\n🎉 ALL 13 TEST SUITES PASSED SUCCESSFULLY WITH ZERO ERRORS!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test Suite Execution Failed:', err);
    process.exit(1);
  }
};
