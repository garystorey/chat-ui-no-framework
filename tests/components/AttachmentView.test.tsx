import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import AttachmentView from '../../src/components/AttachmentView';
import type { Attachment } from '../../src/types';

vi.mock('../../src/utils', () => ({
  getAttachmentDisplayType: vi.fn(),
  formatFileSize: vi.fn(),
}));

import { getAttachmentDisplayType, formatFileSize } from '../../src/utils';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('AttachmentView', () => {
  const attachment: Attachment = {
    id: 'file-1',
    name: 'Report.pdf',
    size: 1024,
    type: 'application/pdf',
  };

  it('shows the attachment name and combined metadata when a type label is available', () => {
    vi.mocked(getAttachmentDisplayType).mockReturnValue('PDF');
    vi.mocked(formatFileSize).mockReturnValue('1 KB');

    render(<AttachmentView attachment={attachment} />);

    expect(screen.getByTitle('Report.pdf')).toHaveTextContent('Report.pdf');
    expect(screen.getByText('PDF • 1 KB')).toBeInTheDocument();
    expect(getAttachmentDisplayType).toHaveBeenCalledWith(attachment);
    expect(formatFileSize).toHaveBeenCalledWith(attachment.size);
  });

  it('falls back to the size label when no type is returned', () => {
    vi.mocked(getAttachmentDisplayType).mockReturnValue('');
    vi.mocked(formatFileSize).mockReturnValue('200 KB');

    render(<AttachmentView attachment={attachment} />);

    expect(screen.getByText('200 KB')).toBeInTheDocument();
  });
});
