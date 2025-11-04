import { memo, useEffect, useRef, useState } from 'react';
import type { Message } from '../atoms/chatAtoms';
import ChatMessage from './ChatMessage';
import ThinkingIndicator from './ThinkingIndicator';
import './ChatWindow.css';

type ChatWindowProps = {
  messages: Message[];
  isTyping: boolean;
  isOpen: boolean;
};

const ChatWindow = ({ messages, isTyping, isOpen }: ChatWindowProps) => {
  const messagesRef = useRef<HTMLDivElement>(null);
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
    <main
      className={`chat-window ${isOpen ? 'chat-window--open' : ''}`}
      role="main"
      aria-hidden={!isOpen}
    >
      <div
        ref={messagesRef}
        className="chat-window__messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        id="messages"
        tabIndex={-1}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && <ThinkingIndicator />}
      </div>
    </main>
  );
};

export default memo(ChatWindow);
