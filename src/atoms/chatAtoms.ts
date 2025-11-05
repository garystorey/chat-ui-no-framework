import { atom } from 'jotai';

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

export const messagesAtom = atom<Message[]>([]);
export const typingAtom = atom<boolean>(false);
export const themeAtom = atom<'light' | 'dark'>('dark');
