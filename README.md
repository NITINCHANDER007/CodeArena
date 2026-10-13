# CodeArena ⚔️
A modern, production-grade LeetCode-style coding practice platform built end-to-end with **TypeScript & Next.js (App Router)**.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **Backend**: Next.js API Routes (Route Handlers) in TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Submission Queue**: Redis + BullMQ
- **Code Execution Engine**: Judge0 CE (self-hosted via Docker) over HTTP
- **Authentication**: JWT (access + refresh tokens in `httpOnly` secure cookies), bcrypt password hashing
- **Email Service**: Nodemailer (SMTP with automated local development Ethereal preview links)
- **Validation**: Zod
- **Supported Languages**: JavaScript, C++, Java (*Strictly NO Python*)

---

## 📁 Folder Structure

```text
codearena/
├── docker-compose.yml          # PostgreSQL 16, Redis 7, Judge0 Server, Worker & DB
├── judge0.conf                 # Sandbox CPU, Memory, and Network limits configuration
├── prisma/
│   ├── schema.prisma           # Full schema with 11 models, enums & relations
│   └── seed.ts                 # TS Seed script (Admin, 5 problems, test cases)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with AuthProvider & Navbar
│   │   ├── globals.css         # Dark-mode theme, custom scrollbars
│   │   ├── page.tsx            # Home landing page with metrics & CTAs
│   │   ├── problems/
│   │   │   ├── page.tsx        # Problems list (search, filters, tags, pagination)
│   │   │   └── [slug]/page.tsx # Split Monaco editor, testcases, run & submit
│   │   ├── profile/
│   │   │   └── [username]/     # Profile page with difficulty stats & streak
│   │   ├── leaderboard/page.tsx# Global leaderboard with top 3 podium
│   │   ├── login/page.tsx      # Sign In (remember me, lockout warning)
│   │   ├── signup/page.tsx     # Sign Up with live password strength meter
│   │   ├── verify-email/       # Email verification landing page
│   │   ├── forgot-password/    # Password reset link request form
│   │   ├── reset-password/     # Single-use token password reset form
│   │   ├── admin/              # ADMIN role only area
│   │   │   ├── layout.tsx      # Admin sidebar layout with RBAC protection
│   │   │   ├── page.tsx        # Dashboard (KPIs, acceptance rate, charts)
│   │   │   ├── problems/       # Problems management table
│   │   │   │   ├── new/        # Problem creation form with starter codes
│   │   │   │   └── [id]/
│   │   │   │       ├── edit/   # Edit problem form
│   │   │   │       └── testcases/ # Sample vs Hidden test case manager
│   │   │   ├── users/page.tsx  # User list, role toggle, ban/unban modal
│   │   │   ├── submissions/    # Global submissions auditor
│   │   │   └── settings/page.tsx # Tag & Language manager
│   │   └── api/                # Production Backend REST Handlers
│   │       ├── auth/           # signup, login, refresh, logout, me, verify, reset
│   │       ├── admin/          # stats, problems, testcases, users, tags, languages
│   │       ├── problems/       # search, problem detail, problem submissions
│   │       ├── submissions/    # run, submit, status poll
│   │       ├── leaderboard/    # ranked leaderboard
│   │       └── users/          # profile stats & streak
│   ├── components/
│   │   ├── Navbar.tsx          # Top navigation with user dropdown & admin link
│   │   └── admin/
│   │       └── ProblemForm.tsx # Reusable problem create & edit form
│   ├── context/
│   │   └── AuthContext.tsx     # Client-side user auth state provider
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── redis.ts            # Redis client wrapper
│   │   ├── queue.ts            # BullMQ submission queue producer
│   │   ├── judge0.ts           # Judge0 HTTP client + local JS runner fallback
│   │   ├── submissionProcessor.ts # Testcase evaluator
│   │   ├── tokens.ts           # JWT sign/verify & httpOnly cookie settings
│   │   ├── password.ts         # bcrypt hash and verify helpers
│   │   ├── rateLimit.ts        # Rate limiter & account lockout logic
│   │   ├── email.ts            # Nodemailer email verification & reset
│   │   └── validations/
│   │       └── auth.ts         # Zod schemas for credentials
│   ├── middleware.ts           # Next.js route protection & Admin RBAC
│   └── worker/
│       └── submissionWorker.ts # Dedicated BullMQ submission consumer
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started & Setup

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **Docker & Docker Compose**: For PostgreSQL, Redis, and Judge0

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the following default values match your environment:
```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codearena?schema=public"
REDIS_URL="redis://localhost:6379"
JUDGE0_URL="http://localhost:2358"
JUDGE0_API_KEY=""
JWT_ACCESS_SECRET="codearena_dev_access_secret_key_needs_to_be_long_and_secure_123"
JWT_REFRESH_SECRET="codearena_dev_refresh_secret_key_needs_to_be_long_and_secure_456"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Start Database, Redis & Judge0
Launch the containers via Docker Compose:
```bash
docker compose up -d
```
This starts:
- **PostgreSQL 16** on `localhost:5432`
- **Redis 7** on `localhost:6379`
- **Judge0 Server & Workers** on `localhost:2358`

### 4. Push Schema & Seed Initial Data
Run the Prisma push and TypeScript seed script:
```bash
# Push schema to PostgreSQL
npm run prisma:push

# Seed Admin user, sample problems, test cases, and tags
npm run prisma:seed
```

### 5. Start the Application
Start the Next.js development server:
```bash
npm run dev
```

### 6. (Optional) Run the Submission Queue Worker
In a separate terminal, launch the BullMQ background worker:
```bash
npm run worker
```
*(Note: CodeArena includes automatic synchronous fallback processing, so the platform can evaluate submissions even if the worker is not running separately).*

---

## 🔑 Default Accounts (from Seed)

### Admin Account
- **Username**: `admin`
- **Email**: `admin@codearena.dev`
- **Password**: `AdminPassword123!`
- **Role**: `ADMIN` (Access to `/admin`)

### Regular Coder Account
- **Username**: `johncoder`
- **Email**: `coder@codearena.dev`
- **Password**: `UserPassword123!`
- **Role**: `USER`

---

## 🧩 Seeded Problems
1. **Two Sum** (Easy) — Array, Hash Table
2. **Valid Parentheses** (Easy) — String, Stack
3. **Longest Substring Without Repeating Characters** (Medium) — Hash Table, String, Sliding Window
4. **Container With Most Water** (Medium) — Array, Two Pointers
5. **Trapping Rain Water** (Hard) — Array, Two Pointers, Dynamic Programming

---

## 🔒 Security Features
- **httpOnly Cookies**: Access tokens (15-min expiry) and Refresh tokens (7-day expiry) stored in httpOnly cookies, immune to XSS token theft.
- **Account Lockout**: 5 consecutive failed login attempts trigger a 15-minute account lockout.
- **Hidden Test Case Protection**: Only sample test cases are served to users; evaluation test cases are strictly kept server-side.
- **RBAC**: Next.js Middleware and API route handlers guard `/admin` and `/api/admin/*`. Non-admin users are strictly blocked.
- **Isolated Sandbox**: User code is executed via Judge0 with CPU, memory, and timeout constraints. No Python execution.
