import { memo } from 'react';
import ThemeToggle from './ThemeToggle';
import { PlusIcon } from './icons';
import './Header.css';

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
