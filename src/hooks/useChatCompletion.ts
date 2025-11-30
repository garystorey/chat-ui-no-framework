import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../utils';
import { ChatCompletionResponse, ChatCompletionStreamResponse, Message } from '../types';
import { useChatClient } from '../services/chatClientContext';

type ChatCompletionMutationVariables = {
  model: string;
  messages: Message[];
  attachments?: Message['attachments'];
  signal?: AbortSignal;
  onChunk?: (chunk: ChatCompletionStreamResponse) => void;
};

export default function useChatCompletion() {
  const client = useChatClient();

  return useMutation<ChatCompletionResponse, ApiError, ChatCompletionMutationVariables>({
    mutationFn: async ({ model, messages, attachments, signal, onChunk }) =>
      client.send({ model, messages, attachments, signal, onChunk }),
  });
}
