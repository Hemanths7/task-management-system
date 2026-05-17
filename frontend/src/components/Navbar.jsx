import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/tasks" className="navbar-brand">
        <div className="navbar-logo">TF</div>
        <span className="navbar-title">TaskFlow</span>
      </Link>

      <div className="navbar-right">
        {username && (
          <span className="navbar-username">👋 {username}</span>
        )}
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
