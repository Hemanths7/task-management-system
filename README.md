# TaskFlow - Task Management System

TaskFlow is a full-stack task management application that allows users to securely manage daily tasks with JWT authentication and real-time CRUD operations.

---

##  Live Demo

### Frontend
https://task-management-system-ochre-eight.vercel.app/

### Backend API
https://task-management-backend-k9qw.onrender.com

---

##  Features

- User Registration & Login
- JWT Authentication
- Create, Edit & Delete Tasks
- Mark Tasks as Completed
- Task Priority Management
- Protected Routes
- Responsive Modern UI

---

##  Tech Stack

### Frontend
- React.js
- Axios
- React Router DOM

### Backend
- Flask
- Flask-JWT-Extended
- SQLite

---

## 📁 Project Structure

```text
task-management-system/
│
├── backend/
├── frontend/
└── README.md
```

---

## ⚙️ Run Locally

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

##  API Routes

### Authentication

| Method | Route       | Description            |
|--------|-------------|------------------------|
| POST   | /register   | Register a new user    |
| POST   | /login      | Login existing user    |

### Tasks

| Method | Route          | Description          |
|--------|----------------|----------------------|
| GET    | /tasks         | Get all tasks        |
| POST   | /tasks         | Create a new task    |
| PUT    | /tasks/<id>    | Update a task        |
| DELETE | /tasks/<id>    | Delete a task        |

---

##  Deployment

- Frontend deployed on Vercel
- Backend deployed on Render

---

##  Future Improvements

- Email Notifications
- Pagination
- User Profile Management
- Task Deadlines
- Dark/Light Theme Toggle

---

##  Screenshots

### Login Page
![Login](screenshots/login.png)

### Create Account
![Register](screenshots/create-account.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Task Creation
![Task Creation](screenshots/task-creation.png)

### Mobile Responsive View
![Mobile View](screenshots/mobile-view.png)

---

## 👨‍💻 Author

Hemanth Shivarathri

GitHub: https://github.com/Hemanths7