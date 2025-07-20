import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/login`, { username, password });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate('/');
    } catch (error) {
      console.error("Login failed", error);
      alert('Login failed. Check credentials.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>
        <p className="auth-subheading">Welcome back! Please enter your details.</p>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">Login</button>
        </form>

        {}
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
        <p className="auth-switch" style={{ marginTop: '10px' }}>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
        
      </div>
    </div>
  );
};

export default LoginPage;