import { useEffect } from 'react';

const useToggleBodyClass = (className: string, active: boolean) => {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const { body } = document;

    if (active) {
      body.classList.add(className);
    } else {
      body.classList.remove(className);
    }

    return () => {
      body.classList.remove(className);
    };
  }, [className, active]);
};

export default useToggleBodyClass;
