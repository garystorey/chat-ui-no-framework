import { memo, useMemo } from 'react';
import type { Attachment, Message } from '../types';
import {
  normalizeMessageAttachments,
  renderMarkdown,
} from '../utils';
import './ChatMessage.css';
import Show from './Show';
import List from './List';
import AttachmentView from './AttachmentView';

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
      <Show when={attachments.length > 0}>
        <ul className="message__attachments" aria-label="Message attachments">
          <List<Attachment>
            items={attachments}
            keyfield="id"
            as={(attachment) => <AttachmentView attachment={attachment} />}
          />
        </ul>
      </Show>
    </article>
  );
};

export default memo(ChatMessage);
