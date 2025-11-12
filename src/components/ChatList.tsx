import { PreviewChat } from "../types";
import ChatListItem from "./ChatListItem";
import List from "./List";
import Show from "./Show";

type ChatListProps = {
  chats: PreviewChat[];
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
      <List<PreviewChat>
        className="sidebar__chat-list"
        items={chats}
        keyfield="id"
        as={(chat) => (
          <ChatListItem chat={chat} activeChatId={activeChatId} onSelectChat={onSelectChat} onRemoveChat={onRemoveChat} />
        )} />
        <Show when={chats.length === 0}>
          <div className="sidebar__empty">No chats found</div>
        </Show> 
    </nav>
  );
}
export default ChatList;
