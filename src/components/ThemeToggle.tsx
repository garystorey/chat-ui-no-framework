import { memo } from 'react';
import { useTheme } from '../hooks';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isLight, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span aria-hidden="true">{isLight ? '🌙' : '☀️'}</span>
    </button>
  );
};

export default memo(ThemeToggle);
