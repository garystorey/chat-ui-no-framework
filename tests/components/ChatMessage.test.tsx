import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { Attachment, Message } from '../../src/types';

vi.mock('../../src/utils', () => ({
  normalizeMessageAttachments: vi.fn(),
  renderMarkdown: vi.fn(),
}));

import { normalizeMessageAttachments, renderMarkdown } from '../../src/utils';
import ChatMessage from '../../src/components/ChatMessage';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const baseMessage: Message = {
  id: 'msg-1',
  sender: 'user',
  content: 'Hello world',
  attachments: [],
};

describe('ChatMessage', () => {
  beforeEach(() => {
    vi.mocked(renderMarkdown).mockReturnValue('<p>Converted content</p>');
    vi.mocked(normalizeMessageAttachments).mockReturnValue([]);
  });

  it('converts markdown content when renderAsHtml is not set', () => {
    render(<ChatMessage message={baseMessage} />);

    expect(renderMarkdown).toHaveBeenCalledWith(baseMessage.content);
    expect(screen.getByText('Converted content')).toBeInTheDocument();
  });

  it('uses the provided html content when renderAsHtml is true', () => {
    const htmlMessage: Message = {
      ...baseMessage,
      id: 'msg-2',
      renderAsHtml: true,
      content: '<strong>Trusted content</strong>',
    };

    render(<ChatMessage message={htmlMessage} />);

    expect(renderMarkdown).not.toHaveBeenCalled();
    expect(screen.getByText('Trusted content')).toBeInTheDocument();
  });

  it('renders attachments when they are returned by the normalizer', () => {
    const normalizedAttachments: Attachment[] = [
      { id: 'att-1', name: 'Plan.txt', size: 1, type: 'text/plain' },
    ];

    vi.mocked(normalizeMessageAttachments).mockReturnValue(normalizedAttachments);

    render(
      <ChatMessage
        message={{ ...baseMessage, attachments: normalizedAttachments }}
      />
    );

    expect(normalizeMessageAttachments).toHaveBeenCalledWith(
      normalizedAttachments,
      baseMessage.id
    );
    expect(
      screen.getByRole('list', { name: 'Message attachments' })
    ).toBeInTheDocument();
    expect(screen.getByText('Plan.txt')).toBeInTheDocument();
  });
});
