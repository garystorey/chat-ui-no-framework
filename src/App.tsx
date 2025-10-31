import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { messagesAtom, themeAtom, typingAtom } from './atoms/chatAtoms';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import UserInput from './components/UserInput';
import Card from './components/Card';
import { buildEchoMessage } from './utils/markdown';
import './App.css';

const suggestions = [
  'Find me the top 5 Python developers with 5+ years of experience that have worked on at least 2 Endava projects.',
  'Below is a statement of work. Give me the top 5 candidates for each position listed. Make sure they match the required skills and experience.',
  'Show me React developers available in the next two weeks with strong TypeScript and Tailwind CSS skills.',
];

const getId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const App = () => {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [isTyping, setTyping] = useAtom(typingAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const [inputValue, setInputValue] = useState('');
  const [isChatOpen, setChatOpen] = useState(false);
  const typingTimeoutRef = useRef<number>();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(media.matches ? 'dark' : 'light');
    const handleChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [setTheme]);

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    const link = document.getElementById('hljs-theme');
    if (link) {
      const href =
        theme === 'light'
          ? 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css'
          : 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css';
      link.setAttribute('href', href);
    }
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle('chat-open', isChatOpen);
    return () => {
      document.body.classList.remove('chat-open');
    };
  }, [isChatOpen]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = (text: string) => {
    if (!text) {
      return false;
    }

    setChatOpen(true);
    setMessages((current) => [
      ...current,
      { id: getId(), sender: 'user', content: text },
    ]);
    setInputValue('');

    setTyping(true);
    const delay = 350 + Math.min(1400, Math.max(250, text.length * 8));
    typingTimeoutRef.current = window.setTimeout(() => {
      setTyping(false);
      setMessages((current) => [
        ...current,
        { id: getId(), sender: 'bot', content: buildEchoMessage(text), renderAsHtml: true },
      ]);
    }, delay);

    return true;
  };

  const handleSuggestionSelect = (value: string) => {
    setInputValue(value);
    const container = document.getElementById('inputText');
    if (container instanceof HTMLTextAreaElement) {
      container.focus();
    }
  };

  return (
    <div className="app">
      <a href="#messages" className="skip-link">
        Skip to messages
      </a>
      <div className="chat-wrapper">
        <Header />
        <ChatWindow messages={messages} isTyping={isTyping} isOpen={isChatOpen} />
        <UserInput value={inputValue} onChange={setInputValue} onSend={handleSend} />
        <section
          className={`suggestions ${isChatOpen ? 'suggestions--hidden' : ''}`}
          aria-hidden={isChatOpen}
          aria-labelledby="suggestions-heading"
        >
          <h2 id="suggestions-heading" className="visually-hidden">
            Suggestions
          </h2>
          {suggestions.map((suggestion) => (
            <Card key={suggestion} text={suggestion} onSelect={handleSuggestionSelect} />
          ))}
        </section>
      </div>
    </div>
  );
};

export default App;
