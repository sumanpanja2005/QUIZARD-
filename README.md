# 🏆 QUIZARD — Online Quiz Competition & Student Ranking Platform

**QUIZARD** is a modern, responsive, full-stack online quiz competition and ranking platform built with **React (Vite)**, **Tailwind CSS**, **Node.js**, **Express.js**, and **MongoDB Atlas**. Students can register, log in, participate in timed quiz competitions, view real-time score evaluations, inspect answers and detailed explanations, and compete on dynamic global and competition-specific leaderboards. Administrators have a dedicated command center to manage competitions, dynamically construct questions, track student accounts, and inspect submissions.

---

## 📌 Technology Stack

- **Frontend:**
  - **React 18** (Vite build tool)
  - **Tailwind CSS** (Custom education-tech design system, Indigo primary palette)
  - **React Router DOM v6** (Nested routes, layout management, protected & admin route guards)
  - **Axios** (API layer with JWT interceptors)
  - **Lucide React** (Clean modern iconography)
  - **Canvas Confetti** (Celebratory animations upon quiz completion)
- **Backend:**
  - **Node.js & Express.js** (REST API architecture)
  - **JWT (JSON Web Tokens)** (Stateless secure authentication)
  - **bcryptjs** (Cryptographic password hashing)
  - **Helmet & Express Rate Limit** (Security headers & authentication rate limiting)
  - **Mongoose & MongoDB Atlas** (Robust document schemas, indexes, and automated zero-configuration development fallback engine)

---

## 🔑 Administrator Account

On initial boot, the backend automatically seeds a fully functional administrator account with zero dummy students:

### 👑 Administrator Credentials
- **Email:** `admin@quizard.com`
- **Username:** `admin`
- **Password:** `AdminPassword123!`
- **Role:** `admin`
- **Portal URL:** `/admin/login` (A 1-click button is provided on the page to auto-fill these administrator credentials during evaluation)

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+)
- **MongoDB Compass** (for viewing the database visually on localhost or Atlas)

### 2. Database Options

#### 🧭 Option A: View in MongoDB Compass (Localhost — Recommended for Instant Local Testing)
When the server starts, it automatically provides a persistent local MongoDB instance on port **`27017`** with WiredTiger disk storage (`server/data/db`).
1. Open **MongoDB Compass**.
2. In the "New Connection" field, paste:
   ```text
   mongodb://localhost:27017
   ```
   *(or `mongodb://127.0.0.1:27017`)*
3. Click **Connect**.
4. You will immediately see the **`quizard`** database with all collections:
   - `users` (All registered student accounts)
   - `quizzes` (All active quiz competitions)
   - `questions` (All questions with 4 options and marks)
   - `quizattempts` (Student submission scores, percentages, and answers)

#### ☁️ Option B: MongoDB Atlas (Cloud Database)
To save data directly to your MongoDB Atlas cloud cluster:
1. Open [MongoDB Atlas](https://cloud.mongodb.com/).
2. Under **Security -> Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)**. *(Crucial: Without this, Atlas blocks all connections with DNS/timeout errors!)*
3. Under **Database -> Connect -> Drivers (Node.js)**, copy your connection string.
4. Paste it into `server/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<your-cluster>.mongodb.net/quizard?retryWrites=true&w=majority
   ```
   *(The server will automatically route data to the `quizard` database).*

### 3. Backend Setup (`server/`)
```bash
cd server
npm install
```

Start the backend server:
```bash
npm start
# Server boots on http://localhost:5000 (API at http://localhost:5000/api)
```

Run automated backend test suite:
```bash
npm test
```

### 4. Frontend Setup (`client/`)
In a separate terminal:
```bash
cd client
npm install
npm run dev
# Vite development server starts on http://localhost:5173
```

To build for production:
```bash
npm run build
```

---

## 🌟 Key Application Features

### 1. Student Experience
- **Interactive Landing Page:** Hero section (*"Challenge Your Knowledge. Compete. Win!"*), feature showcases, live competitions preview, and Hall of Fame podium for top 3 students.
- **Secure Registration & Login:** Email/username authentication with instant token storage and password confirmation.
- **Student Dashboard:** Personalized overview displaying quizzes attempted, points earned, average accuracy percentage, current global ranking, and recent quiz history.
- **Available Competitions:** Filter by subject category (Web Development, Computer Science, Mathematics, Science, General Knowledge) or search by keyword.
- **Timed Live Quiz Engine:**
  - Multiple-choice questions with 4 options.
  - Interactive Question Palette displaying answered vs unanswered questions and 1-click jump navigation.
  - Live synchronized countdown timer with color-coded urgency indicators.
  - **Automated Submission:** Automatically finalizes and submits answers when the timer reaches zero.
  - Retake prevention (enforces single submission unless explicitly allowed by administrator).
