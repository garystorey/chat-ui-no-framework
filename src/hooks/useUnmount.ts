import { useEffect } from 'react';
import useLatestRef from './useLatestRef';

const useUnmount = (callback: () => void) => {
  const callbackRef = useLatestRef(callback);

  useEffect(() => {
    return () => {
      callbackRef.current();
    };
  }, [callbackRef]);
};

export default useUnmount;
