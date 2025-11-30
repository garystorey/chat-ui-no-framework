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
} from "./types";
import {
  useConnectionListeners,
  useTheme,
  useChatCompletion,
  useToggleBodyClass,
  usePersistChatHistory,
  useHydrateActiveChat,
  useUnmount,
  useRespondingStatus,
} from "./hooks";
import {
  buildChatPreview,
  cloneMessages,
  createChatRecordFromMessages,
  extractAssistantReply,
  getChatCompletionContentText,
  getId,
} from "./utils";

import { ASSISTANT_ERROR_MESSAGE, DEFAULT_CHAT_MODEL, defaultChats, suggestions } from "./config";

import "./App.css";

const App = () => {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [isResponding, setResponding] = useAtom(respondingAtom);
  const [inputValue, setInputValue] = useState("");
  const [isChatOpen, setChatOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSummary[]>(() =>
    [...defaultChats].sort((a, b) => b.updatedAt - a.updatedAt)
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    "offline"
  );
  const chatCompletion = useChatCompletion();
  const {
    mutate: sendChatCompletion,
    reset: resetChatCompletion,
    status: chatCompletionStatus,
  } = chatCompletion;
  const pendingRequestRef = useRef<AbortController | null>(null);
  const streamBufferRef = useRef("");
  const streamFlushTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
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
  });

  useUnmount(cancelPendingResponse);

  const updateActiveChat = useCallback(
    (
      nextMessages: Message[],
      chatId: string | null,
      previewMessage?: Message
    ) => {
      if (!chatId) {
        return;
      }

      const previewCandidate =
        previewMessage ?? nextMessages[nextMessages.length - 1];

      setChatHistory((current) => {
        const existingChat = current.find((chat) => chat.id === chatId);
        const updatedChat = existingChat
          ? {
              ...existingChat,
              preview: buildChatPreview(previewCandidate, existingChat.preview),
              updatedAt: Date.now(),
              messages: cloneMessages(nextMessages),
            }
          : { ...createChatRecordFromMessages(nextMessages), id: chatId };

        const nextHistory = existingChat
          ? current.map((chat) => (chat.id === chatId ? updatedChat : chat))
          : [updatedChat, ...current];

        return nextHistory.sort((a, b) => b.updatedAt - a.updatedAt);
      });
    },
    [setChatHistory]
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

      if (attachments.length) {
        messageAttachments = attachments.map<Attachment>(({ file, ...metadata }) => ({
          ...metadata,
        }));
      }

      const chatId = activeChatId ?? getId();

      if (!activeChatId) {
        setActiveChatId(chatId);
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

      const flushStreamBuffer = () => {
        if (!streamBufferRef.current) {
          return;
        }

        assistantReply += streamBufferRef.current;
        streamBufferRef.current = "";

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
            updateActiveChat(next, chatId, previewMessage);
          }

          return next;
        });
      };

      const scheduleStreamFlush = () => {
        if (streamFlushTimeoutRef.current) {
          return;
        }

        streamFlushTimeoutRef.current = window.setTimeout(() => {
          streamFlushTimeoutRef.current = null;
          flushStreamBuffer();
        }, 100);
      };

      setMessages((current) => {
        const next = [...current, userMessage, assistantMessage];
        updateActiveChat(next, chatId, userMessage);
        return next;
      });

      setInputValue("");
      setResponding(true);

      const controller = new AbortController();
      pendingRequestRef.current = controller;

      sendChatCompletion(
        {
          model: DEFAULT_CHAT_MODEL,
          messages: conversationForRequest,
          attachments,
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

            streamBufferRef.current += contentDelta;
            scheduleStreamFlush();
          },
        },
        {
          onSuccess: (response: ChatCompletionResponse) => {
            if (streamFlushTimeoutRef.current) {
              clearTimeout(streamFlushTimeoutRef.current);
              streamFlushTimeoutRef.current = null;
            }

            flushStreamBuffer();

            const finalAssistantReply = extractAssistantReply(response);
            if (!finalAssistantReply) {
              return;
            }

            assistantReply = finalAssistantReply;

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
                updateActiveChat(next, chatId, previewMessage);
              }

              return next;
            });
          },
          onError: (error: unknown) => {
            if (streamFlushTimeoutRef.current) {
              clearTimeout(streamFlushTimeoutRef.current);
              streamFlushTimeoutRef.current = null;
            }

            streamBufferRef.current = "";

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
                updateActiveChat(next, chatId, previewMessage);
              }

              return next;
            });
          },
          onSettled: () => {
            if (pendingRequestRef.current === controller) {
              pendingRequestRef.current = null;
            }

            if (streamFlushTimeoutRef.current) {
              clearTimeout(streamFlushTimeoutRef.current);
              streamFlushTimeoutRef.current = null;
            }

            streamBufferRef.current = "";
            setResponding(false);
          },
        }
      );

      return true;
    },
    [
      chatCompletionStatus,
      activeChatId,
      isChatOpen,
      messages,
      resetChatCompletion,
      sendChatCompletion,
      setChatOpen,
      setInputValue,
      setActiveChatId,
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
      const isRemovingActiveChat = chatId === activeChatId;

      setChatHistory((current) => {
        if (current.length === 0) {
          return current;
        }

        const filtered = current.filter((chat) => chat.id !== chatId);

        if (filtered.length === current.length) {
          return current;
        }

        removalOccurred = true;

        return filtered;
      });

      if (!removalOccurred) {
        return;
      }

      cancelPendingResponse();

      if (isRemovingActiveChat) {
        setActiveChatId(null);
        setMessages([]);
        setChatOpen(false);
        setSidebarCollapsed(false);
        setInputValue("");
      }
    },
    [
      activeChatId,
      cancelPendingResponse,
      setActiveChatId,
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
        connectionStatus={connectionStatus}
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
