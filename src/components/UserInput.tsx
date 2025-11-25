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
} from "react";
import { AttachmentIcon, MicIcon, SendIcon, StopIcon } from "./icons";
import { buildAttachmentsFromFiles } from "../utils";
import { Attachment, UserInputSendPayload } from "../types";
import { useAutoResizeTextarea } from "../hooks";
import List from "./List";
import Show from "./Show";

import "./UserInput.css";

type UserInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: (payload: UserInputSendPayload) => Promise<boolean> | boolean;
  onStop: () => void;
  isResponding: boolean;
};

type AttachmentListItemProps = {
  attachment: Attachment;
  handleRemoveAttachment: (id: string) => void;
};

function AttachmentListItem({
  attachment,
  handleRemoveAttachment,
}: AttachmentListItemProps) {
  return (
    <div className="input-panel__attachment-item">
      <span className="input-panel__attachment-name">{attachment.name}</span>
      <button
        type="button"
        className="input-panel__attachment-remove"
        onClick={() => handleRemoveAttachment(attachment.id)}
      >
        &times; <span className="sr-only">Remove {attachment.name}</span>
      </button>
    </div>
  );
}

const UserInput = forwardRef<HTMLTextAreaElement, UserInputProps>(
  ({ value, onChange, onSend, onStop, isResponding }, forwardedRef) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [canRecord, setCanRecord] = useState(false);

    useEffect(() => {
      setCanRecord(
        typeof navigator !== "undefined" &&
          Boolean(navigator.mediaDevices?.getUserMedia)
      );
    }, []);

    useImperativeHandle(forwardedRef, () => textareaRef.current!);
    useAutoResizeTextarea(textareaRef, value);

    const sendMessage = useCallback(async () => {
      const trimmed = value.trim();

      if (!trimmed && attachments.length === 0) {
        return false;
      }

      const sent = await Promise.resolve(
        onSend({
          text: trimmed,
          attachments,
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
        if (event.key === "Enter" && !event.shiftKey) {
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

        const selectedFiles = Array.from(files);

        setAttachments((current) => [
          ...current,
          ...buildAttachmentsFromFiles(selectedFiles),
        ]);

        event.target.value = "";
      },
      []
    );

    const handleRemoveAttachment = useCallback((targetId: string) => {
      setAttachments((current) =>
        current.filter((attachment) => attachment.id !== targetId)
      );
    }, []);

    const handleToggleRecording = useCallback(() => {
      if (isResponding || !canRecord) {
        return;
      }

      setIsRecording((current) => {
        const nextState = !current;
        const textarea = textareaRef.current;

        if (nextState) {
          textarea?.blur();
        } else {
          textarea?.focus();
        }

        return nextState;
      });
    }, [canRecord, isResponding]);

    useEffect(() => {
      if (!isRecording) {
        return;
      }

      if (isResponding || !canRecord) {
        setIsRecording(false);
        textareaRef.current?.focus();
      }
    }, [canRecord, isRecording, isResponding]);

    const micButtonClasses = [
      "input-panel__icon-button",
      "input-panel__icon-button--muted",
    ];

    if (isRecording) {
      micButtonClasses.push("input-panel__icon-button--recording");
    }

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
          <Show when={attachments.length > 0}>
            <List<Attachment>
              className="input-panel__attachment-list"
              items={attachments}
              keyfield="id"
              as={(a) => (
                <AttachmentListItem
                  attachment={a}
                  handleRemoveAttachment={handleRemoveAttachment}
                />
              )}
            />
          </Show>
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
                className={micButtonClasses.join(" ")}
                onClick={handleToggleRecording}
                aria-label={isRecording ? "Stop voice input" : "Start voice input"}
                title={isRecording ? "Stop voice input" : "Start voice input"}
                disabled={isResponding || !canRecord}
              >
                <MicIcon />
              </button>
            </div>
            {isResponding ? (
              <button
                type="button"
                className="input-panel__submit"
                aria-label="Stop response"
                title="Stop response"
                onClick={onStop}
              >
                <StopIcon />
              </button>
            ) : (
              <button
                type="submit"
                className="input-panel__submit"
                aria-label="Send message"
                title="Send message"
              >
                <SendIcon />
              </button>
            )}
          </div>
          <div id="inputHint" className="sr-only">
            Press Enter to send and Shift+Enter for newline
          </div>
        </div>
      </form>
    );
  }
);

UserInput.displayName = "UserInput";

export default UserInput;
