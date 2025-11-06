import type {
  ChatSummary,
  Message,
  ChatCompletionMessage,
  ChatCompletionResponse,
  ChatCompletionChoice,
  ChatCompletionContentPart,
} from '../types';
import { getId } from './id';
import { getPlainTextFromHtml, normalizeWhitespace, truncate } from './text';

export const cloneMessages = (items: Message[]): Message[] =>
  items.map((item) => ({ ...item }));

export const getMessagePlainText = (message?: Message) => {
  if (!message) {
    return '';
  }

  if (message.renderAsHtml) {
    return getPlainTextFromHtml(message.content);
  }

  return normalizeWhitespace(message.content);
};

export const toChatCompletionMessages = (
  messages: Message[]
): ChatCompletionMessage[] =>
  messages.map((message) => {
    const text = getMessagePlainText(message);
    const hasAttachments =
      message.sender === 'user' && Array.isArray(message.attachments) && message.attachments.length > 0;

    let content: ChatCompletionContentPart[];

    if (text || hasAttachments) {
      content = [
        {
          type: 'text',
          text: text ?? '',
          ...(hasAttachments
            ? {
                attachments: message.attachments?.map((attachment) => ({ id: attachment.id })) ?? [],
              }
            : {}),
        },
      ];
    } else {
      content = [{ type: 'text', text: '' }];
    }

    return {
      role: message.sender === 'user' ? 'user' : 'assistant',
      content,
    };
  });

export const extractAssistantReply = (response: ChatCompletionResponse) => {
  if (!response?.choices?.length) {
    return '';
  }

  const assistantChoice = response.choices.find(
    (choice: ChatCompletionChoice) => choice.message.role === 'assistant'
  );
  return assistantChoice?.message?.content?.trim() ?? '';
};

export const buildChatTitle = (
  message?: Message,
  fallback = 'Conversation'
) =>
  truncate(
    getMessagePlainText(message) || getPlainTextFromHtml(fallback) || 'Conversation',
    60
  ) || 'Conversation';

export const buildChatPreview = (
  message?: Message,
  fallback = 'Conversation'
) =>
  truncate(
    getMessagePlainText(message) || getPlainTextFromHtml(fallback) || 'Conversation',
    80
  ) || 'Conversation';

export const createChatRecordFromMessages = (messages: Message[]): ChatSummary => {
  const firstUserMessage = messages.find((message) => message.sender === 'user');
  const lastMessage = messages[messages.length - 1];
  const title = buildChatTitle(firstUserMessage);
  const preview = buildChatPreview(lastMessage, title);

  return {
    id: getId(),
    title,
    preview,
    updatedAt: Date.now(),
    messages: cloneMessages(messages),
  };
};
