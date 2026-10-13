# CodeArena ⚔️

> A modern, production-grade LeetCode clone and coding practice platform built end-to-end with **Next.js (App Router)** and **TypeScript**.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-VS_Code_Core-007ACC?style=for-the-badge&logo=visualstudiocode)](https://microsoft.github.io/monaco-editor/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

---

## ✨ Features at a Glance

### 💻 Monaco Code Editor & Multi-Language Support
- Full-featured VS Code-style editor powered by **Monaco Editor**.
- **9 Programming Languages**: Solve problems in **Python 3, JavaScript, TypeScript, C++, C, Java, Go, Rust, or C#**.
- **Execution Sandbox**: Fast remote compilation and execution via Judge0 CE with instant fallback support.
- **Shortcuts & UX**: Run (`Ctrl+Enter`), Submit (`Ctrl+Shift+Enter`), format code, and full-screen toggle.

### 🎯 Authentic LeetCode Experience
- **📅 Daily Coding Challenge**: Fresh daily problems, streak tracking, coin rewards, and countdown timers.
- **🔀 "Pick One" Random Problem**: Shuffle button to instantly jump into a surprise coding challenge.
- **📚 Curated Study Plans**: Interactive roadmaps for **Top Interview 150**, **Blind 75**, **LeetCode 75**, and **Dynamic Programming Mastery**.
- **🏢 Company Tags & Filters**: Filter problems asked by **Google**, **Meta**, **Amazon**, **Microsoft**, **Apple**, and **Uber**.
- **⏱️ Interview Stopwatch**: Built-in timer to simulate real-world technical interview pressure.
- **📊 Runtime & Memory Distributions**: See how your solution compares with "Beats X% in Runtime" and "Beats Y% in Memory" metrics.
- **💡 Hints & Editorial**: Progressive spoiler-protected hints and step-by-step complexity breakdowns.

### ⚔️ Contest Arena (`/contest`)
- Compete in **Weekly** and **Biweekly** rated algorithmic rounds.
- Live countdown timers, registration toggles, and **Virtual Contest** replay mode.
- ELO-style rating tiers: **Knight**, **Master**, and **Grandmaster**.

### 💬 Discuss Community Forum (`/discuss`)
- Share and explore real interview questions, compensation breakdowns, and algorithmic approaches.
- Upvote system, category filtering, search, and clean rich-text authoring.

### 🛡️ Admin Portal (`/admin`)
- **Problem Management**: Create and edit problem descriptions, constraints, hints, editorials, and starter code.
- **Test Case Manager**: Configure sample (visible) vs hidden test cases with custom inputs/outputs.
- **User Management**: Inspect users, switch roles, and ban/unban accounts.
- **Submission Auditor**: Live view of submissions across all users.

### 🔐 Secure Authentication & RBAC
- JWT access and refresh tokens stored in secure `httpOnly` cookies.
- Password strength meter, bcrypt hashing, and rate-limited login with account lockout protection.
- Email verification and password reset flows with single-use tokens.

---

## 🚀 Quick Start (Run Locally in 3 Steps)

### 1. Clone the repository
```bash
git clone https://github.com/NITINCHANDER007/CodeArena.git
cd CodeArena
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the application
```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

> 💡 **Tip:** CodeArena runs instantly with a pre-configured local SQLite database (`dev.db`). No external database setup required to start exploring!

---

## 🔑 Demo Accounts

Use these pre-seeded accounts to test user and admin features:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@codearena.dev` | `AdminPassword123!` | Full access to `/admin` dashboard & problem editor |
| **Candidate** | `coder@codearena.dev` | `UserPassword123!` | Standard problem-solving & contest participation |

---

## 🛠️ Tech Stack Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons |
| **Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Backend & API** | Next.js API Routes (Route Handlers in TypeScript) |
| **Database** | SQLite (Instant Local) / PostgreSQL 16 (Production) via Prisma ORM |
| **Queue & Worker** | Redis + BullMQ for asynchronous background submission processing |
| **Code Execution** | Judge0 CE (self-hosted via Docker) over HTTP |
| **Authentication** | JWT (`jose`), `httpOnly` Cookies, `bcryptjs` |
| **Validation** | Zod |

---

## 🐳 Production Deployment with Docker (Optional)

If you wish to spin up the complete self-hosted stack (PostgreSQL, Redis, and Judge0 code runner):

```bash
# Start PostgreSQL, Redis, and Judge0
docker-compose up -d

# Sync Prisma Schema
npx prisma db push

# Seed problems & languages
npm run prisma:seed

# Start development server
npm run dev
```

---

## 📁 Project Structure

```text
CodeArena/
├── prisma/
│   ├── schema.prisma        # Database models & relationships
│   └── seed.ts              # Problem seeds & starter code
├── src/
│   ├── app/
│   │   ├── admin/           # Admin dashboard, problem & test case manager
│   │   ├── api/             # REST API route handlers
│   │   ├── contest/         # Weekly & biweekly contests page
│   │   ├── discuss/         # Community discussion forum
│   │   ├── leaderboard/     # Global rank leaderboard
│   │   ├── problems/        # Problems list & split Monaco workspace
│   │   ├── profile/         # User stats, streak & submission history
│   │   └── (auth)/          # Login, signup, password reset pages
│   ├── components/          # Reusable UI components & Navbar
│   ├── context/             # Global AuthContext provider
│   └── lib/                 # Judge0 runner, Prisma client, JWT & queue
├── docker-compose.yml       # Production services (Postgres, Redis, Judge0)
└── judge0.conf              # Sandbox security & resource limit configuration
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check out the [issues page](https://github.com/NITINCHANDER007/CodeArena/issues).

---

## 📝 License

This project is licensed under the **MIT License**.