- **Post-Submission Scorecard & Review:** Displays earned score, percentage, competition rank, and reveals complete answer keys with explanations for post-quiz learning.
- **Global & Competition Leaderboards:** Top 3 podium display (Gold, Silver, Bronze) and paginated standings with time-based tiebreakers.
- **Profile Customization:** Update name, institution, bio, and change password.

### 2. Administrator Command Center
- **Overview Dashboard:** Total registered students, total competitions, question counts, and submission metrics.
- **Competition Management:** Create, edit, and delete competitions; configure duration in minutes, start/end dates, passing percentages, and publish/unpublish statuses.
- **Dynamic Question Builder:** Add multiple-choice questions with 4 options, marks, correct answer selector, and explanations without page reload.
- **Student Directory:** View registered students, track their performance metrics, and toggle account activation status (block/unblock).
- **Submissions Inspector:** Review every completed submission across all competitions with full question-by-question answer breakdowns.

---

## 🔒 Security Architecture

1. **Zero Answer Leakage:** When students request active quiz questions, the backend completely sanitizes and removes `correctAnswer` and `explanation` from the response payload.
2. **Server-Side Scoring:** Scores are never calculated or trusted from the client. The server verifies each answer against the database and computes marks.
3. **Cryptographic Protection:** Passwords hashed with `bcryptjs` using 10 salt rounds.
4. **JWT Authentication & Role-Based Authorization:** Strict middleware guards (`protect`, `isAdmin`, `isStudent`) enforce endpoint access.
5. **Rate Limiting:** Protects `/api/auth` endpoints from brute-force attempts.
6. **Tiebreaker Logic:** Students with identical points are ranked by lowest average completion time.

---

## 📁 Project Folder Structure

```
Quiz Competition/
├── client/                     # Frontend Application (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/         # Reusable UI components (Navbar, Footer, Timer, Palette, Modal, etc.)
│   │   ├── context/            # Authentication context and provider
│   │   ├── hooks/              # Custom React hooks (useAuth, useQuizTimer)
│   │   ├── layouts/            # Page layouts (MainLayout, StudentLayout, AdminLayout)
│   │   ├── pages/              # 16 complete application pages
│   │   ├── services/           # Axios API services
│   │   ├── utils/              # Formatting and helper utilities
│   │   ├── App.jsx             # Route definitions and route guards
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Tailwind base styles and custom scrollbar
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── .env.example
│
├── server/                     # Backend API (Node.js + Express + Mongoose)
│   ├── config/                 # Database configuration (Atlas + auto-fallback)
│   ├── controllers/            # REST API route controllers
│   ├── middleware/             # Auth, role authorization, rate limit, error handlers
│   ├── models/                 # Mongoose schemas (User, Quiz, Question, QuizAttempt)
│   ├── routes/                 # Express route definitions
│   ├── services/               # Scoring, ranking, and seed services
│   ├── test-api.js             # Comprehensive 13-test automated test suite
│   ├── server.js               # Express application entry point
│   ├── package.json
│   └── .env.example
│
└── README.md                   # Complete documentation & credentials
```

---

## 🌐 REST API Endpoints

### Authentication
- `POST /api/auth/register` — Student account registration
- `POST /api/auth/login` — Student / User login
- `POST /api/auth/admin/login` — Dedicated administrator login
- `GET /api/auth/me` — Current authenticated user profile

### Students
- `GET /api/students/profile` — Get profile and ranking stats
- `PUT /api/students/profile` — Update name, bio, institution, or password
- `GET /api/students/dashboard` — Student metrics, available quizzes, and recent history

### Quizzes
- `GET /api/quizzes` — Browse published quizzes (or all for admin)
- `GET /api/quizzes/:id` — Get quiz details (questions sanitized for students)
- `POST /api/quizzes` — [Admin] Create new competition
- `PUT /api/quizzes/:id` — [Admin] Update competition
- `DELETE /api/quizzes/:id` — [Admin] Delete competition and associated records
- `POST /api/quizzes/:id/questions` — [Admin] Add question dynamically
- `PUT /api/quizzes/:id/questions/:questionId` — [Admin] Update question
- `DELETE /api/quizzes/:id/questions/:questionId` — [Admin] Delete question

### Quiz Attempts
- `POST /api/attempts/start` — Start or resume quiz attempt
- `POST /api/attempts/submit` — Submit answers and compute scores
- `GET /api/attempts/my-attempts` — Student's completed attempts
- `GET /api/attempts/:id/result` — Full scorecard with question review

### Leaderboard
- `GET /api/leaderboard` — Global student leaderboard with top 3 podium
- `GET /api/leaderboard/:quizId` — Competition-specific rankings

### Admin
- `GET /api/admin/dashboard` — High-level platform statistics
- `GET /api/admin/students` — Student directory with performance metrics
- `PUT /api/admin/students/:id/status` — Toggle student activation (active/blocked)
- `GET /api/admin/submissions` — All competition submissions and review details

---

## 📄 License
This project is open-source and available under the **MIT License**.
