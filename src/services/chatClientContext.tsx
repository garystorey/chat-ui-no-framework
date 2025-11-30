import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { ChatCompletionClient } from './chatClient';
import { defaultChatClient } from '../config/chatClients';

const ChatClientContext = createContext<ChatCompletionClient>(defaultChatClient);

export const ChatClientProvider = ({
  client,
  children,
}: PropsWithChildren<{ client?: ChatCompletionClient }>) => {
  const value = useMemo(() => client ?? defaultChatClient, [client]);
  return <ChatClientContext.Provider value={value}>{children}</ChatClientContext.Provider>;
};

export const useChatClient = () => useContext(ChatClientContext);
