import {
  Attachment,
  ChatCompletionResponse,
  ChatCompletionStreamResponse,
  Message,
} from '../types';

export type ChatClientRequest = {
  model: string;
  messages: Message[];
  attachments?: Attachment[];
  signal?: AbortSignal;
  onChunk?: (chunk: ChatCompletionStreamResponse) => void;
};

export interface ChatCompletionClient {
  send(request: ChatClientRequest): Promise<ChatCompletionResponse>;
}
