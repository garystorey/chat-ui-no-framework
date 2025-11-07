import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import type { ChatSummary } from "../types";
import "./Sidebar.css";
import Show from "./Show";
import ChatList from "./ChatList";

type SidebarProps = {
  collapsed: boolean;
  chats: ChatSummary[];
  activeChatId: string | null;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onRemoveChat: (chatId: string) => void;
};

const Sidebar = ({
  collapsed,
  chats,
  activeChatId,
  onToggle,
  onNewChat,
  onSelectChat,
  onRemoveChat,
}: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (collapsed) {
      setSearchTerm("");
    }
  }, [collapsed]);

  const filteredChats = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return chats;
    }
    return chats.filter((chat) => {
      const titleMatch = chat.title.toLowerCase().includes(term);
      const previewMatch = chat.preview.toLowerCase().includes(term);
      return titleMatch || previewMatch;
    });
  }, [chats, searchTerm]);

  return (
    <aside
      className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}
      aria-label="Chat navigation"
    >
      <div className="sidebar__inner">
        <div className="sidebar__header">

          <ThemeToggle />
          
          <button
            type="button"
            className="sidebar__toggle"
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span aria-hidden="true">{collapsed ? "<" : ">"}</span>
          </button>
        </div>
        <div className="sidebar__actions">
          <button type="button" className="sidebar__action" onClick={onNewChat}>
            <span className="sidebar__action-icon" aria-hidden="true">
              +
            </span>
            <span className="sidebar__action-label">New Chat</span>
          </button>

          <Show when={!collapsed}>
            <label className="sidebar__search">
              <span className="sidebar__search-icon" aria-hidden="true">
                🔍
              </span>
              <span className="sr-only">Search chats</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search chats"
              />
            </label>
          </Show>

        </div>
        <Show when={!collapsed}>
          <ChatList
            chats={filteredChats}
            activeChatId={activeChatId}
            onSelectChat={onSelectChat}
            onRemoveChat={onRemoveChat}
          />
        </Show>
      </div>
    </aside>
  );
};

export default Sidebar;
