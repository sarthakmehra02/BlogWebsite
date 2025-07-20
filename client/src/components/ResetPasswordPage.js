import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setMessage('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/reset-password/${token}`, { password });
      setMessage(response.data.message + " You will be redirected to login shortly.");
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
      console.error(err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Reset Your Password</h2>
        
        {message && <p className="form-success-message">{message}</p>}
        {error && <p className="form-error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            placeholder="Enter new password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Confirm new password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
          <button type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;