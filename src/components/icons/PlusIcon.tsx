import type { SVGProps } from 'react';

const PlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    focusable="false"
    {...props}
  >
    <path
      d="M8 3v10M3 8h10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default PlusIcon;
