import { useMutation } from '@tanstack/react-query';
import { ApiError, apiStreamRequest, getChatCompletionContentText } from '../utils';
import { ChatCompletionRequest, ChatCompletionStreamResponse, ChatCompletionResponse, ChatCompletionChoice } from '../types';

export const CHAT_COMPLETION_PATH = '/v1/chat/completions';
export const DEFAULT_CHAT_MODEL = 'gpt-4o-mini';

type ChatCompletionMutationVariables = {
  body: ChatCompletionRequest;
  signal?: AbortSignal;
  onChunk?: (chunk: ChatCompletionStreamResponse) => void;
};

const buildChatCompletionResponse = (
  chunks: ChatCompletionStreamResponse[]
): ChatCompletionResponse => {
  if (!chunks.length) {
    return { choices: [] };
  }

  const aggregated = new Map<number, ChatCompletionChoice>();

  chunks.forEach((chunk) => {
    chunk.choices?.forEach((choice) => {
      const existing = aggregated.get(choice.index) ?? {
        index: choice.index,
        message: { role: 'assistant', content: '' },
        finish_reason: null,
      };

      if (choice.delta?.role) {
        existing.message.role = choice.delta.role;
      }
      if (choice.delta?.content) {
        const deltaText = getChatCompletionContentText(choice.delta.content);
        if (deltaText) {
          existing.message.content = `${existing.message.content ?? ''}${deltaText}`;
        }
      }
      if (choice.finish_reason !== undefined) {
        existing.finish_reason = choice.finish_reason;
      }

      aggregated.set(choice.index, existing);
    });
  });

  return {
    id: chunks[chunks.length - 1]?.id,
    choices: Array.from(aggregated.values()).sort((a, b) => a.index - b.index),
  };
};

export function useChatCompletion() {
  return useMutation<ChatCompletionResponse, ApiError, ChatCompletionMutationVariables>({
    mutationFn: async ({ body, signal, onChunk }) => {
      return apiStreamRequest<ChatCompletionStreamResponse, ChatCompletionResponse>({
        path: CHAT_COMPLETION_PATH,
        method: 'POST',
        body,
        signal,
        onMessage: onChunk,
        buildResponse: buildChatCompletionResponse,
      });
    },
  });
}
