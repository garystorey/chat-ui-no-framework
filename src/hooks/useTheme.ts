import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import { themeAtom } from '../atoms/chat';
import { Theme } from '../types';
import useToggleBodyClass from './useToggleBodyClass';



const prefersDarkSchemeQuery = '(prefers-color-scheme: dark)';
const highlightThemeHref: Record<Theme, string> = {
  light: 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css',
  dark: 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css',
};

const getPreferredTheme = (mediaQuery: { matches: boolean }): Theme =>
  mediaQuery.matches ? 'dark' : 'light';

const getNextTheme = (current: Theme): Theme => (current === 'light' ? 'dark' : 'light');

const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(prefersDarkSchemeQuery);
    const preferredTheme = getPreferredTheme(mediaQueryList);

    setTheme((currentTheme) => (currentTheme !== preferredTheme ? preferredTheme : currentTheme));

    const handleChange = (event: MediaQueryListEvent) => {
      const nextTheme = getPreferredTheme(event);
      setTheme((currentTheme) => (currentTheme !== nextTheme ? nextTheme : currentTheme));
    };

    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [setTheme]);

  useToggleBodyClass('light', theme === 'light');
  useToggleBodyClass('dark', theme === 'dark');

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const highlightThemeLink = document.getElementById('hljs-theme');
    if (highlightThemeLink) {
      highlightThemeLink.setAttribute('href', highlightThemeHref[theme]);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => getNextTheme(currentTheme));
  }, [setTheme]);

  const isLight = useMemo(() => theme === 'light', [theme]);

  return { theme, setTheme, toggleTheme, isLight };
};

export default useTheme;
