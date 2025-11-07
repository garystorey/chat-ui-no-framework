import { UseMutationOptions } from '@tanstack/react-query';
import { ApiError } from '../utils';

export type Theme = 'light' | 'dark';

export type AttachmentRequest = {
  id: string;
  filename: string;
  mime_type: string;
  data: string;
};

export type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File;
};

export type Message = {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  renderAsHtml?: boolean;
  attachments?: Attachment[];
};

export type ChatSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
  messages: Message[];
};

export type UserInputSendPayload = {
  text: string;
  attachments: Attachment[];
};

export type ApiMutationVariables = Omit<ApiRequestOptions, 'path' | 'method'> & {
  path?: string;
};

export type UseApiMutationConfig<TResponse> = {
  path: string;
  method?: string;
  options?: Omit<
    UseMutationOptions<TResponse, ApiError, ApiMutationVariables, unknown>,
    'mutationFn'
  >;
};

export type ApiRequestOptions = {
  path: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export type ApiStreamRequestOptions<TMessage, TResponse> = {
  path: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  onMessage?: (message: TMessage) => void;
  parseMessage?: (data: string) => TMessage;
  buildResponse: (messages: TMessage[]) => TResponse;
};


export type ChatCompletionRole = 'system' | 'user' | 'assistant';

export type ChatCompletionAttachmentReference = { id: string };

export type ChatCompletionContentPart =
  | {
      type: 'text' | 'output_text';
      text: string;
    }
  | {
      type: 'input_text';
      text: string;
      attachments?: ChatCompletionAttachmentReference[];
    };

export type ChatCompletionMessage = {
  role: ChatCompletionRole;
  content: string | ChatCompletionContentPart[];
};

export type ChatCompletionRequest = {
  model: string;
  messages: ChatCompletionMessage[];
  stream?: boolean;
  attachments?: AttachmentRequest[];
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

export type ChatCompletionStreamChoice = {
  index: number;
  delta?: Partial<ChatCompletionMessage>;
  finish_reason?: string | null;
};

export type ChatCompletionStreamResponse = {
  id?: string;
  choices: ChatCompletionStreamChoice[];
};

export type Suggestion = {
  id: number;
  title: string;
  description: string;
  actionLabel: string;
  icon: string;
  handleSelect: () => void;
};
  
