import { memo, useEffect, useMemo, useRef } from 'react';
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
  const reduceMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

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
