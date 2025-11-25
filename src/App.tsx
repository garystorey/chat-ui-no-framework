import { useAtom } from "jotai";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { messagesAtom, respondingAtom } from "./atoms";
import { Show, UserInput, Suggestions } from "./components";
import { ChatWindow, Sidebar } from "./features/";
import type { ConnectionStatus } from "./hooks/useConnectionListeners";

import type {
  UserInputSendPayload,
  ChatSummary,
  Message,
  Attachment,
  ChatCompletionResponse,
  ChatCompletionStreamResponse,
  AttachmentRequest,
} from "./types";
import {
  useConnectionListeners,
  useTheme,
  useChatCompletion,
  useToggleBodyClass,
  usePersistChatHistory,
  usePersistActiveChatId,
  useHydrateActiveChat,
  useUnmount,
  useRespondingStatus,
} from "./hooks";
import {
  buildAttachmentRequestPayload,
  buildChatPreview,
  cloneMessages,
  createChatRecordFromMessages,
  extractAssistantReply,
  getChatCompletionContentText,
  getId,
  toChatCompletionMessages,
} from "./utils";

import { ASSISTANT_ERROR_MESSAGE, DEFAULT_CHAT_MODEL, defaultChats, suggestions } from "./config";

import "./App.css";

const App = () => {
  const isNavigatorOnline =
    typeof navigator !== "undefined" && "onLine" in navigator
      ? navigator.onLine
      : true;
  const [messages, setMessages] = useAtom(messagesAtom);
  const [isResponding, setResponding] = useAtom(respondingAtom);
  const [inputValue, setInputValue] = useState("");
  const [isChatOpen, setChatOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSummary[]>(() =>
    [...defaultChats].sort((a, b) => b.updatedAt - a.updatedAt)
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(isNavigatorOnline);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    isNavigatorOnline ? "online" : "offline"
  );
  const chatCompletion = useChatCompletion();
  const {
    mutate: sendChatCompletion,
    reset: resetChatCompletion,
    status: chatCompletionStatus,
  } = chatCompletion;
  const pendingRequestRef = useRef<AbortController | null>(null);
  const isNewChat = messages.length === 0;

  const cancelPendingResponse = useCallback(() => {
    if (pendingRequestRef.current) {
      pendingRequestRef.current.abort();
      pendingRequestRef.current = null;
    }

    if (chatCompletionStatus !== "idle") {
      resetChatCompletion();
    }

    setResponding(false);
  }, [chatCompletionStatus, resetChatCompletion, setResponding]);

  useTheme();
  useToggleBodyClass("chat-open", isChatOpen);
  usePersistChatHistory(chatHistory, setChatHistory);
  usePersistActiveChatId(activeChatId, setActiveChatId);
  useRespondingStatus(chatCompletionStatus, setResponding);
  useHydrateActiveChat({
    activeChatId,
    chatHistory,
    setMessages,
    setChatOpen,
  });
  useConnectionListeners({
    cancelPendingResponse,
    setConnectionStatus,
    setIsOnline,
  });

  useUnmount(cancelPendingResponse);

  const updateActiveChat = useCallback(
    (nextMessages: Message[], previewMessage?: Message) => {
      if (!activeChatId) {
        return;
      }

      const previewCandidate =
        previewMessage ?? nextMessages[nextMessages.length - 1];

      setChatHistory((current) =>
        current
          .map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  preview: buildChatPreview(previewCandidate, chat.preview),
                  updatedAt: Date.now(),
                  messages: cloneMessages(nextMessages),
                }
              : chat
          )
          .sort((a, b) => b.updatedAt - a.updatedAt)
      );
    },
    [activeChatId]
  );

  const archiveCurrentConversation = useCallback(() => {
    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];

    if (activeChatId) {
      setChatHistory((current) =>
        current
          .map((chat) =>
            chat.id === activeChatId
              ? {
                  ...chat,
                  preview: buildChatPreview(lastMessage, chat.preview),
                  updatedAt: Date.now(),
                  messages: cloneMessages(messages),
                }
              : chat
          )
          .sort((a, b) => b.updatedAt - a.updatedAt)
      );
      return;
    }

    const newChat = createChatRecordFromMessages(messages);
    setChatHistory((current) =>
      [newChat, ...current].sort((a, b) => b.updatedAt - a.updatedAt)
    );
  }, [activeChatId, messages]);

  const handleSend = useCallback(
    async ({ text, attachments }: UserInputSendPayload) => {
      if (!text && attachments.length === 0) {
        return false;
      }

      if (pendingRequestRef.current) {
        return false;
      }

      if (chatCompletionStatus === "error") {
        resetChatCompletion();
      }

      if (!isChatOpen) {
        setChatOpen(true);
      }

      let messageAttachments: Attachment[] = [];
      let requestAttachments: AttachmentRequest[] = [];

      if (attachments.length) {
        try {
          requestAttachments = await buildAttachmentRequestPayload(attachments);
        } catch (error) {
          console.error("Unable to read attachments", error);
          return false;
        }

        messageAttachments = attachments.map<Attachment>(({ file, ...metadata }) => ({
          ...metadata,
        }));
      }

      const userMessage: Message = {
        id: getId(),
        sender: "user",
        content: text,
        ...(messageAttachments.length
          ? { attachments: messageAttachments }
          : {}),
      };

      const assistantMessageId = getId();
      const assistantMessage: Message = {
        id: assistantMessageId,
        sender: "bot",
        content: "",
      };
      
      let assistantReply = "";
      const conversationForRequest = [...messages, userMessage];

      setMessages((current) => {
        const next = [...current, userMessage, assistantMessage];
        updateActiveChat(next, userMessage);
        return next;
      });

      setInputValue("");
      setResponding(true);

      const controller = new AbortController();
      pendingRequestRef.current = controller;

      sendChatCompletion(
        {
          body: {
            model: DEFAULT_CHAT_MODEL,
            messages: toChatCompletionMessages(conversationForRequest),
            stream: true,
            ...(requestAttachments.length
              ? { attachments: requestAttachments }
              : {}),
          },
          signal: controller.signal,
          onChunk: (chunk: ChatCompletionStreamResponse) => {
            const contentDelta = chunk?.choices?.reduce((acc, choice) => {
              if (choice.delta?.content) {
                const deltaText = getChatCompletionContentText(choice.delta.content);
                if (deltaText) {
                  return acc + deltaText;
                }
              }
              return acc;
            }, "");

            if (!contentDelta) {
              return;
            }

            assistantReply += contentDelta;

            setMessages((current) => {
              let previewMessage: Message | undefined;
              const next = current.map((message) => {
                if (message.id === assistantMessageId) {
                  const updated = { ...message, content: assistantReply };
                  previewMessage = updated;
                  return updated;
                }
                return message;
              });

              if (previewMessage) {
                updateActiveChat(next, previewMessage);
              }

              return next;
            });
          },
        },
        {
          onSuccess: (response: ChatCompletionResponse) => {
            const finalAssistantReply = extractAssistantReply(response);
            if (!finalAssistantReply) {
              return;
            }

            setMessages((current) => {
              let previewMessage: Message | undefined;
              const next = current.map((message) => {
                if (message.id === assistantMessageId) {
                  if (message.content === finalAssistantReply) {
                    previewMessage = message;
                    return message;
                  }
                  const updated = { ...message, content: finalAssistantReply };
                  previewMessage = updated;
                  return updated;
                }
                return message;
              });

              if (previewMessage) {
                updateActiveChat(next, previewMessage);
              }

              return next;
            });
          },
          onError: (error: unknown) => {
            if (error instanceof DOMException && error.name === "AbortError") {
              return;
            }

            console.error("Chat completion request failed", error);

            setMessages((current) => {
              let previewMessage: Message | undefined;
              const next = current.map((message) => {
                if (message.id === assistantMessageId) {
                  const updated = {
                    ...message,
                    content: ASSISTANT_ERROR_MESSAGE,
                  };
                  previewMessage = updated;
                  return updated;
                }
                return message;
              });

              if (previewMessage) {
                updateActiveChat(next, previewMessage);
              }

              return next;
            });
          },
          onSettled: () => {
            if (pendingRequestRef.current === controller) {
              pendingRequestRef.current = null;
            }
            setResponding(false);
          },
        }
      );

      return true;
    },
    [
      chatCompletionStatus,
      isChatOpen,
      messages,
      resetChatCompletion,
      sendChatCompletion,
      setChatOpen,
      setInputValue,
      setMessages,
      setResponding,
      updateActiveChat,
    ]
  );

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const handleSuggestionSelect = useCallback(
    (value: string) => {
      setInputValue(value);
      inputRef.current?.focus();
    },
    [inputRef, setInputValue]
  );

  const suggestionItems = useMemo(
    () =>
      suggestions.map((suggestion) => ({
        ...suggestion,
        handleSelect: () => handleSuggestionSelect(suggestion.prompt),
      })),
    [handleSuggestionSelect]
  );

  const handleNewChat = useCallback(() => {
    cancelPendingResponse();
    archiveCurrentConversation();
    setMessages([]);
    setActiveChatId(null);
    setInputValue("");
    setChatOpen(false);
    setSidebarCollapsed(false);
  }, [
    archiveCurrentConversation,
    cancelPendingResponse,
    setChatOpen,
    setInputValue,
    setMessages,
    setSidebarCollapsed,
  ]);

  const handleSelectChat = useCallback(
    (chatId: string) => {
      const selectedChat = chatHistory.find((chat) => chat.id === chatId);
      if (!selectedChat) {
        return;
      }

      cancelPendingResponse();
      archiveCurrentConversation();
      setActiveChatId(chatId);
      setMessages(cloneMessages(selectedChat.messages));
      setInputValue("");
      setChatOpen(true);
    },
    [
      archiveCurrentConversation,
      cancelPendingResponse,
      chatHistory,
      setChatOpen,
      setInputValue,
      setMessages,
    ]
  );

  const handleRemoveChat = useCallback(
    (chatId: string) => {
      let removalOccurred = false;
      let nextActiveId: string | null = activeChatId;
      let nextMessages: Message[] = [];
      let shouldReset = false;

      setChatHistory((current) => {
        if (current.length === 0) {
          return current;
        }

        const filtered = current.filter((chat) => chat.id !== chatId);

        if (filtered.length === current.length) {
          return current;
        }

        removalOccurred = true;

        if (filtered.length === 0) {
          nextActiveId = null;
          shouldReset = true;
          return filtered;
        }

        if (chatId === activeChatId) {
          const [nextChat] = filtered;
          nextActiveId = nextChat?.id ?? null;
          nextMessages = nextChat ? cloneMessages(nextChat.messages) : [];
          shouldReset = !nextActiveId;
        }

        return filtered;
      });

      if (!removalOccurred) {
        return;
      }

      cancelPendingResponse();

      if (shouldReset || !nextActiveId) {
        setActiveChatId(null);
        setMessages([]);
        setChatOpen(false);
        setSidebarCollapsed(false);
        setInputValue("");
        return;
      }

      if (chatId === activeChatId && nextActiveId) {
        setActiveChatId(nextActiveId);
        setMessages(nextMessages);
        setChatOpen(true);
        setInputValue("");
      }
    },
    [
      activeChatId,
      cancelPendingResponse,
      setChatOpen,
      setInputValue,
      setMessages,
      setSidebarCollapsed,
    ]
  );

  const suggestionsClasses = ["suggestions"];

  if (isChatOpen) {
    suggestionsClasses.push("suggestions--hidden");
  }

  const handleSkipToMessages = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const target = document.getElementById("messages");
      if (target instanceof HTMLElement) {
        target.focus();
      }
    },
    []
  );

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((previous) => !previous);
  }, [setSidebarCollapsed]);

  return (
    <article className="app">
      <a href="#messages" className="skip-link" onClick={handleSkipToMessages}>
        Skip to conversation
      </a>
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggle={handleToggleSidebar}
        chats={chatHistory}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onRemoveChat={handleRemoveChat}
      />
      <main className="chat-wrapper" aria-label="Chat interface">
        <div className="chat-main chat-main__content">
            <Show when={!isNewChat}>
              <ChatWindow
                messages={messages}
                isResponding={isResponding}
              />
            </Show>
              <div className="chat-main__inline-input">
                <UserInput
                  ref={inputRef}
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSend}
                  onStop={cancelPendingResponse}
                  isResponding={isResponding}
                />
              </div>
            <Show when={isNewChat}>
              <Suggestions
                suggestions={suggestionItems}
                classes={suggestionsClasses}
              />
            </Show>
          </div>
      </main>
    </article>
  );
};

export default App;
