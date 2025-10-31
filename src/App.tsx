import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Message } from './atoms/chatAtoms';
import { messagesAtom, themeAtom, typingAtom } from './atoms/chatAtoms';
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
    preview: 'Here are three pairing ideas that balance mobile, API, and QA expertise for the payments pod.',
    updatedAt: Date.now() - 1000 * 60 * 15,
    messages: [
      {
        id: getId(),
        sender: 'user',
        content:
          'Can you suggest a few pairings of engineers who have complementary skills for the payments pod?',
      },
      {
        id: getId(),
        sender: 'bot',
        content:
          'Here are three pairing ideas that balance mobile, API, and QA expertise for the payments pod.',
      },
    ],
  },
  {
    id: getId(),
    title: 'Staffing follow-up',
    preview: 'We still have four roles open in Atlanta: two frontend, one backend, and a data analyst position.',
    updatedAt: Date.now() - 1000 * 60 * 60,
    messages: [
      {
        id: getId(),
        sender: 'user',
        content: 'Can you recap the open roles we still need to fill in Atlanta?',
      },
      {
        id: getId(),
        sender: 'bot',
        content:
          'We still have four roles open in Atlanta: two frontend, one backend, and a data analyst position.',
      },
    ],
  },
  {
    id: getId(),
    title: 'Client kickoff notes',
    preview: 'The Nimbus onboarding next steps are documented and ready to share with the team.',
    updatedAt: Date.now() - 1000 * 60 * 90,
    messages: [
      {
        id: getId(),
        sender: 'user',
        content: 'Capture the next steps from our Nimbus kickoff.',
      },
      {
        id: getId(),
        sender: 'bot',
        content: 'The Nimbus onboarding next steps are documented and ready to share with the team.',
      },
    ],
  },
];

const truncate = (value: string, maxLength: number) => {
  if (!value) {
    return '';
  }
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};

const cloneMessages = (items: Message[]): Message[] => items.map((item) => ({ ...item }));

const createChatRecordFromMessages = (messages: Message[]): ChatSummary => {
  const firstUserMessage = messages.find((message) => message.sender === 'user');
  const lastMessage = messages[messages.length - 1];
  const titleSource = firstUserMessage?.content ?? 'Conversation';
  const previewSource = lastMessage?.content ?? titleSource;

  return {
    id: getId(),
    title: truncate(titleSource, 60) || 'Conversation',
    preview: truncate(previewSource, 80) || 'Conversation',
    updatedAt: Date.now(),
    messages: cloneMessages(messages),
  };
};

