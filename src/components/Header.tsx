import { memo } from 'react';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const Header = () => {
  return (
    <header className="topbar" role="banner">
      <h1 className="topbar__title">Chat</h1>
      <ThemeToggle />
    </header>
  );
};

export default memo(Header);
