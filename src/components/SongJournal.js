import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';

const NavBar = ({ setAuth }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setAuth(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">Song Journal</div>
      <div className="nav-links">
        <Link to="/">Journal</Link>
        <Link to="/dashboard">Dashboard</Link>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavBar; 