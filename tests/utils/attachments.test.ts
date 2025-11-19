import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as idModule from '../../src/utils/id';
import {
  arrayBufferToBase64,
  encodeFileToBase64,
  buildAttachmentsFromFiles,
  normalizeMessageAttachments,
  buildAttachmentRequestPayload,
  formatFileSize,
  getAttachmentDisplayType,
} from '../../src/utils/attachments';
import type { Attachment } from '../../src/types';

vi.mock('../../src/utils/id', () => ({
  getId: vi.fn(() => 'mock-id'),
}));

const mockedGetId = vi.mocked(idModule.getId);

describe('attachments utilities', () => {
  beforeEach(() => {
    mockedGetId.mockClear();
  });

  describe('arrayBufferToBase64', () => {
    it('converts an ArrayBuffer into a base64 string when btoa is available', () => {
      const buffer = new TextEncoder().encode('Test value').buffer;
      expect(arrayBufferToBase64(buffer)).toBe(globalThis.btoa('Test value'));
    });

    it('throws a descriptive error when btoa is not provided by the environment', () => {
      const originalBtoa = globalThis.btoa;
      (globalThis as { btoa?: typeof btoa }).btoa = undefined;

      const buffer = new ArrayBuffer(0);
      expect(() => arrayBufferToBase64(buffer)).toThrow('Base64 encoding is not supported');

      globalThis.btoa = originalBtoa;
    });
  });

  it('encodes a File to base64', async () => {
    const file = new File([new TextEncoder().encode('plain text')], 'plain.txt', {
      type: 'text/plain',
    });
    const encoded = await encodeFileToBase64(file);
    expect(encoded).toBe(globalThis.btoa('plain text'));
  });

  it('builds attachments from files and generates ids', () => {
    mockedGetId.mockReturnValueOnce('file-a').mockReturnValueOnce('file-b');
    const files = [
      new File(['first'], 'first.txt', { type: 'text/plain' }),
      new File(['second'], 'second.json', { type: 'application/json' }),
    ];

    const attachments = buildAttachmentsFromFiles(files);

    expect(attachments).toEqual([
      {
        id: 'file-a',
        name: 'first.txt',
        size: files[0].size,
        type: 'text/plain',
        file: files[0],
      },
      {
        id: 'file-b',
        name: 'second.json',
        size: files[1].size,
        type: 'application/json',
        file: files[1],
      },
    ]);
  });

  it('normalizes message attachments from multiple shapes', () => {
    const arrayResult = normalizeMessageAttachments([
      { id: 'one', name: 'One.txt', size: 10, type: 'text/plain' },
      { size: '8' },
    ]);

    const objectResult = normalizeMessageAttachments({
      alpha: { name: 'Alpha', size: -2, type: 'application/pdf' },
    });

    const fallbackResult = normalizeMessageAttachments(undefined);

    expect(arrayResult).toEqual([
      { id: 'one', name: 'One.txt', size: 10, type: 'text/plain' },
      { id: 'attachment-1', name: 'Attachment 2', size: 8, type: '' },
    ]);
    expect(objectResult).toEqual([{ id: 'attachment-0', name: 'Alpha', size: 0, type: 'application/pdf' }]);
    expect(fallbackResult).toEqual([]);
  });

  it('builds attachment request payloads only from entries that contain a File', async () => {
    mockedGetId.mockReturnValue('generated');
    const file = new File(['payload'], 'payload.json', { type: 'application/json' });

    const attachments: Attachment[] = [
      { id: 'keep', name: 'keep.json', size: file.size, type: 'application/json', file },
      { id: 'skip', name: 'skip.bin', size: 10, type: 'application/octet-stream' },
    ];

    const payload = await buildAttachmentRequestPayload(attachments);

    expect(payload).toEqual([
      {
        id: 'keep',
        filename: 'keep.json',
        mime_type: 'application/json',
        data: globalThis.btoa('payload'),
      },
    ]);
  });

  it('returns an empty attachment request payload when no files are present', async () => {
    const payload = await buildAttachmentRequestPayload([
      { id: 'one', name: 'Readme', size: 0, type: '' },
    ]);

    expect(payload).toEqual([]);
  });

  it('formats file sizes for various units and guards invalid values', () => {
    expect(formatFileSize(-10)).toBe('0 B');
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(100)).toBe('100 B');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1024 ** 2)).toBe('1.0 MB');
  });

  it('returns the best possible attachment display type', () => {
    expect(getAttachmentDisplayType({ name: 'doc.pdf', type: '' })).toBe('PDF');
    expect(getAttachmentDisplayType({ name: 'archive', type: 'application/zip' })).toBe('ZIP');
    expect(getAttachmentDisplayType({ name: 'unknown', type: '' })).toBe('');
  });
});
