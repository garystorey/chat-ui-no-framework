import { memo, useMemo } from 'react';
import type { Message } from '../types'
import {
  formatFileSize,
  getAttachmentDisplayType,
  normalizeMessageAttachments,
  renderMarkdown,
} from '../utils';
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
  const attachments = useMemo(
    () => normalizeMessageAttachments(message.attachments, message.id),
    [message.attachments, message.id]
  );

  return (
    <article className={`message message--${message.sender}`} aria-label={ariaLabel}>
      <div className="message__body" dangerouslySetInnerHTML={{ __html: content }} />
      {attachments.length > 0 && (
        <ul className="message__attachments" aria-label="Message attachments">
          {attachments.map((attachment, index) => {
            const typeLabel = getAttachmentDisplayType(attachment);
            const sizeLabel = formatFileSize(attachment.size);
            const attachmentKey = `${attachment.id}-${index}`;

            return (
              <li key={attachmentKey} className="message__attachment">
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
