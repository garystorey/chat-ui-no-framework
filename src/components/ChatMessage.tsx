import { memo, useMemo } from 'react';
import type { Message } from '../atoms/chatAtoms';
import { renderMarkdown } from '../utils/markdown';
import './ChatMessage.css';

type ChatMessageProps = {
  message: Message;
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const content = useMemo(() => {
    if (message.renderAsHtml) {
      return message.content;
    }
    return renderMarkdown(message.content);
  }, [message.content, message.renderAsHtml]);

  const ariaLabel = message.sender === 'user' ? 'User message' : 'Assistant message';

  return (
    <article
      className={`message message--${message.sender}`}
      aria-label={ariaLabel}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default memo(ChatMessage);
