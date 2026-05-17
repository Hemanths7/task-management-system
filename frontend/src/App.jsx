import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import TaskList from './pages/TaskList';
import NewTask from './pages/NewTask';
import EditTask from './pages/EditTask';

// ─── Route Guards ─────────────────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return !token ? children : <Navigate to="/tasks" replace />;
};

const WithNav = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes */}
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <WithNav><TaskList /></WithNav>
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks/new"
          element={
            <PrivateRoute>
              <WithNav><NewTask /></WithNav>
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks/edit/:id"
          element={
            <PrivateRoute>
              <WithNav><EditTask /></WithNav>
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
