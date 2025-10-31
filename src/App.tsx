import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Message } from './atoms/chatAtoms';
import { messagesAtom, typingAtom } from './atoms/chatAtoms';
import ChatWindow from './components/ChatWindow';
import UserInput from './components/UserInput';
import Card from './components/Card';
import Sidebar, { ChatSummary } from './components/Sidebar';
import { buildEchoMessage } from './utils/markdown';
import useTheme from './hooks/useTheme';
import './App.css';

const getId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};


const suggestions = [
  {
    id: getId(),
    title: 'Top Python developers',
    description:
      'Find me the top 5 Python developers with 5+ years of experience that have worked on at least 2 Endava projects.',
    prompt:
      'Find me the top 5 Python developers with 5+ years of experience that have worked on at least 2 Endava projects.',
    actionLabel: 'Start',
    icon: '🐍',
  },
  {
    id: getId(),
    title: 'Match candidates to a SOW',
    description:
      'Below is a statement of work. Give me the top 5 candidates for each position listed. Make sure they match the required skills and experience.',
    prompt:
      'Below is a statement of work. Give me the top 5 candidates for each position listed. Make sure they match the required skills and experience.',
    actionLabel: 'Start',
    icon: '📝',
  },
  {
    id: getId(),
    title: 'React availability check',
    description:
      'Show me React developers available in the next two weeks with strong TypeScript and Tailwind CSS skills.',
    prompt:
      'Show me React developers available in the next two weeks with strong TypeScript and Tailwind CSS skills.',
    actionLabel: 'Start',
    icon: '⚛️',
  },
];

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
          `Can you suggest a few pairings of engineers who have complementary skills for the payments pod?`,
      },
      {
        id: getId(),
        sender: 'bot',
        content:
          `Here are three pairing ideas that balance mobile, API, and QA expertise for the payments pod.`,
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
        content: `Can you recap the open roles we still need to fill in Atlanta?`,
      },
      {
        id: getId(),
        sender: 'bot',
        content:
          `We still have four roles open in Atlanta: two frontend, one backend, and a data analyst position.`,
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
        content: `Capture the next steps from our Nimbus kickoff.`,
      },
      {
        id: getId(),
        sender: 'bot',
        content: `The Nimbus onboarding next steps are documented and ready to share with the team.`,
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

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const getPlainTextFromHtml = (value: string) => {
  if (!value) {
    return '';
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const container = document.createElement('div');
    container.innerHTML = value;
    const text = container.textContent ?? container.innerText ?? '';
    return normalizeWhitespace(text);
  }

  return normalizeWhitespace(value.replace(/<[^>]*>/g, ' '));
};

const getMessagePlainText = (message?: Message) => {
  if (!message) {
    return '';
  }

  if (message.renderAsHtml) {
    return getPlainTextFromHtml(message.content);
  }

  return normalizeWhitespace(message.content);
};

const buildChatTitle = (message?: Message, fallback = 'Conversation') =>
  truncate(getMessagePlainText(message) || getPlainTextFromHtml(fallback) || 'Conversation', 60) ||
  'Conversation';

const buildChatPreview = (message?: Message, fallback = 'Conversation') =>
  truncate(getMessagePlainText(message) || getPlainTextFromHtml(fallback) || 'Conversation', 80) ||
  'Conversation';

const createChatRecordFromMessages = (messages: Message[]): ChatSummary => {
  const firstUserMessage = messages.find((message) => message.sender === 'user');
  const lastMessage = messages[messages.length - 1];
  const title = buildChatTitle(firstUserMessage);
  const preview = buildChatPreview(lastMessage, title);

  return {
    id: getId(),
    title,
    preview,
    updatedAt: Date.now(),
    messages: cloneMessages(messages),
  };
};

const App = () => {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [isTyping, setTyping] = useAtom(typingAtom);
  const [inputValue, setInputValue] = useState('');
  const [isChatOpen, setChatOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSummary[]>(() =>
    [...defaultChats].sort((a, b) => b.updatedAt - a.updatedAt)
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<number>(0);
  const isFreshChat = messages.length === 0;

  useTheme();

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
    (nextMessages: Message[], previewMessage?: Message) => {
      if (!activeChatId) {
        return;
      }

      const previewCandidate = previewMessage ?? nextMessages[nextMessages.length - 1];

      setChatHistory((current) =>
        current
          .map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  preview: buildChatPreview(previewCandidate, chat.preview),
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
                  preview: buildChatPreview(lastMessage, chat.preview),
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
      const userMessage: Message = { id: getId(), sender: 'user', content: text };

      setMessages((current) => {
        const next = [...current, userMessage];
        updateActiveChat(next, userMessage);
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
          updateActiveChat(next, botMessage);
          return next;
        });
      }, delay);

      return true;
    },
    [isChatOpen, setChatOpen, setInputValue, setMessages, setTyping, updateActiveChat]
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
    },
    [archiveCurrentConversation, chatHistory, setChatOpen, setInputValue, setMessages, setTyping]
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

  const suggestionsClasses = ['suggestions'];

  if (isChatOpen) {
    suggestionsClasses.push('suggestions--hidden');
  }

  const suggestionsSection = (
    <section
      className={suggestionsClasses.join(' ')}
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
          <div
            className={`chat-main__content ${isFreshChat ? 'chat-main__content--centered' : ''}`}
          >
            {isFreshChat ? (
              <>
                <div className="chat-main__inline-input">
                  <UserInput value={inputValue} onChange={setInputValue} onSend={handleSend} />
                </div>
                {suggestionsSection}
              </>
            ) : (
              suggestionsSection
            )}
            <ChatWindow messages={messages} isTyping={isTyping} isOpen={isChatOpen} />
          </div>
        </div>
        {!isFreshChat ? (
          <UserInput value={inputValue} onChange={setInputValue} onSend={handleSend} />
        ) : null}
      </div>
    </div>
  );
};

export default App;
