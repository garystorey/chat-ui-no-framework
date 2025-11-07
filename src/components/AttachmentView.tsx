import { memo } from 'react';
import type { Attachment } from '../types';
import { getAttachmentDisplayType, formatFileSize } from '../utils';

type AttachmentViewProps = {
  attachment: Attachment;
};

const AttachmentView = memo(({ attachment }: AttachmentViewProps) => {
  const typeLabel = getAttachmentDisplayType(attachment);
  const sizeLabel = formatFileSize(attachment.size);

  return (
    <li className="message__attachment">
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
});

AttachmentView.displayName = 'AttachmentView';

export default AttachmentView;
