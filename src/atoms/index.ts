import { atom } from 'jotai';
import { Message } from '../types';

export const messagesAtom = atom<Message[]>([]);
export const respondingAtom = atom<boolean>(false);
export const themeAtom = atom<'light' | 'dark'>('dark');
