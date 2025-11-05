import { memo } from "react";
import { MessageAttachment } from "../types";
import { getAttachmentDisplayType, formatFileSize } from "../utils";

const AttachmentView = memo(( attachment : MessageAttachment) => {
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


export default AttachmentView;