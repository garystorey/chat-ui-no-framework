import { memo, useMemo } from 'react';
import type { Message } from '../atoms/chatAtoms';
import { formatFileSize, getAttachmentDisplayType, renderMarkdown } from '../utils';
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
  const attachments = message.attachments ?? [];

  return (
    <article className={`message message--${message.sender}`} aria-label={ariaLabel}>
      <div className="message__body" dangerouslySetInnerHTML={{ __html: content }} />
      {attachments.length > 0 && (
        <ul className="message__attachments" aria-label="Message attachments">
          {attachments.map((attachment) => {
            const typeLabel = getAttachmentDisplayType(attachment);
            const sizeLabel = formatFileSize(attachment.size);

            return (
              <li key={attachment.id} className="message__attachment">
                <span className="message__attachment-icon" aria-hidden="true">
                  📎
                </span>
                <div className="message__attachment-details">
                  <span className="message__attachment-name" title={attachment.name}>
                    {attachment.name}
                  </span>
                  <span className="message__attachment-meta">
                    {typeLabel ? `${typeLabel} • ${sizeLabel}` : sizeLabel}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
};

export default memo(ChatMessage);
