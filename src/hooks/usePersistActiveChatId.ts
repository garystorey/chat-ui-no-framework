import { useEffect } from 'react';

const ACTIVE_CHAT_ID_STORAGE_KEY = 'activeChatId';

const usePersistActiveChatId = (
  activeChatId: string | null,
  setActiveChatId: (chatId: string | null) => void,
) => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedActiveChatId = window.localStorage.getItem(ACTIVE_CHAT_ID_STORAGE_KEY);

    if (storedActiveChatId) {
      setActiveChatId(storedActiveChatId);
    }
  }, [setActiveChatId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (activeChatId) {
      window.localStorage.setItem(ACTIVE_CHAT_ID_STORAGE_KEY, activeChatId);
      return;
    }

    window.localStorage.removeItem(ACTIVE_CHAT_ID_STORAGE_KEY);
  }, [activeChatId]);
};

export default usePersistActiveChatId;
