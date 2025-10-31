import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { messagesAtom, themeAtom, typingAtom } from './atoms/chatAtoms';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import UserInput from './components/UserInput';
import Card from './components/Card';
import Sidebar, { ChatSummary } from './components/Sidebar';
import { buildEchoMessage } from './utils/markdown';
import './App.css';

const suggestions = [
  {
    id: 'python-experts',
    title: 'Top Python developers',
    description:
      'Find me the top 5 Python developers with 5+ years of experience that have worked on at least 2 Endava projects.',
    prompt:
      'Find me the top 5 Python developers with 5+ years of experience that have worked on at least 2 Endava projects.',
    actionLabel: 'Use prompt',
    icon: '🐍',
  },
  {
    id: 'sow-matching',
    title: 'Match candidates to a SOW',
    description:
      'Below is a statement of work. Give me the top 5 candidates for each position listed. Make sure they match the required skills and experience.',
    prompt:
      'Below is a statement of work. Give me the top 5 candidates for each position listed. Make sure they match the required skills and experience.',
    actionLabel: 'Use prompt',
    icon: '📝',
  },
  {
    id: 'react-availability',
    title: 'React availability check',
    description:
      'Show me React developers available in the next two weeks with strong TypeScript and Tailwind CSS skills.',
    prompt:
      'Show me React developers available in the next two weeks with strong TypeScript and Tailwind CSS skills.',
    actionLabel: 'Use prompt',
    icon: '⚛️',
  },
];

const getId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const defaultChats: ChatSummary[] = [
  {
    id: getId(),
    title: 'Team pairing ideas',
    preview: 'Brainstorming specialists for the payments pod.',
    updatedAt: Date.now() - 1000 * 60 * 15,
  },
  {
    id: getId(),
    title: 'Staffing follow-up',
    preview: 'Summaries of open roles for the Atlanta office.',
    updatedAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: getId(),
    title: 'Client kickoff notes',
    preview: 'Next steps for onboarding the Nimbus initiative.',
    updatedAt: Date.now() - 1000 * 60 * 90,
  },
];

const createNewChatSummary = (): ChatSummary => ({
  id: getId(),
  title: 'New chat',
  preview: 'Start a conversation',
  updatedAt: Date.now(),
});

const App = () => {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [isTyping, setTyping] = useAtom(typingAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const [inputValue, setInputValue] = useState('');
  const [isChatOpen, setChatOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const initialActiveChatIdRef = useRef('');
  const [chatHistory, setChatHistory] = useState<ChatSummary[]>(() => {
    const freshChat = createNewChatSummary();
    initialActiveChatIdRef.current = freshChat.id;
    return [freshChat, ...defaultChats].sort((a, b) => b.updatedAt - a.updatedAt);
  });
  const [activeChatId, setActiveChatId] = useState(() => initialActiveChatIdRef.current);
  const typingTimeoutRef = useRef<number>(0);
  const autoCollapsedRef = useRef(false);

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

  const handleSend = useCallback(
    (text: string) => {
      if (!text) {
        return false;
      }

      if (!isChatOpen) {
        setChatOpen(true);
      }
      if (!autoCollapsedRef.current) {
        setSidebarCollapsed(true);
        autoCollapsedRef.current = true;
      }
      setMessages((current) => [
        ...current,
        { id: getId(), sender: 'user', content: text },
      ]);
      setInputValue('');
      setChatHistory((current) => {
        const preview = text.length > 80 ? `${text.slice(0, 77).trimEnd()}…` : text;
        return current
          .map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  title: chat.title === 'New chat' ? preview : chat.title,
                  preview,
                  updatedAt: Date.now(),
                }
              : chat
          )
          .sort((a, b) => b.updatedAt - a.updatedAt);
      });

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
    },
    [activeChatId, isChatOpen, setChatOpen, setInputValue, setMessages, setTyping]
  );

  const handleSuggestionSelect = useCallback(
    (value: string) => {
      setInputValue(value);
      const container = document.getElementById('inputText');
      if (container instanceof HTMLTextAreaElement) {
        container.focus();
      }
    },
    [setInputValue]
  );

  const handleNewChat = useCallback(() => {
    const freshChat = createNewChatSummary();
    setChatHistory((current) => [freshChat, ...current].sort((a, b) => b.updatedAt - a.updatedAt));
    setActiveChatId(freshChat.id);
    setMessages([]);
    setChatOpen(false);
    setSidebarCollapsed(false);
    autoCollapsedRef.current = false;
  }, [setMessages]);

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
  }, []);

  return (
    <div className="app">
      <a href="#messages" className="skip-link">
        Skip to messages
      </a>
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        chats={chatHistory}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
      />
      <div className="chat-wrapper">
        <Header />
        <section
          className={`suggestions ${isChatOpen ? 'suggestions--hidden' : ''}`}
          aria-hidden={isChatOpen}
          aria-labelledby="suggestions-heading"
        >
          <h2 id="suggestions-heading" className="sr-only">
            Suggested prompts
          </h2>
          {suggestions.map((suggestion) => (
            <Card
              key={suggestion.id}
              title={suggestion.title}
              description={suggestion.description}
              actionLabel={suggestion.actionLabel}
              icon={suggestion.icon}
              onSelect={() => handleSuggestionSelect(suggestion.prompt)}
            />
          ))}
        </section>
        <ChatWindow messages={messages} isTyping={isTyping} isOpen={isChatOpen} />
        <UserInput value={inputValue} onChange={setInputValue} onSend={handleSend} />
      </div>
    </div>
  );
};

export default App;
