import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post(
  `${process.env.REACT_APP_API_BASE_URL}/api/auth/forgot-password`,
  { username }
);
      setMessage(response.data.message);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-subheading">Enter your username to receive a reset link.</p>        
        {message && <p className="form-success-message">{message}</p>}
        {error && <p className="form-error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Your Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
          <button type="submit">Send Reset Link</button>
        </form>
        <p className="auth-switch">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;