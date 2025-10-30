import { useAtom } from 'jotai';
import { themeAtom } from '../atoms/chatAtoms';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  const isLight = theme === 'light';

  const handleToggle = () => {
    setTheme(isLight ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={handleToggle}
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span aria-hidden="true">{isLight ? '🌙' : '☀️'}</span>
    </button>
  );
};

export default ThemeToggle;
