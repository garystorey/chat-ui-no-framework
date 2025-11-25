import { Dispatch, SetStateAction, useEffect, useRef } from "react";

import type { ChatSummary, Message } from "../types";
import { cloneMessages } from "../utils";

type UseEnsureActiveChatIdParams = {
  activeChatId: string | null;
  chatHistory: ChatSummary[];
  setActiveChatId: Dispatch<SetStateAction<string | null>>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setChatOpen: Dispatch<SetStateAction<boolean>>;
};

const useEnsureActiveChatId = ({
  activeChatId,
  chatHistory,
  setActiveChatId,
  setMessages,
  setChatOpen,
}: UseEnsureActiveChatIdParams) => {
  const previousActiveChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    const clearedActiveChat =
      previousActiveChatIdRef.current !== null && activeChatId === null;

    previousActiveChatIdRef.current = activeChatId;

    if (clearedActiveChat) {
      return;
    }

    const activeChat = chatHistory.find((chat) => chat.id === activeChatId);
    const [nextChat] = chatHistory;
    const nextActiveChatId = activeChat ? activeChatId : nextChat?.id ?? null;

    if (nextActiveChatId === activeChatId && activeChat) {
      return;
    }

    setActiveChatId(nextActiveChatId);

    if (nextChat && nextActiveChatId) {
      setMessages(cloneMessages(nextChat.messages));
      setChatOpen(true);
      return;
    }

    setMessages([]);
    setChatOpen(false);
  }, [activeChatId, chatHistory, setActiveChatId, setChatOpen, setMessages]);
};

export default useEnsureActiveChatId;