const App = () => {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [isTyping, setTyping] = useAtom(typingAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const [inputValue, setInputValue] = useState('');
  const [isChatOpen, setChatOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSummary[]>(() =>
    [...defaultChats].sort((a, b) => b.updatedAt - a.updatedAt)
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
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

  const updateActiveChat = useCallback(
    (nextMessages: Message[], previewSource: string) => {
      if (!activeChatId) {
        return;
      }

      setChatHistory((current) =>
        current
          .map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  preview:
                    truncate(previewSource, 80) ||
                    truncate(chat.preview, 80) ||
                    'Conversation',
                  updatedAt: Date.now(),
                  messages: cloneMessages(nextMessages),
                }
              : chat
          )
          .sort((a, b) => b.updatedAt - a.updatedAt)
      );
    },
    [activeChatId]
  );

  const archiveCurrentConversation = useCallback(() => {
    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];

    if (activeChatId) {
      setChatHistory((current) =>
        current
          .map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  preview:
                    truncate(lastMessage?.content ?? chat.preview, 80) ||
                    truncate(chat.preview, 80) ||
                    'Conversation',
                  updatedAt: Date.now(),
                  messages: cloneMessages(messages),
                }
              : chat
          )
          .sort((a, b) => b.updatedAt - a.updatedAt)
      );
      return;
    }

    const newChat = createChatRecordFromMessages(messages);
    setChatHistory((current) =>
      [newChat, ...current].sort((a, b) => b.updatedAt - a.updatedAt)
    );
  }, [activeChatId, messages]);

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

      const userMessage: Message = { id: getId(), sender: 'user', content: text };

      setMessages((current) => {
        const next = [...current, userMessage];
        updateActiveChat(next, userMessage.content);
        return next;
      });

      setInputValue('');
      setTyping(true);
      const delay = 350 + Math.min(1400, Math.max(250, text.length * 8));
      typingTimeoutRef.current = window.setTimeout(() => {
        setTyping(false);
        const botMessage: Message = {
          id: getId(),
          sender: 'bot',
          content: buildEchoMessage(text),
          renderAsHtml: true,
        };

        setMessages((current) => {
          const next = [...current, botMessage];
          updateActiveChat(next, botMessage.content);
          return next;
        });
      }, delay);

      return true;
    },
    [
      isChatOpen,
      setChatOpen,
      setInputValue,
      setMessages,
      setTyping,
      setSidebarCollapsed,
      updateActiveChat,
    ]
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
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = 0;
    }
    setTyping(false);

    archiveCurrentConversation();

    setMessages([]);
    setActiveChatId(null);
    setInputValue('');
    setChatOpen(false);
    setSidebarCollapsed(false);
    autoCollapsedRef.current = false;
  }, [
    archiveCurrentConversation,
    setChatOpen,
    setInputValue,
    setMessages,
    setSidebarCollapsed,
    setTyping,
  ]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      const selectedChat = chatHistory.find((chat) => chat.id === chatId);
      if (!selectedChat) {
        return;
      }

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = 0;
      }
      setTyping(false);

      archiveCurrentConversation();

      setActiveChatId(chatId);
      setMessages(cloneMessages(selectedChat.messages));
      setInputValue('');
      setChatOpen(true);

      if (!autoCollapsedRef.current) {
        setSidebarCollapsed(true);
        autoCollapsedRef.current = true;
      }
    },
    [
      archiveCurrentConversation,
      chatHistory,
      setChatOpen,
      setInputValue,
      setMessages,
      setSidebarCollapsed,
      setTyping,
    ]
  );

  const handleRemoveChat = useCallback(
    (chatId: string) => {
      let removalOccurred = false;
      let nextActiveId: string | null = activeChatId;
      let nextMessages: Message[] = [];
      let shouldReset = false;

      setChatHistory((current) => {
        if (current.length === 0) {
          return current;
        }

        const filtered = current.filter((chat) => chat.id !== chatId);

        if (filtered.length === current.length) {
          return current;
        }

        removalOccurred = true;

        if (filtered.length === 0) {
          nextActiveId = null;
          shouldReset = true;
          return filtered;
        }

        if (chatId === activeChatId) {
          const [nextChat] = filtered;
          nextActiveId = nextChat?.id ?? null;
          nextMessages = nextChat ? cloneMessages(nextChat.messages) : [];
          shouldReset = !nextActiveId;
        }

        return filtered;
      });

      if (!removalOccurred) {
        return;
      }

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = 0;
      }
      setTyping(false);

      if (shouldReset || !nextActiveId) {
        setActiveChatId(null);
        setMessages([]);
        setChatOpen(false);
        setSidebarCollapsed(false);
        autoCollapsedRef.current = false;
        setInputValue('');
        return;
      }

      if (chatId === activeChatId && nextActiveId) {
        setActiveChatId(nextActiveId);
        setMessages(nextMessages);
        setChatOpen(true);
        setInputValue('');
      }
    },
    [activeChatId, setChatOpen, setInputValue, setMessages, setSidebarCollapsed, setTyping]
  );

  return (
    <div className="app">
      <a href="#messages" className="skip-link">
        Skip to messages
      </a>
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev: boolean) => !prev)}
        chats={chatHistory}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onRemoveChat={handleRemoveChat}
      />
      <div className="chat-wrapper">
        <div className="chat-main">
          <div className="chat-main__content">
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
          </div>
        </div>
        <UserInput value={inputValue} onChange={setInputValue} onSend={handleSend} />
      </div>
    </div>
  );
};

export default App;
