import type { SVGProps } from 'react';

const AttachmentIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    focusable="false"
    {...props}
  >
    <path
      d="M12.75 5.25v6.375a3.75 3.75 0 0 1-7.5 0V4.875a2.625 2.625 0 0 1 5.25 0v6.188a1.5 1.5 0 0 1-3 0V6.375a.75.75 0 0 1 1.5 0v4.312a.75.75 0 1 0 1.5 0V4.875a3.75 3.75 0 1 0-7.5 0v6.75a5.25 5.25 0 1 0 10.5 0V5.25a.75.75 0 0 0-1.5 0Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

export default AttachmentIcon;
