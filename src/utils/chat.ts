import type { Message } from '../atoms/chat';
import type { ChatCompletionMessage, ChatCompletionResponse } from '../hooks';
import type { ChatSummary } from '../types';
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
  messages.map((message) => ({
    role: message.sender === 'user' ? 'user' : 'assistant',
    content: getMessagePlainText(message),
  }));

export const extractAssistantReply = (response: ChatCompletionResponse) => {
  if (!response?.choices?.length) {
    return '';
  }

  const assistantChoice = response.choices.find(
    (choice) => choice.message.role === 'assistant'
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
