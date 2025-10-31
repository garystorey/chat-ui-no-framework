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

  return (
    <article
      className={`message message--${message.sender}`}
      role="article"
      aria-label={message.sender === 'user' ? 'User message' : 'Bot message'}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default memo(ChatMessage);
