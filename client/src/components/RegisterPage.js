import React, { useState } from 'react';
import API from '../api/index';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // This stops the page from reloading
    try {
      await API.post('/api/auth/register', { username, email, password });
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      console.error("Registration failed", error);
      if (error.response) {
        alert(`Registration failed: ${error.response.data.message || 'Please check your details.'}`);
      } else {
        alert('Registration failed: Could not connect to the server. Please try again later.');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Register</button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;