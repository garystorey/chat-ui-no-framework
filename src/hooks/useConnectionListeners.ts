import { useEffect, type SetStateAction } from "react";

import useLatestRef from "./useLatestRef";

export type ConnectionStatus = "online" | "offline";

type UseConnectionListenersProps = {
  setIsOnline: (update: SetStateAction<boolean>) => void;
  setConnectionStatus: (update: SetStateAction<ConnectionStatus>) => void;
  cancelPendingResponse: () => void;
};

const useConnectionListeners = ({
  setIsOnline,
  setConnectionStatus,
  cancelPendingResponse,
}: UseConnectionListenersProps) => {
  const cancelPendingResponseRef = useLatestRef(cancelPendingResponse);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionStatus("online");
      cancelPendingResponseRef.current();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus("offline");
      cancelPendingResponseRef.current();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [cancelPendingResponseRef, setConnectionStatus, setIsOnline]);
};

export default useConnectionListeners;
