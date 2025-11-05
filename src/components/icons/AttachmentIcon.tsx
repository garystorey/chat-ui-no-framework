import type { SVGProps } from 'react';

const AttachmentIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    focusable="false"
    {...props}
  >
    <path
      d="m13.75 6.25-6.97 6.97a2 2 0 1 1-2.83-2.83l6.87-6.87a3 3 0 1 1 4.24 4.24L8.45 14.21a1.25 1.25 0 0 1-1.77-1.77l5.6-5.6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default AttachmentIcon;
