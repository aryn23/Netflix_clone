# 🎬 Netflix Clone — Full-Stack Web Application

A Netflix-inspired web application built with React, Express.js, and MySQL featuring real user authentication and a personalized watchlist.

![Netflix Clone](https://img.shields.io/badge/Netflix-Clone-E50914?style=for-the-badge&logo=netflix&logoColor=white)

## 🚀 Tech Stack

| Layer      | Technology        |
|------------|-------------------|
| Frontend   | React 18 + Vite   |
| Styling    | Plain CSS         |
| Backend    | Express.js (Node) |
| Database   | MySQL             |
| Auth       | JWT + bcrypt      |

## 📋 Features

- **Landing Page** — Netflix-style hero banner, horizontal movie rows by genre
- **User Authentication** — Secure signup/login with bcrypt password hashing & JWT tokens
- **Protected Dashboard** — Personalized view accessible only after login
- **Watchlist CRUD** — Add/remove movies from your personal watchlist with database persistence
- **Responsive Design** — Works on desktop, tablet, and mobile

## 🛠️ Prerequisites

- **Node.js** v18+
- **MySQL** server running locally (or remote connection details)

## ⚡ Quick Start

### 1. Clone & Install

```bash
cd "HTB TASK"
npm run install:all
```

### 2. Configure MySQL

Create a `.env` file in the `server/` directory (copy from `.env.example`):

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=netflix_clone
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

> **Note**: The app will automatically create the `netflix_clone` database and required tables on first startup.

### 3. Run in Development Mode

Start the backend and frontend separately:

```bash
# Terminal 1 — Backend (port 5000)
npm run dev:server

# Terminal 2 — Frontend (port 5173)
npm run dev:client
```

Open `http://localhost:5173` in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

Open `http://localhost:5000` in your browser.

## 📡 API Endpoints

### Authentication

| Method | Endpoint          | Body                                  | Auth | Response            |
|--------|-------------------|---------------------------------------|------|---------------------|
| POST   | `/api/auth/signup` | `{ username, email, password }`      | No   | `{ token, user }`   |
| POST   | `/api/auth/login`  | `{ email, password }`                | No   | `{ token, user }`   |
| GET    | `/api/auth/me`     | —                                    | Yes  | `{ user }`          |

### Movies

| Method | Endpoint       | Auth | Response         |
|--------|----------------|------|------------------|
| GET    | `/api/movies`  | No   | `{ movies: [] }` |

### Watchlist

| Method | Endpoint                  | Body           | Auth | Response              |
|--------|---------------------------|----------------|------|-----------------------|
| GET    | `/api/watchlist`          | —              | Yes  | `{ watchlist: [] }`   |
| POST   | `/api/watchlist`          | `{ movieId }`  | Yes  | `{ message }`         |
| DELETE | `/api/watchlist/:movieId` | —              | Yes  | `{ message }`         |

## 🗄️ Database Schema

### users
| Column        | Type          | Constraints            |
|---------------|---------------|------------------------|
| id            | INT           | PK, AUTO_INCREMENT     |
| username      | VARCHAR(100)  | NOT NULL               |
| email         | VARCHAR(255)  | UNIQUE, NOT NULL       |
| password_hash | VARCHAR(255)  | NOT NULL               |
| created_at    | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP |

### watchlist
| Column    | Type        | Constraints                              |
|-----------|-------------|------------------------------------------|
| id        | INT         | PK, AUTO_INCREMENT                       |
| user_id   | INT         | FK → users(id) ON DELETE CASCADE         |
| movie_id  | VARCHAR(50) | NOT NULL                                 |
| added_at  | TIMESTAMP   | DEFAULT CURRENT_TIMESTAMP                |
|           |             | UNIQUE KEY (user_id, movie_id)           |

## 🔒 Security

- Passwords hashed with **bcrypt** (10 salt rounds) — never stored in plaintext
- **JWT tokens** with 7-day expiry for session management
- **Parameterized SQL queries** prevent SQL injection
- **CORS** restricted to known origins
- **Protected routes** enforce auth on both server and client

## 🚢 Deployment

### Heroku

```bash
heroku create your-netflix-clone
heroku addons:create jawsdb:kitefin  # MySQL addon
git push heroku main
```

### Railway / Render

1. Connect your GitHub repo
2. Add MySQL service
3. Set environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET)
4. Deploy — the app will auto-build and serve from port specified in PORT env var

## 📄 License

MIT
