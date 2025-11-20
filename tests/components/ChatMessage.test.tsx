import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { Attachment, Message } from '../../src/types';
import ChatMessage from '../../src/components/ChatMessage';

afterEach(() => {
  cleanup();
});

const baseMessage: Message = {
  id: 'msg-1',
  sender: 'user',
  content: 'Hello world',
  attachments: [],
};

describe('ChatMessage', () => {
  it('renders markdown content when renderAsHtml is not set', () => {
    const markdownMessage: Message = {
      ...baseMessage,
      id: 'msg-markdown',
      content: '# Markdown heading',
    };

    render(<ChatMessage message={markdownMessage} />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Markdown heading',
      })
    ).toBeInTheDocument();
  });

  it('uses the provided html content when renderAsHtml is true', () => {
    const htmlMessage: Message = {
      ...baseMessage,
      id: 'msg-html',
      renderAsHtml: true,
      content: '<strong data-testid="trusted">Trusted content</strong>',
    };

    render(<ChatMessage message={htmlMessage} />);

    expect(screen.getByTestId('trusted')).toHaveTextContent('Trusted content');
  });

  it('renders attachments that require normalization', () => {
    const rawAttachments = {
      first: { name: 'Plan.txt', size: 1024, type: 'text/plain' },
    } satisfies Record<string, Partial<Attachment>>;

    render(
      <ChatMessage
        message={{
          ...baseMessage,
          id: 'msg-with-attachments',
          attachments: rawAttachments as unknown as Attachment[],
        }}
      />
    );

    expect(
      screen.getByRole('list', { name: 'Message attachments' })
    ).toBeInTheDocument();
    expect(screen.getByText('Plan.txt')).toBeInTheDocument();
  });
});
