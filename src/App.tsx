import { useAtom } from 'jotai';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';
import type { Message, MessageAttachment } from './atoms/chatAtoms';
import { messagesAtom, typingAtom } from './atoms/chatAtoms';
import { Card, ChatWindow, Sidebar, UserInput } from './components';
import type { UserInputSendPayload } from './components';
import type { ChatSummary } from './types/chat';
import {
  useTheme,
  useChatCompletion,
  DEFAULT_CHAT_MODEL,
  type ChatCompletionResponse,
  type ChatCompletionStreamResponse,
} from './hooks';
import './App.css';
import {
  buildAttachmentRequestPayload,
  buildChatPreview,
  buildMessageAttachments,
  cloneMessages,
  createChatRecordFromMessages,
  extractAssistantReply,
  getId,
  toChatCompletionMessages,
} from './utils';
import type { AttachmentRequest } from './utils';



const suggestions = [
  {
    id: 12312,
    title: 'Top Python developers',
    description:
      'Find me the top 5 Python developers with 5+ years of experience that have worked on at least 2 Endava projects.',
    prompt:
      'Find me the top 5 Python developers with 5+ years of experience that have worked on at least 2 Endava projects.',
    actionLabel: 'Start',
    icon: '🐍',
  },
  {
    id: 234242,
    title: 'Match candidates to a SOW',
    description:
      'Below is a statement of work. Give me the top 5 candidates for each position listed. Make sure they match the required skills and experience.',
    prompt:
      'Below is a statement of work. Give me the top 5 candidates for each position listed. Make sure they match the required skills and experience.',
    actionLabel: 'Start',
    icon: '📝',
  },
  {
    id: 345345,
    title: 'React availability check',
    description:
      'Show me React developers available in the next two weeks with strong TypeScript and Tailwind CSS skills.',
    prompt:
      'Show me React developers available in the next two weeks with strong TypeScript and Tailwind CSS skills.',
    actionLabel: 'Start',
    icon: '⚛️',
  },
];

const defaultChats: ChatSummary[] = [
  {
    id: '12321',
    title: 'ClientX Team pairing ideas',
    preview: 'Based on the requirements for ClientX, give me three pairing ideas that balance mobile, API, and QA expertise for the payments team.',
    updatedAt: Date.now() - 1000 * 60 * 15,
    messages: [
      {
        id: '4233423',
        sender: 'user',
        content:
          'Can you suggest a few pairings of engineers for ClientX who have complementary skills for the payments team?',
      },
      {
        id: '4345',
        sender: 'bot',
        content:
          'Here are three pairing ideas that balance mobile, API, and QA expertise for the payments pod.',
      },
    ],
  },
  {
    id: '23439',
    title: 'ATL Staffing follow-up',
    preview: 'We still have four roles open in Atlanta for Cox: two frontend, one backend, and a data analyst position.',
    updatedAt: Date.now() - 1000 * 60 * 60,
    messages: [
      {
        id: '98767',
        sender: 'user',
        content: 'Can you recap the open roles we still need to fill in Atlanta for Cox?',
      },
      {
        id: '67534',
        sender: 'bot',
        content:
          'We still have four roles open at Cox in Atlanta: two frontend, one backend, and a data analyst position. Would you like me to suggest candidates for any of these roles?',
      },
    ],
  },
  {
    id: '86634343',
    title: 'Nimbus SOW notes',
    preview: 'Next position for Nimbus onboarding',
    updatedAt: Date.now() - 1000 * 60 * 90,
    messages: [
      {
        id: '55333378',
        sender: 'user',
        content: 'Return the next position from the Nimbus statement of work and the top five candidates for that position.',
      },
      {
        id: '676656777',
        sender: 'bot',
        content: 'The next position for Nimbus onboarding is **Senior Frontend Engineer**. The requirements are: - React, - TypeScript, - AWS experience. Here are the top five candidates for this role...',
      },
    ],
  },
];

const ASSISTANT_ERROR_MESSAGE =
  'Sorry, I had trouble reaching the assistant. Please try again.';

