import { useEffect, type SetStateAction } from "react";

import { API_BASE_URL } from "../config";
import useLatestRef from "./useLatestRef";

export type ConnectionStatus = "online" | "offline";

type UseConnectionListenersProps = {
  setConnectionStatus: (update: SetStateAction<ConnectionStatus>) => void;
  cancelPendingResponse: () => void;
};

const checkApiAvailability = async (signal?: AbortSignal) => {
  try {
    const response = await fetch(API_BASE_URL, { method: "HEAD", signal });
    if (response.ok) {
      return true;
    }

    if (response.status >= 400 && response.status < 600) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("API availability check failed", error);
    return false;
  }
};

const useConnectionListeners = ({
  setConnectionStatus,
  cancelPendingResponse,
}: UseConnectionListenersProps) => {
  const cancelPendingResponseRef = useLatestRef(cancelPendingResponse);

  useEffect(() => {
    const abortController = new AbortController();

    const updateStatus = async () => {
      const isApiAvailable = await checkApiAvailability(abortController.signal);
      setConnectionStatus(isApiAvailable ? "online" : "offline");
      if (isApiAvailable) {
        cancelPendingResponseRef.current();
      }
    };

    updateStatus();

    const handleOnline = () => {
      updateStatus();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateStatus();
      }
    };

    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      abortController.abort();
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [cancelPendingResponseRef, setConnectionStatus]);
};

export default useConnectionListeners;
