import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';

import './App.css';

function App() {
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <div className="App">
        {}
        <Navbar user={user} setUser={setUser} />

        <main>
          {}
          <Routes>
            {}
            <Route 
              path="/" 
              element={<HomePage user={user} />} 
            />
            
            {}
            <Route 
              path="/login" 
              element={<LoginPage setUser={setUser} />} 
            />

            {}
            <Route 
              path="/register" 
              element={<RegisterPage />} 
            />

            {}
            <Route 
              path="/forgot-password" 
              element={<ForgotPasswordPage />} 
            />
            
            {}
            <Route 
              path="/reset-password/:token" 
              element={<ResetPasswordPage />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;