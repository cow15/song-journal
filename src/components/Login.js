import React from 'react';
import { loginWithSpotify } from '../services/authService';
import './Login.css';

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome Back</h1>
        <p>Connect with Spotify to access your personal song journal</p>
        <button onClick={loginWithSpotify} className="spotify-login-button">
          Login with Spotify
        </button>
        <div className="login-footer">
          <p>Don't have an account? <a href="/">Learn More</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 