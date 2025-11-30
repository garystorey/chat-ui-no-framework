
const envApiBaseUrl =
  import.meta.env?.VITE_APP_API_BASE_URL ?? import.meta.env?.VITE_API_BASE_URL;

const normalizeBaseUrl = (value: string | undefined) =>
  (value ?? '').replace(/\/+$/, '');

export const DEFAULT_API_BASE_URL = '';

const defaultBaseUrl = () => {
  const configuredBaseUrl = normalizeBaseUrl(DEFAULT_API_BASE_URL || undefined);
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return '';
};

export const API_BASE_URL = normalizeBaseUrl(envApiBaseUrl) || defaultBaseUrl();
export const CHAT_COMPLETION_PATH = '/v1/chat/completions';
export const RESPONSES_PATH = '/v1/responses';
export const MODELS_PATH = '/v1/models';
export const DEFAULT_CHAT_MODEL = 'gpt-4o-mini';
export const ASSISTANT_ERROR_MESSAGE =
  "Sorry, I had trouble reaching the assistant. Please try again.";
export const OPENAI_API_KEY = '';
export const OPENAI_BETA_FEATURES = 'assistants=v2';

export default {
  API_BASE_URL,
  CHAT_COMPLETION_PATH,
  MODELS_PATH,
  DEFAULT_CHAT_MODEL,
  ASSISTANT_ERROR_MESSAGE,
  OPENAI_API_KEY,
  OPENAI_BETA_FEATURES,
  DEFAULT_API_BASE_URL,
};
