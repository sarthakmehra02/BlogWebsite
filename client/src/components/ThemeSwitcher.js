import React, { useState, useEffect } from 'react'; // <-- THIS LINE IS NOW CORRECT

const ThemeSwitcher = () => {
  // Initialize state from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Effect to apply the theme class to the document root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme'); // Clear old theme
    root.classList.add(`${theme}-theme`);
    localStorage.setItem('theme', theme); // Save theme to localStorage
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <button onClick={toggleTheme} className="theme-switcher-btn">
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
};

export default ThemeSwitcher;