import { ChangeEvent, FormEvent, KeyboardEvent, useCallback, useEffect, useRef } from 'react';
import './UserInput.css';

type UserInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => boolean;
};

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
          aria-label="Message input"
          autoFocus
        />
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
