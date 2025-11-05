import { getId } from './id';
import type { MessageAttachment } from '../atoms/chat';

export type AttachmentRequest = MessageAttachment & { data: string };

const BASE64_CHUNK_SIZE = 0x8000;

export const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < bytes.length; index += BASE64_CHUNK_SIZE) {
    const chunk = bytes.subarray(index, index + BASE64_CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }

  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(binary);
  }

  throw new Error('Base64 encoding is not supported in this environment.');
};

export const encodeFileToBase64 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  return arrayBufferToBase64(buffer);
};

export const buildMessageAttachments = (files: File[]): MessageAttachment[] =>
  files.map((file) => ({
    id: getId(),
    name: file.name,
    size: file.size,
    type: file.type,
  }));

export const normalizeMessageAttachments = (
  attachments: unknown,
  fallbackPrefix = 'attachment'
): MessageAttachment[] => {
  if (!attachments) {
    return [];
  }

  const list: Partial<MessageAttachment>[] = Array.isArray(attachments)
    ? (attachments as Partial<MessageAttachment>[])
    : typeof attachments === 'object'
      ? Object.values(
          attachments as Record<string, Partial<MessageAttachment>>
        )
      : [];

  return list.map((item, index) => {
    const numericSize = Number(item.size);
    const safeSize = Number.isFinite(numericSize) && numericSize >= 0 ? numericSize : 0;

    return {
      id: (item.id as string) ?? `${fallbackPrefix}-${index}`,
      name: item.name ?? `Attachment ${index + 1}`,
      size: safeSize,
      type: item.type ?? '',
    };
  });
};

export const buildAttachmentRequestPayload = async (
  files: File[],
  metadata: MessageAttachment[]
): Promise<AttachmentRequest[]> => {
  if (!files.length) {
    return [];
  }

  return Promise.all(
    files.map(async (file, index) => ({
      ...metadata[index],
      data: await encodeFileToBase64(file),
    }))
  );
};

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

export const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return '0 B';
  }

  if (bytes === 0) {
    return '0 B';
  }

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    FILE_SIZE_UNITS.length - 1
  );
  const value = bytes / 1024 ** exponent;
  return `${value >= 100 ? Math.round(value) : value.toFixed(value >= 10 ? 1 : 2)} ${FILE_SIZE_UNITS[exponent]}`;
};

export const getAttachmentDisplayType = ({
  name,
  type,
}: Pick<MessageAttachment, 'name' | 'type'>) => {
  const extension = name?.split('.').pop();
  if (extension && extension.length <= 5) {
    return extension.toUpperCase();
  }

  if (type) {
    const subtype = type.split('/')[1];
    if (subtype) {
      return subtype.toUpperCase();
    }
    return type.toUpperCase();
  }

  return '';
};
