# TaskFlow — Task Management System

A full-stack Task Management System built with **React.js**, **Python Flask**, and **SQLite**, featuring JWT-based user authentication and a clean, responsive UI.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Optional Enhancements Implemented](#optional-enhancements-implemented)

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React.js 18, React Router v6, Axios             |
| Backend    | Python 3.10+, Flask, Flask-SQLAlchemy, Flask-JWT-Extended |
| Database   | SQLite (via SQLAlchemy ORM)                     |
| Auth       | JWT (JSON Web Tokens), Werkzeug password hashing |
| Styling    | Custom CSS (dark theme, responsive)             |

---

## Features

- **User Authentication** — Register, Login, Logout with JWT tokens (24-hour expiry)
- **Full CRUD** — Create, Read, Update, Delete tasks
- **Inline Toggle** — Mark tasks as complete/incomplete with a single click
- **Task Priority** — Low / Medium / High priority with color-coded badges
- **Filter View** — Filter tasks by All / Active / Completed
- **Stats Dashboard** — Live count of total, active, and completed tasks
- **Protected Routes** — Unauthenticated users are redirected to Login
- **Input Validation** — Both client-side (React) and server-side (Flask)
- **Error Handling** — Clear error messages for API failures and invalid tokens
- **Responsive Design** — Works on mobile, tablet, and desktop

---

## Project Structure

```
task-management-system/
├── backend/
│   ├── app.py              # Flask application (models + all routes)
│   ├── requirements.txt    # Python dependencies
│   └── taskmanager.db      # SQLite database (auto-created on first run)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── api/
│       │   └── axios.js            # Axios instance with JWT interceptors
│       ├── components/
│       │   └── Navbar.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── TaskList.jsx
│       │   ├── NewTask.jsx
│       │   └── EditTask.jsx
│       ├── App.jsx                 # Router + protected route guards
│       ├── App.css                 # Global styles
│       └── index.js
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm

---

### Backend Setup

```bash
# 1. Navigate to backend folder
cd backend

# 2. Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the Flask server
python app.py
```

The backend will start at **http://localhost:5000**

> The SQLite database (`taskmanager.db`) is created automatically on first run.

---

### Frontend Setup

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm start
```

The React app will open at **http://localhost:3000**

> The `"proxy": "http://localhost:5000"` in `package.json` handles CORS in development automatically.

---

## API Documentation

**Base URL:** `http://localhost:5000`

All task routes require the `Authorization: Bearer <token>` header.

---

### Auth Routes

#### POST `/register`
Register a new user.

**Request Body:**
```json
{
  "username": "hemanth",
  "password": "secret123"
}
```

**Success Response `201`:**
```json
{ "message": "User registered successfully" }
```

**Error Responses:**
| Status | Reason |
|--------|--------|
| 400    | Missing fields / username < 3 chars / password < 6 chars |
| 409    | Username already exists |

---

#### POST `/login`
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "hemanth",
  "password": "secret123"
}
```

**Success Response `200`:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhb...",
  "username": "hemanth"
}
```

**Error Responses:**
| Status | Reason |
|--------|--------|
| 400    | Missing fields |
| 401    | Invalid username or password |

---

### Task Routes

> All routes require: `Authorization: Bearer <access_token>`

---

#### GET `/tasks`
Get all tasks for the authenticated user (newest first).

**Success Response `200`:**
```json
[
  {
    "id": 1,
    "title": "Complete project report",
    "description": "Write and submit the final report",
    "completed": false,
    "priority": "high",
    "user_id": 1,
    "created_at": "2025-05-11T10:00:00",
    "updated_at": "2025-05-11T10:00:00"
  }
]
```

---

#### POST `/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "priority": "low"
}
```

**Success Response `201`:** Returns the created task object.

**Error Responses:**
| Status | Reason |
|--------|--------|
| 400    | Missing/empty title |
| 400    | Invalid priority value |
| 401    | Missing or invalid token |

---

#### PUT `/tasks/{id}`
Update an existing task (partial updates supported).

**Request Body (all fields optional):**
```json
{
  "title": "Updated title",
  "description": "New description",
  "completed": true,
  "priority": "medium"
}
```

**Success Response `200`:** Returns the updated task object.

**Error Responses:**
| Status | Reason |
|--------|--------|
| 400    | Empty title or invalid priority |
| 401    | Missing or invalid token |
| 404    | Task not found or not owned by user |

---

#### DELETE `/tasks/{id}`
Delete a task.

**Success Response `200`:**
```json
{ "message": "Task deleted successfully" }
```

**Error Responses:**
| Status | Reason |
|--------|--------|
| 401    | Missing or invalid token |
| 404    | Task not found or not owned by user |

---

## Testing with Postman

1. **Register** → `POST /register` with username + password
2. **Login** → `POST /login` — copy the `access_token` from the response
3. **Set Auth Header** → In Postman, go to Authorization tab → Bearer Token → paste token
4. **Test Tasks** → Use GET/POST/PUT/DELETE on `/tasks` and `/tasks/{id}`

---

## Deployment

### Backend → Render (Free Tier)

1. Push the `backend/` folder to a GitHub repo
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command:** `pip install -r requirements.txt`
4. Set **Start Command:** `gunicorn app:app`
5. Add Environment Variable: `JWT_SECRET_KEY=your-strong-secret`
6. Add `gunicorn` to `requirements.txt`

### Frontend → Vercel

1. Push the `frontend/` folder to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Set Environment Variable: `REACT_APP_API_URL=https://your-render-url.onrender.com`
4. Deploy — Vercel auto-detects Create React App

---

## Optional Enhancements Implemented

| Enhancement | Status |
|-------------|--------|
| Task Priority (Low / Medium / High) | ✅ Implemented |
| Filter by status (All / Active / Completed) | ✅ Implemented |
| Stats dashboard (total, active, done counts) | ✅ Implemented |
| Auto-logout on token expiry | ✅ Implemented |
| Inline task completion toggle | ✅ Implemented |
| Partial updates on PUT (send only changed fields) | ✅ Implemented |

---

## Author

Built by **Hemanth** as a take-home assignment for iCompaas.
