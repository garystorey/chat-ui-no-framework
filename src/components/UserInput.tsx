import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { AttachmentIcon, MicIcon, SendIcon } from './icons';
import { getId } from '../utils';
import { UserInputSendPayload } from '../types';
import './UserInput.css';

type SelectedAttachment = {
  id: string;
  file: File;
};

type UserInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (payload: UserInputSendPayload) => Promise<boolean> | boolean;
};

const UserInput = forwardRef<HTMLTextAreaElement, UserInputProps>(
  ({ value, onChange, onSend }, forwardedRef) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachments, setAttachments] = useState<SelectedAttachment[]>([]);

    useImperativeHandle(forwardedRef, () => textareaRef.current!);

    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }, [value]);

    const sendMessage = useCallback(async () => {
      const trimmed = value.trim();
      if (!trimmed) {
        return false;
      }

      const sent = await Promise.resolve(
        onSend({
          text: trimmed,
          attachments: attachments.map(({ file }) => file),
        })
      );

      if (sent) {
        setAttachments([]);
      }

      return sent;
    }, [attachments, onSend, value]);

    const handleSubmit = useCallback(
      (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void sendMessage();
      },
      [sendMessage]
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          void sendMessage();
        }
      },
      [sendMessage]
    );

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(event.target.value);
      },
      [onChange]
    );

    const handleAttachmentButtonClick = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    const handleAttachmentChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files?.length) {
          return;
        }

        setAttachments((current) => [
          ...current,
          ...Array.from(files, (file) => ({ id: getId(), file })),
        ]);

        event.target.value = '';
      },
      []
    );

    const handleRemoveAttachment = useCallback((targetId: string) => {
      setAttachments((current) =>
        current.filter((attachment) => attachment.id !== targetId)
      );
    }, []);

    return (
      <form
        className="input-panel"
        onSubmit={handleSubmit}
        aria-labelledby="inputLabel"
        noValidate
      >
        <div className="input-panel__group">
          <label id="inputLabel" htmlFor="inputText" className="sr-only">
            Enter your request
          </label>
          <div className="input-panel__field">
            <textarea
              id="inputText"
              ref={textareaRef}
              rows={3}
              value={value}
              spellCheck
              required
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              aria-describedby="inputHint"
              autoFocus
            />
          </div>
          {attachments.length > 0 ? (
            <ul className="input-panel__attachment-list">
              {attachments.map(({ id, file }) => (
                <li
                  key={id}
                  className="input-panel__attachment-item"
                >
                  <span className="input-panel__attachment-name">{file.name}</span>
                  <button
                    type="button"
                    className="input-panel__attachment-remove"
                    onClick={() => handleRemoveAttachment(id)}
                    aria-label={`Remove ${file.name}`}
                  >
                    X <span className='sr-only'>Remove</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="input-panel__controls">
            <input
              ref={fileInputRef}
              type="file"
              className="input-panel__file-input"
              onChange={handleAttachmentChange}
              multiple
              tabIndex={-1}
              aria-hidden="true"
            />
            <div className="input-panel__actions">
              <button
                type="button"
                className="input-panel__icon-button input-panel__icon-button--accent"
                onClick={handleAttachmentButtonClick}
                aria-label="Add attachment"
                title="Add attachment"
              >
                <AttachmentIcon />
              </button>
              <button
                type="button"
                className="input-panel__icon-button input-panel__icon-button--muted"
                aria-label="Start voice input"
                title="Start voice input"
              >
                <MicIcon />
              </button>
            </div>
            <button
              type="submit"
              className="input-panel__submit"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
          <div id="inputHint" className="sr-only">
            Press Enter to send and Shift+Enter for newline
          </div>
        </div>
      </form>
    );
  }
);

UserInput.displayName = 'UserInput';

export default UserInput;
