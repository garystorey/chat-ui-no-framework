import { memo, useRef } from "react";
import type { Message } from "../../types";
import { usePrefersReducedMotion, useScrollToBottom } from "../../hooks";
import {ThinkingIndicator,ChatMessage, Show, List} from "../../components";

import "./ChatWindow.css";

type ChatWindowProps = {
  messages: Message[];
  isResponding: boolean;
};

const ChatWindow = ({ messages, isResponding }: ChatWindowProps) => {
  const messagesRef = useRef<HTMLOListElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useScrollToBottom(
    messagesRef,
    [messages, isResponding, prefersReducedMotion],
    {
      behavior: prefersReducedMotion ? "auto" : "smooth",
    }
  );

  return (
    <section className="chat-window chat-window--open">
      <h2 id="messages-heading" className="sr-only">
        Conversation
      </h2>
        <List<Message>
          items={messages}
          keyfield="id"
          as={(message) => <ChatMessage message={message} />}
          ref={messagesRef}
          className="chat-window__messages"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          id="messages"
          tabIndex={-1}
        />
      <Show when={isResponding}>
        <div className="chat-window__message chat-window__message--status">
          <ThinkingIndicator />
        </div>
      </Show>
    </section>
  );
};

export default memo(ChatWindow);
