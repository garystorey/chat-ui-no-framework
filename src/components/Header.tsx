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

const SearchIcon = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M11.333 11.333 14 14M7.667 12a4.333 4.333 0 1 1 0-8.667 4.333 4.333 0 0 1 0 8.667Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShareIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M6.75 8.25 11.25 6M6.75 9.75l4.5 2.25M15 4.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0ZM6.75 9a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0ZM15 13.875a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Header = () => {
  return (
    <header className="topbar" role="banner">
      <div className="topbar__group">
        <button type="button" className="topbar__button topbar__button--primary">
          <span className="topbar__button-icon">
            <PlusIcon />
          </span>
          <span className="topbar__button-label">New chat</span>
        </button>
        <button type="button" className="topbar__button">
          <span className="topbar__button-icon">
            <SearchIcon />
          </span>
          <span className="topbar__button-label">Search</span>
        </button>
      </div>
      <div className="topbar__group topbar__group--actions">
        <button type="button" className="topbar__icon" aria-label="Share conversation">
          <ShareIcon />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default memo(Header);
