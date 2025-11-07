type ChatListProps = {
  chats: {
    id: string;
    title: string;
    preview: string;
  }[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onRemoveChat: (chatId: string) => void;
};

function ChatList({
  chats,
  activeChatId,
  onSelectChat,
  onRemoveChat,
}: ChatListProps) {
  return (
    <nav className="sidebar__chats" aria-label="Previous chats">
      <h2 className="sidebar__section-title">Chats</h2>
      <ul className="sidebar__chat-list">
        {chats.map((chat) => (
          <li key={chat.id} className="sidebar__chat-item">
            <button
              type="button"
              className={`sidebar__chat ${
                chat.id === activeChatId ? "sidebar__chat--active" : ""
              }`}
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
              title={`Remove ${chat.title}`}
            >
              ×
            </button>
          </li>
        ))}
        {chats.length === 0 && (
          <li className="sidebar__empty">No chats found</li>
        )}
      </ul>
    </nav>
  );
}
export default ChatList;
