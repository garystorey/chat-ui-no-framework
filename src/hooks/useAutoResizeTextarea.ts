import { RefObject, useEffect } from 'react';

const useAutoResizeTextarea = (
  ref: RefObject<HTMLTextAreaElement|null>,
  value: string
) => {
  useEffect(() => {
    const textarea = ref.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [ref, value]);
};

export default useAutoResizeTextarea;
