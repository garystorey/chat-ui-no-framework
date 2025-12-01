import { useEffect, type Dispatch, type SetStateAction } from "react";
import { DEFAULT_CHAT_MODEL } from "../config";
import { buildRequest, isJsonLike, parseJson } from "../utils";
import type { ConnectionStatus } from "./useConnectionListeners";

const useAvailableModels = ({
  connectionStatus,
  setAvailableModels,
  setSelectedModel,
  setIsLoadingModels,
}: {
  connectionStatus: ConnectionStatus;
  setAvailableModels: Dispatch<SetStateAction<string[]>>;
  setSelectedModel: Dispatch<SetStateAction<string>>;
  setIsLoadingModels: Dispatch<SetStateAction<boolean>>;
}) => {
  useEffect(() => {
    if (connectionStatus !== "online") {
      return undefined;
    }

    const abortController = new AbortController();
    let cancelled = false;

    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const { url, requestHeaders } = buildRequest({ path: "/v1/models" });
        const response = await fetch(url, {
          method: "GET",
          headers: requestHeaders,
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Unable to load models (${response.status})`);
        }

        const data = await parseJson(response);

        if (cancelled || !isJsonLike(data)) {
          return;
        }

        const modelsData = Array.isArray((data as { data?: unknown }).data)
          ? (data as { data: Array<unknown> }).data
          : [];

        const models = modelsData
          .map((model) =>
            isJsonLike(model) ? (model as { id?: unknown }).id : undefined
          )
          .filter((id): id is string => typeof id === "string");

        if (!models.length) {
          return;
        }

        const uniqueModels = Array.from(new Set(models));

        const loadedModelId = modelsData
          .filter(
            (model): model is {
              id: string;
              loaded?: unknown;
              isDefault?: unknown;
              is_default?: unknown;
            } => isJsonLike(model) && typeof (model as { id?: unknown }).id === "string"
          )
          .find(
            ({ loaded, isDefault, is_default }) =>
              loaded === true || isDefault === true || is_default === true
          )?.id;

        const defaultModelId =
          isJsonLike(data) && typeof (data as { default?: unknown }).default === "string"
            ? (data as { default: string }).default
            : undefined;

        const preferredServerModel = [loadedModelId, defaultModelId].find(
          (modelId): modelId is string =>
            typeof modelId === "string" && uniqueModels.includes(modelId)
        );

        setAvailableModels(uniqueModels);
        setSelectedModel((current) => {
          if (
            preferredServerModel &&
            (current === DEFAULT_CHAT_MODEL || !uniqueModels.includes(current))
          ) {
            return preferredServerModel;
          }

          if (uniqueModels.includes(current)) {
            return current;
          }

          if (uniqueModels.includes(DEFAULT_CHAT_MODEL)) {
            return DEFAULT_CHAT_MODEL;
          }

          return uniqueModels[0];
        });
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Failed to fetch models", error);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingModels(false);
        }
      }
    };

    void fetchModels();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [connectionStatus, setAvailableModels, setIsLoadingModels, setSelectedModel]);
};

export default useAvailableModels;
