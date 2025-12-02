import { useMutation } from '@tanstack/react-query';
import { ApiError, apiStreamRequest, buildChatCompletionResponse } from '../utils';
import {
  ChatCompletionRequest,
  ChatCompletionStreamResponse,
  ChatCompletionResponse,
} from '../types';
import { CHAT_COMPLETION_PATH } from '../config';

type ChatCompletionMutationVariables = {
  body: ChatCompletionRequest;
  signal?: AbortSignal;
  onChunk?: (chunk: ChatCompletionStreamResponse) => void;
};

export default function useChatCompletion() {
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
