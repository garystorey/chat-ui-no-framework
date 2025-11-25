import { Dispatch, SetStateAction, useEffect, useState } from 'react';

const ACTIVE_CHAT_ID_STORAGE_KEY = 'activeChatId';

const usePersistActiveChatId = (
  activeChatId: string | null,
  setActiveChatId: Dispatch<SetStateAction<string | null>>,
) => {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setHasHydrated(true);
      return;
    }

    const storedActiveChatId = window.localStorage.getItem(ACTIVE_CHAT_ID_STORAGE_KEY);

    if (storedActiveChatId !== null) {
      setActiveChatId(storedActiveChatId);
    }

    setHasHydrated(true);
  }, [setActiveChatId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !hasHydrated) {
      return;
    }

    if (activeChatId) {
      window.localStorage.setItem(ACTIVE_CHAT_ID_STORAGE_KEY, activeChatId);
      return;
    }

    window.localStorage.removeItem(ACTIVE_CHAT_ID_STORAGE_KEY);
  }, [activeChatId, hasHydrated]);
};

export default usePersistActiveChatId;
