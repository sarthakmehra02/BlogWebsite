import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher'; // <-- IMPORTED

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <h1><Link to="/">My Blog</Link></h1>
      <div className="nav-links">
        <ThemeSwitcher /> {/* <-- ADDED */}
        {user ? (
          <>
            <span>Welcome, {user.username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;