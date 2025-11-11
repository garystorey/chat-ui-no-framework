import { memo, useRef } from 'react';
import type { Message } from '../types';
import ChatMessage from './ChatMessage';
import ThinkingIndicator from './ThinkingIndicator';
import './ChatWindow.css';
import { usePrefersReducedMotion, useScrollToBottom } from '../hooks';

type ChatWindowProps = {
  messages: Message[];
  isTyping: boolean;
};

const ChatWindow = ({ messages, isTyping }: ChatWindowProps) => {
  const messagesRef = useRef<HTMLOListElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useScrollToBottom(messagesRef, [messages, isTyping, prefersReducedMotion], {
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });

  return (
    <section
      className="chat-window chat-window--open"
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
