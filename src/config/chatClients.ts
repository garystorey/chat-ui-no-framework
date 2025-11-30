import { createLmStudioClient, createOllamaClient, createOpenAIResponsesClient } from '../services/chatClients';
import { ChatCompletionClient } from '../services/chatClient';

export const defaultChatClient: ChatCompletionClient = createOpenAIResponsesClient();

// Example clients to inject with <ChatClientProvider client={...} /> when targeting
// different backends.
export const lmStudioChatClientExample: ChatCompletionClient = createLmStudioClient();
export const ollamaChatClientExample: ChatCompletionClient = createOllamaClient();
export const openAIResponsesChatClientExample: ChatCompletionClient = createOpenAIResponsesClient();
