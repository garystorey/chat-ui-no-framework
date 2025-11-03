import { useApiMutation } from './useApiMutation';

export type ChatCompletionRole = 'system' | 'user' | 'assistant';

export type ChatCompletionMessage = {
  role: ChatCompletionRole;
  content: string;
};

export type ChatCompletionRequest = {
  model: string;
  messages: ChatCompletionMessage[];
  stream?: boolean;
  [key: string]: unknown;
};

export type ChatCompletionChoice = {
  index: number;
  message: ChatCompletionMessage;
  finish_reason?: string | null;
};

export type ChatCompletionResponse = {
  id?: string;
  choices: ChatCompletionChoice[];
};

export const CHAT_COMPLETION_PATH = '/v1/chat/completions';

export const DEFAULT_CHAT_MODEL = 'gpt-4o-mini';

export function useChatCompletion() {
  return useApiMutation<ChatCompletionResponse>({
    path: CHAT_COMPLETION_PATH,
    method: 'POST',
  });
}
