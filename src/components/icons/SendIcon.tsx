import type { SVGProps } from 'react';

const SendIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M3.215 2.293a.75.75 0 0 1 .804-.178l13 5a.75.75 0 0 1 0 1.39l-13 5A.75.75 0 0 1 3 13.75v-4.3a.75.75 0 0 1 .75-.75H10a.75.75 0 0 1 0 1.5H4.5v2.275L15.56 9l-11.06-4.475V6.5A.75.75 0 0 1 3 7.25H2.25a.75.75 0 0 1-.75-.75V3.25a.75.75 0 0 1 .715-.957Z"
      fill="currentColor"
    />
  </svg>
);

export default SendIcon;
