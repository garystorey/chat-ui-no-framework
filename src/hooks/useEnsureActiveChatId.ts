import { Dispatch, SetStateAction, useEffect } from "react";

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
  useEffect(() => {
    if (!activeChatId) {
      return;
    }

    const activeChat = chatHistory.find((chat) => chat.id === activeChatId);

    if (activeChat) {
      return;
    }

    const [nextChat] = chatHistory;
    const nextActiveChatId = nextChat?.id ?? null;

    setActiveChatId(nextActiveChatId);

    if (nextChat) {
      setMessages(cloneMessages(nextChat.messages));
      setChatOpen(true);
    } else {
      setMessages([]);
      setChatOpen(false);
    }
  }, [activeChatId, chatHistory, setActiveChatId, setChatOpen, setMessages]);
};

export default useEnsureActiveChatId;
