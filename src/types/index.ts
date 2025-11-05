
export type MessageAttachment = {
  id: string;
  name: string;
  size: number;
  type: string;
};

export type Message = {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  renderAsHtml?: boolean;
  attachments?: MessageAttachment[];
};

export type ChatSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
  messages: Message[];
};
