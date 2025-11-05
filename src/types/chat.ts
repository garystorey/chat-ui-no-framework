import type { Message } from '../atoms/chatAtoms';

export type ChatSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAt: number;
  messages: Message[];
};
