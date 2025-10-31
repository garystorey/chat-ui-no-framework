import { atom } from 'jotai';

export type Message = {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  renderAsHtml?: boolean;
};

export const messagesAtom = atom<Message[]>([]);
export const typingAtom = atom<boolean>(false);
export const themeAtom = atom<'light' | 'dark'>('dark');
