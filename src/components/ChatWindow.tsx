import { memo, useEffect, useRef, useState } from 'react';
import type { Message } from '../types';
import ChatMessage from './ChatMessage';
import ThinkingIndicator from './ThinkingIndicator';
import './ChatWindow.css';

type ChatWindowProps = {
  messages: Message[];
  isTyping: boolean;
  isOpen: boolean;
};

const ChatWindow = ({ messages, isTyping, isOpen }: ChatWindowProps) => {
  const messagesRef = useRef<HTMLOListElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setReduceMotion(event.matches);
    };

    setReduceMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [messages, isTyping, reduceMotion]);

  return (
    <section
      className={`chat-window ${isOpen ? 'chat-window--open' : ''}`}
      aria-hidden={!isOpen}
      aria-labelledby="messages-heading"
    >
      <h2 id="messages-heading" className="sr-only">
        Conversation
      </h2>
      <ol
        ref={messagesRef}
        className="chat-window__messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        id="messages"
        tabIndex={-1}
      >
        {messages.map((message) => (
          <li key={message.id} className="chat-window__message">
            <ChatMessage message={message} />
          </li>
        ))}
        {isTyping && (
          <li className="chat-window__message chat-window__message--status">
            <ThinkingIndicator />
          </li>
        )}
      </ol>
    </section>
  );
};

export default memo(ChatWindow);
