import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import QuizAttempt from '../models/QuizAttempt.js';

export const seedDatabase = async () => {
  try {
    // 1. Ensure Platform Admin exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@quizard.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminName = process.env.ADMIN_NAME || 'Platform Admin';

    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.create({
        name: adminName,
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=AdminMaster',
        institution: 'QUIZARD Headquarters',
        bio: 'Head administrator and curriculum manager at QUIZARD.',
      });
      console.log(`✅ Admin account created: ${adminEmail} (password: ${adminPassword})`);
    }

    // 2. Ensure Sample Competitions with Questions exist
    const existingQuizzes = await Quiz.countDocuments();
    if (existingQuizzes > 0) {
      console.log('ℹ️ Quizzes already configured. Database ready with zero dummy students.');
      return;
    }

    console.log('🌱 Setting up default competitions & questions for QUIZARD...');

    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    // Quiz 1: Web Development
    const quiz1 = await Quiz.create({
      title: 'Full-Stack Web Development Championship 2026',
      description: 'Test your mastery of modern JavaScript, React architecture, Node.js internals, and RESTful API design.',
      subject: 'Web Development',
      duration: 15,
      startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      endDate: in30Days,
      status: 'published',
      allowRetakes: false,
      difficulty: 'Medium',
      passingPercentage: 60,
      createdBy: admin._id,
      questions: [],
      totalMarks: 0,
    });

    const q1Questions = [
      {
        questionText: 'What is the primary purpose of the Virtual DOM in React?',
        options: [
          { id: 'A', text: 'To interact directly with the native browser rendering engine' },
          { id: 'B', text: 'To minimize expensive direct DOM manipulations through reconciliation' },
          { id: 'C', text: 'To convert JavaScript code directly into WebAssembly binary' },
          { id: 'D', text: 'To enforce strict static typing in React JSX code' },
        ],
        correctAnswer: 'B',
        marks: 5,
        explanation: 'React compares the Virtual DOM with the real DOM and batches updates efficiently via reconciliation.',
      },
      {
        questionText: 'In Node.js event loop architecture, which phase executes setImmediate() callbacks?',
        options: [
          { id: 'A', text: 'Timers phase' },
          { id: 'B', text: 'Poll phase' },
          { id: 'C', text: 'Check phase' },
          { id: 'D', text: 'Close callbacks phase' },
        ],
        correctAnswer: 'C',
        marks: 5,
        explanation: 'setImmediate callbacks are queued and invoked in the Check phase immediately after the Poll phase.',
      },
      {
        questionText: 'Which HTTP status code indicates a successful PUT request that creates a brand new resource?',
        options: [
          { id: 'A', text: '200 OK' },
          { id: 'B', text: '201 Created' },
          { id: 'C', text: '204 No Content' },
          { id: 'D', text: '304 Not Modified' },
        ],
        correctAnswer: 'B',
        marks: 5,
        explanation: 'HTTP 201 Created signifies that the request resulted in the successful creation of a new resource.',
      },
      {
        questionText: 'Which hook should be used in React for executing DOM mutations synchronously before paint?',
        options: [
          { id: 'A', text: 'useEffect' },
          { id: 'B', text: 'useLayoutEffect' },
          { id: 'C', text: 'useCallback' },
          { id: 'D', text: 'useImperativeHandle' },
        ],
        correctAnswer: 'B',
        marks: 5,
        explanation: 'useLayoutEffect runs synchronously immediately after all DOM mutations and before the browser has painted.',
      },
      {
        questionText: 'What does the bcrypt algorithm utilize to defend against rainbow table and brute-force attacks?',
        options: [
          { id: 'A', text: 'Symmetric AES encryption keys' },
          { id: 'B', text: 'A random cryptographic salt and adaptive work factor (rounds)' },
          { id: 'C', text: 'RSA asymmetric public key infrastructure' },
          { id: 'D', text: 'Two-phase commit transactions' },
        ],
        correctAnswer: 'B',
        marks: 5,
        explanation: 'bcrypt combines a random salt with an adjustable cost factor to dramatically slow down brute-force cracking.',
      },
    ];

    let q1TotalMarks = 0;
    const q1Ids = [];
    for (let i = 0; i < q1Questions.length; i++) {
      const q = await Question.create({
        ...q1Questions[i],
        quizId: quiz1._id,
        order: i + 1,
      });
      q1Ids.push(q._id);
      q1TotalMarks += q.marks;
    }
    quiz1.questions = q1Ids;
    quiz1.totalMarks = q1TotalMarks;
    await quiz1.save();

    // Quiz 2: Computer Science & Data Structures
    const quiz2 = await Quiz.create({
      title: 'Algorithm & Data Structures Master Challenge',
      description: 'Solve questions on algorithmic complexity, dynamic programming, balanced binary trees, and graph theory.',
      subject: 'Computer Science',
      duration: 20,
      startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      endDate: in30Days,
      status: 'published',
      allowRetakes: false,
      difficulty: 'Hard',
      passingPercentage: 60,
      createdBy: admin._id,
      questions: [],
      totalMarks: 0,
    });

    const q2Questions = [
      {
        questionText: 'What is the worst-case time complexity of searching an element in a standard Binary Search Tree (BST)?',
        options: [
          { id: 'A', text: 'O(log N)' },
          { id: 'B', text: 'O(1)' },
          { id: 'C', text: 'O(N)' },
          { id: 'D', text: 'O(N log N)' },
        ],
        correctAnswer: 'C',
        marks: 5,
        explanation: 'In the worst case where the BST becomes completely skewed (like a linked list), search is O(N).',
      },
      {
        questionText: 'Which algorithm is best suited for finding the shortest path in an unweighted graph?',
        options: [
          { id: 'A', text: 'Breadth-First Search (BFS)' },
          { id: 'B', text: 'Depth-First Search (DFS)' },
          { id: 'C', text: 'Floyd-Warshall Algorithm' },
          { id: 'D', text: 'Prim Algorithm' },
        ],
        correctAnswer: 'A',
        marks: 5,
        explanation: 'BFS explores nodes layer by layer, guaranteeing the shortest path in unweighted graphs in O(V + E) time.',
      },
      {
        questionText: 'What is the average time complexity of QuickSort when using randomized pivots?',
        options: [
          { id: 'A', text: 'O(N^2)' },
          { id: 'B', text: 'O(N log N)' },
          { id: 'C', text: 'O(log N)' },
          { id: 'D', text: 'O(N)' },
        ],
        correctAnswer: 'B',
        marks: 5,
        explanation: 'QuickSort runs in average O(N log N) time.',
      },
      {
        questionText: 'Which data structure is typically used to implement a LFU (Least Frequently Used) cache in O(1) time?',
        options: [
          { id: 'A', text: 'Hash Map paired with Doubly Linked Lists per frequency bucket' },
          { id: 'B', text: 'Single array with bubble sort' },
          { id: 'C', text: 'Binary Min-Heap only' },
          { id: 'D', text: 'Red-Black Tree with queue' },
        ],
        correctAnswer: 'A',
        marks: 5,
        explanation: 'Hash maps combined with doubly-linked lists per frequency count allow get and put in O(1) time.',
      },
    ];

    let q2TotalMarks = 0;
    const q2Ids = [];
    for (let i = 0; i < q2Questions.length; i++) {
      const q = await Question.create({
        ...q2Questions[i],
        quizId: quiz2._id,
        order: i + 1,
      });
      q2Ids.push(q._id);
      q2TotalMarks += q.marks;
    }
    quiz2.questions = q2Ids;
    quiz2.totalMarks = q2TotalMarks;
    await quiz2.save();

    // Quiz 3: Mathematics & Logic
    const quiz3 = await Quiz.create({
      title: 'Advanced Mathematics & Logical Reasoning Cup',
      description: 'Compete in discrete mathematics, probability distributions, matrix algebra, and combinatorial logic.',
      subject: 'Mathematics',
      duration: 15,
      startDate: now,
      endDate: in10Days,
      status: 'published',
      allowRetakes: true,
      difficulty: 'Medium',
      passingPercentage: 50,
      createdBy: admin._id,
      questions: [],
      totalMarks: 0,
    });

    const q3Questions = [
      {
        questionText: 'What is the probability of rolling a sum of 7 with two fair six-sided dice?',
        options: [
          { id: 'A', text: '1/6' },
          { id: 'B', text: '1/12' },
          { id: 'C', text: '7/36' },
          { id: 'D', text: '5/36' },
        ],
        correctAnswer: 'A',
        marks: 5,
        explanation: 'There are 6 winning combinations (1-6, 2-5, 3-4, 4-3, 5-2, 6-1) out of 36 total outcomes: 6/36 = 1/6.',
      },
      {
        questionText: 'What is the determinant of a 2x2 identity matrix?',
        options: [
          { id: 'A', text: '0' },
          { id: 'B', text: '1' },
          { id: 'C', text: '2' },
          { id: 'D', text: '-1' },
        ],
        correctAnswer: 'B',
        marks: 5,
        explanation: 'For [[1, 0], [0, 1]], det = (1 * 1) - (0 * 0) = 1.',
      },
      {
        questionText: 'If a polygon has 8 sides (octagon), how many unique diagonals can be drawn?',
        options: [
          { id: 'A', text: '16' },
          { id: 'B', text: '20' },
          { id: 'C', text: '24' },
          { id: 'D', text: '28' },
        ],
        correctAnswer: 'B',
        marks: 5,
        explanation: 'Formula for diagonals: n(n-3)/2 = 8(5)/2 = 20.',
      },
    ];

    let q3TotalMarks = 0;
    const q3Ids = [];
    for (let i = 0; i < q3Questions.length; i++) {
      const q = await Question.create({
        ...q3Questions[i],
        quizId: quiz3._id,
        order: i + 1,
      });
      q3Ids.push(q._id);
      q3TotalMarks += q.marks;
    }
    quiz3.questions = q3Ids;
    quiz3.totalMarks = q3TotalMarks;
    await quiz3.save();

    console.log('✅ Default competitions and questions created.');
    console.log('🎉 Setup successfully finished with zero dummy students!');
  } catch (error) {
    console.error('❌ Error during database initialization:', error.message);
  }
};

// If run directly from CLI (npm run seed)
if (process.argv[1] && process.argv[1].endsWith('seedService.js')) {
  import('../config/db.js').then(async ({ connectDB, disconnectDB }) => {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  });
}
