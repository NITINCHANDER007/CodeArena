# CodeArena

A full-stack competitive programming and interview preparation platform inspired by LeetCode, built with Next.js (App Router), TypeScript, Monaco Editor, and Judge0.

---

## Overview

CodeArena is an end-to-end coding practice platform where candidates can solve algorithmic problems in 9 programming languages, get instant feedback against hidden test suites, and track progress through study plans and mock contests.

The entire web application and backend are written in TypeScript with zero external database dependencies required for local development.

---

## Key Features

### Problem Solving & Monaco Workspace
- **Monaco Editor integration**: VS Code core directly in the browser with auto-closing brackets, syntax highlighting, and theme support.
- **9 supported languages**: Python 3, JavaScript, TypeScript, C++, C, Java, Go, Rust, and C#.
- **Sub-second test evaluation**: Code executes against both sample and hidden test cases with configurable time and memory limits.
- **Editor shortcuts**: `Ctrl + Enter` to run sample cases, `Ctrl + Shift + Enter` to submit.
- **Interview tools**: Integrated stopwatch, spoiler-protected hints, and detailed editorial solutions.
- **Benchmark distributions**: Visual breakdown showing how solutions rank against other submissions in runtime and memory ("Beats X%").

### LeetCode-Inspired Ecosystem
- **Daily Coding Challenge**: Rotating daily challenge problem with streak tracking and coin rewards.
- **Pick One**: Random problem shuffle to practice unfamiliar topics under time constraints.
- **Curated Study Plans**: Pre-configured tracks including Top Interview 150, Blind 75, LeetCode 75, and Dynamic Programming.
- **Company filtering**: Filter questions asked by Google, Meta, Amazon, Microsoft, Apple, and Uber.
- **Contest Arena**: Weekly and biweekly mock contests with rating updates and virtual participation mode.
- **Discuss Forum**: Community section for interview debriefs, compensation breakdowns, and solution discussions.

### Admin Dashboard (`/admin`)
- Problem authoring with markdown descriptions, starter code snippets, hints, and editorials.
- Test case manager with sample vs hidden test flags.
- User management with role switching (User / Admin) and account ban/unban controls.
- Global submission audit log.

### Authentication & Security
- Access and refresh tokens stored in secure `httpOnly` cookies.
- Passwords hashed with bcrypt and validated against minimum entropy rules.
- Account lockout mechanism: locks accounts for 15 minutes after 5 consecutive failed login attempts.
- Email verification and password reset workflows via single-use signed tokens.

---

## Tech Stack

| Component | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS |
| Code Editor | `@monaco-editor/react` |
| Backend | Next.js Route Handlers (TypeScript) |
| Database | SQLite (Local Dev) / PostgreSQL (Production) via Prisma ORM |
| Code Execution | Judge0 CE over HTTP with local sandboxed fallback runner |
| Queue | Redis + BullMQ for asynchronous submission workers |
| Authentication | JWT (`jose`), `httpOnly` cookies, `bcryptjs` |
| Validation | Zod |

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm or pnpm

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/NITINCHANDER007/CodeArena.git
   cd CodeArena
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000).

> **Note**: A pre-seeded local database is already configured, so you can test all candidate and admin workflows immediately without spinning up Docker or PostgreSQL.

---

## Default Test Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| Admin | `admin@codearena.dev` | `AdminPassword123!` | Full access to `/admin` dashboard & problem editor |
| User | `coder@codearena.dev` | `UserPassword123!` | Problem workspace, submissions, contest arena |

---

## Production Setup with Docker (Optional)

To run the complete production infrastructure with self-hosted PostgreSQL, Redis, and Judge0:

```bash
# 1. Start containers
docker-compose up -d

# 2. Push database schema & seed
npx prisma db push
npm run prisma:seed

# 3. Start Next.js application
npm run dev
```

---

## Project Structure

```text
CodeArena/
├── src/
│   ├── app/
│   │   ├── admin/           # Admin dashboard (problems, test cases, users)
│   │   ├── api/             # REST API route handlers
│   │   ├── contest/         # Weekly & biweekly contest arena
│   │   ├── discuss/         # Community discussion forum
│   │   ├── problems/        # Problem catalog & split Monaco workspace
│   │   ├── profile/         # User statistics & submission history
│   │   └── (auth)/          # Authentication (login, signup, reset password)
│   ├── components/          # Reusable UI components & navigation
│   ├── context/             # Global AuthContext provider
│   └── lib/                 # Judge0 client, Prisma singleton, JWT & queue utils
├── prisma/
│   ├── schema.prisma        # Database schema definition
│   └── seed.ts              # Seed script for problems, test cases, and tags
├── docker-compose.yml       # Production services (PostgreSQL, Redis, Judge0)
└── judge0.conf              # Sandbox execution limits & configuration
```

---

## License

This project is licensed under the MIT License.
