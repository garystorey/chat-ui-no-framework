import { useEffect, useMemo, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import './Sidebar.css';

export type ChatSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
};

type SidebarProps = {
  collapsed: boolean;
  chats: ChatSummary[];
  activeChatId: string;
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (collapsed) {
      setSearchTerm('');
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
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`} aria-label="Chat navigation">
      <div className="sidebar__inner">
        <div className="sidebar__header">
          <button
            type="button"
            className="sidebar__toggle"
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span aria-hidden>{collapsed ? '›' : '‹'}</span>
          </button>
          <ThemeToggle />
        </div>
        <div className="sidebar__actions">
          <button type="button" className="sidebar__action" onClick={onNewChat}>
            <span className="sidebar__action-icon" aria-hidden>
              ＋
            </span>
            <span className="sidebar__action-label">New Chat</span>
          </button>
          {!collapsed && (
            <label className="sidebar__search">
              <span className="sidebar__search-icon" aria-hidden>
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
          )}
        </div>
        <nav className="sidebar__chats" aria-label="Previous chats">
          <h2 className="sidebar__section-title">Chats</h2>
          <ul className="sidebar__chat-list">
            {filteredChats.map((chat) => (
              <li key={chat.id} className="sidebar__chat-item">
                <button
                  type="button"
                  className={`sidebar__chat ${chat.id === activeChatId ? 'sidebar__chat--active' : ''}`}
                  onClick={() => onSelectChat(chat.id)}
                  title={chat.title}
                >
                  <span className="sidebar__chat-title">{chat.title}</span>
                  <span className="sidebar__chat-preview">{chat.preview}</span>
                </button>
                <button
                  type="button"
                  className="sidebar__chat-remove"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemoveChat(chat.id);
                  }}
                  aria-label={`Remove ${chat.title}`}
                >
                  ×
                </button>
              </li>
            ))}
            {filteredChats.length === 0 && !collapsed && (
              <li className="sidebar__empty">No chats found</li>
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