const App = () => {
  const [messages, setMessages] = useAtom(messagesAtom);
  const [isTyping, setTyping] = useAtom(typingAtom);
  const [inputValue, setInputValue] = useState('');
  const [isChatOpen, setChatOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSummary[]>(() =>
    [...defaultChats].sort((a, b) => b.updatedAt - a.updatedAt)
  );
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const chatCompletion = useChatCompletion();
  const {
    mutate: sendChatCompletion,
    reset: resetChatCompletion,
    status: chatCompletionStatus,
  } = chatCompletion;
  const pendingRequestRef = useRef<AbortController | null>(null);
  const cancelPendingResponseRef = useRef<() => void>(() => {});
  const isFreshChat = messages.length === 0;

  useTheme();

  useEffect(() => {
    document.body.classList.toggle('chat-open', isChatOpen);
    return () => {
      document.body.classList.remove('chat-open');
    };
  }, [isChatOpen]);

  const cancelPendingResponse = useCallback(() => {
    if (pendingRequestRef.current) {
      pendingRequestRef.current.abort();
      pendingRequestRef.current = null;
    }

    if (chatCompletionStatus !== 'idle') {
      resetChatCompletion();
    }

    setTyping(false);
  }, [chatCompletionStatus, resetChatCompletion, setTyping]);

  useEffect(() => {
    cancelPendingResponseRef.current = cancelPendingResponse;
  }, [cancelPendingResponse]);

  useEffect(() => {
    return () => {
      cancelPendingResponseRef.current();
    };
  }, []);

  useEffect(() => {
    setTyping(chatCompletionStatus === 'pending');
  }, [chatCompletionStatus, setTyping]);

  const updateActiveChat = useCallback(
    (nextMessages: Message[], previewMessage?: Message) => {
      if (!activeChatId) {
        return;
      }

      const previewCandidate = previewMessage ?? nextMessages[nextMessages.length - 1];

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
      if (!text) {
        return false;
      }

      if (pendingRequestRef.current) {
        return false;
      }

      if (chatCompletionStatus === 'error') {
        resetChatCompletion();
      }

      if (!isChatOpen) {
        setChatOpen(true);
      }

      let messageAttachments: MessageAttachment[] = [];
      let requestAttachments: AttachmentRequest[] = [];

      if (attachments.length) {
        messageAttachments = buildMessageAttachments(attachments);

        try {
          requestAttachments = await buildAttachmentRequestPayload(
            attachments,
            messageAttachments
          );
        } catch (error) {
          console.error('Unable to read attachments', error);
          return false;
        }
      }

      const userMessage: Message = {
        id: getId(),
        sender: 'user',
        content: text,
        ...(messageAttachments.length ? { attachments: messageAttachments } : {}),
      };
      const assistantMessageId = getId();
      const assistantMessage: Message = { id: assistantMessageId, sender: 'bot', content: '' };
      let assistantReply = '';
      const conversationForRequest = [...messages, userMessage];

      setMessages((current) => {
        const next = [...current, userMessage, assistantMessage];
        updateActiveChat(next, userMessage);
        return next;
      });

      setInputValue('');
      setTyping(true);

      const controller = new AbortController();
      pendingRequestRef.current = controller;

      sendChatCompletion(
        {
          body: {
            model: DEFAULT_CHAT_MODEL,
            messages: toChatCompletionMessages(conversationForRequest),
            stream: true,
            ...(requestAttachments.length ? { attachments: requestAttachments } : {}),
          },
          signal: controller.signal,
          onChunk: (chunk: ChatCompletionStreamResponse) => {
            const contentDelta = chunk?.choices?.reduce((acc, choice) => {
              if (choice.delta?.content) {
                return acc + choice.delta.content;
              }
              return acc;
            }, '');

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
            if (error instanceof DOMException && error.name === 'AbortError') {
              return;
            }

            console.error('Chat completion request failed', error);

            setMessages((current) => {
              let previewMessage: Message | undefined;
              const next = current.map((message) => {
                if (message.id === assistantMessageId) {
                  const updated = { ...message, content: ASSISTANT_ERROR_MESSAGE };
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
            setTyping(false);
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
      setTyping,
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
    setInputValue('');
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
      setInputValue('');
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
        setInputValue('');
        return;
      }

      if (chatId === activeChatId && nextActiveId) {
        setActiveChatId(nextActiveId);
        setMessages(nextMessages);
        setChatOpen(true);
        setInputValue('');
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

  const suggestionsClasses = ['suggestions'];

  if (isChatOpen) {
    suggestionsClasses.push('suggestions--hidden');
  }

  const handleSkipToMessages = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const target = document.getElementById('messages');
      if (target instanceof HTMLElement) {
        target.focus();
      }
    },
    []
  );

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed((previous) => !previous);
  }, [setSidebarCollapsed]);

  const suggestionsSection = (
    <section
      className={suggestionsClasses.join(' ')}
      aria-hidden={isChatOpen}
      aria-labelledby="suggestions-heading"
    >
      <h2 id="suggestions-heading" className="sr-only">
        Suggested prompts
      </h2>
      <ul className="suggestions__list">
        {suggestionItems.map((suggestion) => (
          <li key={suggestion.id} className="suggestions__item">
            <Card
              title={suggestion.title}
              description={suggestion.description}
              actionLabel={suggestion.actionLabel}
              icon={suggestion.icon}
              onSelect={suggestion.handleSelect}
            />
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <div className="app">
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
        <div className="chat-main">
          <div
            className={`chat-main__content ${isFreshChat ? 'chat-main__content--centered' : ''}`}
          >
            {isFreshChat ? (
              <>
                <div className="chat-main__inline-input">
                  <UserInput
                    ref={inputRef}
                    value={inputValue}
                    onChange={setInputValue}
                    onSend={handleSend}
                  />
                </div>
                {suggestionsSection}
              </>
            ) : (
              suggestionsSection
            )}
            <ChatWindow messages={messages} isTyping={isTyping} isOpen={isChatOpen} />
          </div>
        </div>
        {!isFreshChat ? (
          <UserInput
            ref={inputRef}
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
          />
        ) : null}
      </main>
    </div>
  );
};

export default App;
