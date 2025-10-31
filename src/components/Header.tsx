import { memo } from 'react';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const PlusIcon = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 3v10M3 8h10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Header = () => {
  return (
    <header className="topbar" role="banner">
      <button type="button" className="topbar__button topbar__button--primary">
        <span className="topbar__button-icon">
          <PlusIcon />
        </span>
        <span className="topbar__button-label">New chat</span>
      </button>
      <ThemeToggle />
    </header>
  );
};

export default memo(Header);
