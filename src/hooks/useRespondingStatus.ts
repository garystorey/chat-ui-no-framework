import { useEffect, type SetStateAction } from 'react';
import type { MutationStatus } from '@tanstack/react-query';

const useRespondingStatus = (
  status: MutationStatus,
  setResponding: (update: SetStateAction<boolean>) => void
) => {
  useEffect(() => {
    setResponding(status === 'pending');
  }, [setResponding, status]);
};

export default useRespondingStatus;
