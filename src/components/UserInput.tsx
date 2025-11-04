import { ChangeEvent, FormEvent, KeyboardEvent, useCallback, useEffect, useRef } from 'react';
import './UserInput.css';

type UserInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => boolean;
};

const SparkIcon = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M9 2.25 9.75 6a1 1 0 0 0 .75.75L14 7.5l-3.5 1a1 1 0 0 0-.7.7l-1.05 3.5-1-3.5a1 1 0 0 0-.7-.7L3.5 7.5l3.5-.75a1 1 0 0 0 .75-.75L9 2.25ZM4.25 12.75l.375 1.5a.75.75 0 0 0 .525.525l1.5.375-1.5.375a.75.75 0 0 0-.525.525l-.375 1.5-.375-1.5a.75.75 0 0 0-.525-.525l-1.5-.375 1.5-.375a.75.75 0 0 0 .525-.525l.375-1.5Zm9-2.25.45 1.8a.9.9 0 0 0 .63.63l1.8.45-1.8.45a.9.9 0 0 0-.63.63l-.45 1.8-.45-1.8a.9.9 0 0 0-.63-.63l-1.8-.45 1.8-.45a.9.9 0 0 0 .63-.63l.45-1.8Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

const MicIcon = () => (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M8 1.5a2 2 0 0 0-2 2v3a2 2 0 1 0 4 0v-3a2 2 0 0 0-2-2Zm4.5 5a.5.5 0 0 0-1 0A3.5 3.5 0 0 1 8 10a3.5 3.5 0 0 1-3.5-3.5.5.5 0 0 0-1 0A4.5 4.5 0 0 0 7.5 10.45V12H5.75a.75.75 0 1 0 0 1.5h4.5a.75.75 0 1 0 0-1.5H8.5v-1.55A4.5 4.5 0 0 0 12.5 6.5Z"
      fill="currentColor"
    />
  </svg>
);

const UserInput = ({ value, onChange, onSend }: UserInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      const sent = onSend(trimmed);
      if (!sent) {
        return;
      }
    },
    [onSend, value]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) {
          return;
        }
        const sent = onSend(trimmed);
        if (!sent) {
          return;
        }
      }
    },
    [onSend, value]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <form
      className="input-panel"
      onSubmit={handleSubmit}
      role="search"
      aria-label="Enter your request"
      noValidate
    >
      <div className="input-panel__group">
        <label htmlFor="inputText" className="sr-only">
          Enter your request
        </label>
        <div className="input-panel__field">
          <span className="input-panel__glyph" aria-hidden="true">
            <SparkIcon />
          </span>
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
          <span className="input-panel__glyph input-panel__glyph--trail" aria-hidden="true">
            <MicIcon />
          </span>
        </div>
        <div id="inputHint" className="sr-only">
          Press Enter to send and Shift+Enter for newline
        </div>
      </div>
      <button
        type="submit"
        className="input-panel__submit"
        aria-label="Send message"
      >
        <span aria-hidden="true">➤</span>
      </button>
    </form>
  );
};

export default UserInput;
