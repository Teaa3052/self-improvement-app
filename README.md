# Self-Improvement App

**Live demo:** [self-improvement-app-kqb0.onrender.com](https://self-improvement-app-kqb0.onrender.com) (free hosting, so the first load can take up to a minute)

![Dashboard](docs/Dashboard.png)

A full-stack web application for personal growth. It tracks daily, weekly and monthly habits with streaks and stats. A journal and plans are next.

Built as a learning project. Progress is tracked in [docs/ROADMAP.md](docs/ROADMAP.md).

## Tech Stack

**Frontend:** React (Vite), React Router, react-hook-form, axios, Tailwind CSS, shadcn/ui

**Backend:** Node.js, Express 5, PostgreSQL (`pg`, plain SQL), node-pg-migrate, zod, JWT, bcrypt, cookie-parser, helmet

## Project Structure

```
├── backend/
│   ├── migrations/      # database schema changes (SQL, run with node-pg-migrate)
│   ├── routes/          # URL → middleware → controller
│   ├── middleware/      # requireAuth, validate, errorHandler
│   ├── schemas/         # zod validation rules
│   ├── controllers/     # request handling logic
│   ├── models/          # SQL queries
│   ├── utils/           # AppError, date, streak and stats helpers
│   ├── config.js        # the only place that reads .env
│   ├── database.js      # PostgreSQL connection pool
│   └── app.js           # Express app and middleware order
│   └── server.js       # starts the server (listen)
├── frontend/
│   └── src/
│       ├── api/         # axios client
│       ├── context/     # AuthContext (who is logged in)
│       ├── layouts/     # AppLayout (sidebar + page)
│       ├── components/  # shared components (ui/ = shadcn)
│       ├── hooks/       # use-mobile (is the screen narrow)
│       ├── lib/         # app name, shadcn helper
│       ├── pages/       # one component per page
│       └── utils/       # ProtectedRoutes, calendar and date helpers
└── docs/
    └── ROADMAP.md
```

## Setup

### Prerequisites

- Node.js 22.12 or later
- PostgreSQL 14 or later
- Git

### 1. Database

Connect to PostgreSQL as an admin user (e.g. `postgres`) and create a dedicated user and database for the app:

```sql
CREATE ROLE selfimprovement_app LOGIN PASSWORD 'choose_a_password';
CREATE DATABASE selfimprovement_dev OWNER selfimprovement_app;
```

### 2. Backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and fill in the values:

```env
DATABASE_URL=postgres://selfimprovement_app:choose_a_password@localhost:5432/selfimprovement_dev
JWT_SECRET=a-long-random-string
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

Generate a strong `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Create the tables, then start the server:

```bash
npm run migrate up
npm run dev
```

The backend runs on `http://localhost:3000`. `npm run dev` restarts automatically when a file changes.

### 3. Frontend

```bash
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env` (default: `VITE_API_URL=http://localhost:3000`), then:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`.

## Authentication Flow

1. **Register:** the frontend sends nickname, email and password. The backend validates them (zod), hashes the password (bcrypt) and stores the user.
2. **Login:** the backend checks the password and puts a signed JWT in an **httpOnly cookie**. JavaScript can't read it, so an injected script can't steal it.
3. **Every request:** the browser sends the cookie automatically. The `requireAuth` middleware verifies it and sets `req.user`.
4. **App load:** the frontend calls `GET /api/auth/me` to find out who is logged in (`AuthContext`).
5. **Logout:** the backend clears the cookie.

## API

| Method | Path                                           | Auth | Description                                                                         |
| ------ | ---------------------------------------------- | ---- | ----------------------------------------------------------------------------------- |
| POST   | `/api/auth/register`                           | no   | Create an account (`email`, `password`, `nickname`)                                 |
| POST   | `/api/auth/login`                              | no   | Log in (`email`, `password`), sets the `token` cookie                               |
| GET    | `/api/auth/me`                                 | yes  | Current user                                                                        |
| POST   | `/api/auth/logout`                             | no   | Clear the `token` cookie                                                            |
| GET    | `/api/habits?today=YYYY-MM-DD&from=YYYY-MM-DD` | yes  | Active habits with streak, done-in-period status and log dates (`from` is optional) |
| POST   | `/api/habits`                                  | yes  | Create a habit (`name`, `frequency`: daily, weekly or monthly)                      |
| PUT    | `/api/habits/:id/logs/:date`                   | yes  | Mark a habit as done for that date                                                  |
| DELETE | `/api/habits/:id/logs/:date`                   | yes  | Remove the mark for that date                                                       |
| DELETE | `/api/habits/:id`                              | yes  | Archive a habit (history is kept)                                                   |
| GET    | `/api/stats?today=YYYY-MM-DD`                  | yes  | Stats for the last 30 days: summary and per-habit results                           |

All errors are returned as JSON: `{ "message": "...", "errors": [{ "field": "...", "message": "..." }] }` (`errors` only for validation errors).

## Features

**Done**

- Registration and login with validation on both frontend and backend
- Cookie-based JWT authentication, protected routes, logout
- Landing page with an interactive demo (try the habit grid without an account)
- Daily, weekly and monthly habits
- Dashboard with a monthly calendar for each daily habit and a period grid for weekly and monthly ones, with month navigation
- Check off and uncheck any day or period, including past ones
- Streaks for daily habits
- Archiving habits (history is kept)
- Stats for the last 30 days: summary, completion rate per habit, best streak, day grid for daily habits
- Separate mobile dashboard (last 5 days, weeks and months, progress ring)
- App layout with sidebar, 404 page

**Planned**

- Habits page: rename habits, list of archived habits
- Journal with notebooks, images and video
- Plans and goals with steps
- Calendar
- Selective sharing with other users
- Installable PWA

## Author

Tea

## License

This project is for educational purposes.
