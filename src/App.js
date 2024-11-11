import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SongJournal from './SongJournal';
import Login from './components/Login';
import Callback from './components/Callback';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import NavBar from './components/NavBar';
import ErrorBoundary from './ErrorBoundary';
import { checkAuth } from './services/authService';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, []);

  return (
    <Router>
      <div className="App">
        <ErrorBoundary>
          {isAuthenticated && <NavBar setAuth={setIsAuthenticated} />}
          <Routes>
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/journal" /> : <Login />} 
            />
            <Route 
              path="/callback" 
              element={<Callback setAuth={setIsAuthenticated} />} 
            />
            <Route
              path="/dashboard"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/journal"
              element={isAuthenticated ? <SongJournal /> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={isAuthenticated ? <Navigate to="/journal" /> : <LandingPage />}
            />
          </Routes>
        </ErrorBoundary>
      </div>
    </Router>
  );
}

export default App;
