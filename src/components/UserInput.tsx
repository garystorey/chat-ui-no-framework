import { FormEvent, KeyboardEvent, useEffect, useRef } from 'react';
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sent = onSend(value.trim());
    if (sent) {
      onChange('');
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const sent = onSend(value.trim());
      if (sent) {
        onChange('');
      }
    }
  };

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
          onChange={(event) => onChange(event.target.value)}
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
