import { useEffect } from 'react';
import type { ChatSummary } from '../types';

const CHAT_HISTORY_STORAGE_KEY = 'chatHistory';

const usePersistChatHistory = (
  chatHistory: ChatSummary[],
  setChatHistory: (history: ChatSummary[] | ((previous: ChatSummary[]) => ChatSummary[])) => void,
) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedChatHistory = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);

    if (!storedChatHistory) {
      return;
    }

    try {
      const parsedChatHistory = JSON.parse(storedChatHistory) as ChatSummary[];
      setChatHistory(parsedChatHistory);
    } catch (error) {
      console.error('Unable to parse stored chat history', error);
    }
  }, [setChatHistory]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chatHistory));
  }, [chatHistory]);
};

export default usePersistChatHistory;
