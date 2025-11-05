import type { SVGProps } from 'react';

const SparkIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M9 2.25 9.75 6a1 1 0 0 0 .75.75L14 7.5l-3.5 1a1 1 0 0 0-.7.7l-1.05 3.5-1-3.5a1 1 0 0 0-.7-.7L3.5 7.5l3.5-.75a1 1 0 0 0 .75-.75L9 2.25ZM4.25 12.75l.375 1.5a.75.75 0 0 0 .525.525l1.5.375-1.5.375a.75.75 0 0 0-.525.525l-.375 1.5-.375-1.5a.75.75 0 0 0-.525-.525l-1.5-.375 1.5-.375a.75.75 0 0 0 .525-.525l.375-1.5Zm9-2.25.45 1.8a.9.9 0 0 0 .63.63l1.8.45-1.8.45a.9.9 0 0 0-.63.63l-.45 1.8-.45-1.8a.9.9 0 0 0-.63-.63l-1.8-.45 1.8-.45a.9.9 0 0 0 .63-.63l.45-1.8Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);

export default SparkIcon;
