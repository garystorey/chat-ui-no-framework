import { CHAT_COMPLETION_PATH, RESPONSES_PATH } from '../config/App.config';
import { buildAttachmentRequestPayload, readAttachmentTextContent, toChatCompletionMessages } from '../utils';
import { buildChatCompletionResponse } from '../utils/chatCompletion';
import {
  Attachment,
  ChatCompletionContentPart,
  ChatCompletionResponse,
  ChatCompletionStreamResponse,
  Message,
} from '../types';
import { apiStreamRequest } from '../utils/apiClient';
import { ChatClientRequest, ChatCompletionClient } from './chatClient';

const buildAttachmentContext = async (attachments: Attachment[] = []) => {
  const parts = await Promise.all(
    attachments.map(async (attachment, index) => {
      const content = await readAttachmentTextContent(attachment);
      if (!content) {
        return null;
      }

      return `Attachment ${index + 1}: ${attachment.name}\n${content}`;
    })
  );

  return parts.filter(Boolean).join('\n\n');
};

const appendAttachmentContext = async (
  messages: Message[],
  attachments?: Attachment[]
): Promise<Message[]> => {
  if (!attachments?.length) {
    return messages.map((message) => ({ ...message, attachments: undefined }));
  }

  const context = await buildAttachmentContext(attachments);
  if (!context) {
    return messages.map((message) => ({ ...message, attachments: undefined }));
  }

  const targetIndex = [...messages]
    .map((message, index) => ({ message, index }))
    .filter(({ message }) => message.sender === 'user')
    .map(({ index }) => index)
    .pop();

  const nextMessages = messages.map((message, index) => {
    if (index !== targetIndex) {
      return { ...message, attachments: undefined };
    }

    return {
      ...message,
      attachments: undefined,
      content: `${message.content}\n\n${context}`.trim(),
    };
  });

  return nextMessages;
};

const mapResponseStreamEvent = (
  payload: Record<string, unknown>
): ChatCompletionStreamResponse => {
  const textDelta =
    typeof payload.output_text_delta === 'string'
      ? payload.output_text_delta
      : typeof payload.output_text === 'string'
        ? payload.output_text
        : '';

  const id =
    (typeof payload.id === 'string' && payload.id) ||
    (typeof payload.response === 'object' &&
      payload.response !== null &&
      typeof (payload.response as { id?: unknown }).id === 'string'
        ? ((payload.response as { id?: string }).id as string)
        : undefined);

  return {
    id,
    choices: textDelta
      ? [
          {
            index: 0,
            delta: {
              role: 'assistant',
              content: [{ type: 'text', text: textDelta } as ChatCompletionContentPart],
            },
          },
        ]
      : [],
  };
};

const sendChatCompletionRequest = async (
  body: unknown,
  signal: AbortSignal | undefined,
  onChunk: ChatClientRequest['onChunk'],
  path = CHAT_COMPLETION_PATH,
  parseMessage?: (data: string) => ChatCompletionStreamResponse
): Promise<ChatCompletionResponse> =>
  apiStreamRequest<ChatCompletionStreamResponse, ChatCompletionResponse>({
    path,
    method: 'POST',
    body,
    signal,
    onMessage: onChunk,
    parseMessage,
    buildResponse: buildChatCompletionResponse,
  });

export const createOpenAIResponsesClient = (): ChatCompletionClient => ({
  send: async ({ model, messages, attachments, signal, onChunk }) => {
    const requestAttachments = attachments
      ? await buildAttachmentRequestPayload(attachments)
      : [];

    const input: ChatCompletionMessage[] = toChatCompletionMessages(messages);

    return sendChatCompletionRequest(
      {
        model,
        stream: true,
        input,
        ...(requestAttachments.length ? { attachments: requestAttachments } : {}),
      },
      signal,
      onChunk,
      RESPONSES_PATH,
      (data) => mapResponseStreamEvent(JSON.parse(data))
    );
  },
});

export const createLmStudioClient = (): ChatCompletionClient => ({
  send: async ({ model, messages, attachments, signal, onChunk }) => {
    const messagesWithContext = await appendAttachmentContext(messages, attachments);

    return sendChatCompletionRequest(
      { model, stream: true, messages: toChatCompletionMessages(messagesWithContext) },
      signal,
      onChunk
    );
  },
});

export const createOllamaClient = (): ChatCompletionClient => ({
  send: async ({ model, messages, attachments, signal, onChunk }) => {
    const messagesWithContext = await appendAttachmentContext(messages, attachments);

    return sendChatCompletionRequest(
      { model, stream: true, messages: toChatCompletionMessages(messagesWithContext) },
      signal,
      onChunk
    );
  },
});
