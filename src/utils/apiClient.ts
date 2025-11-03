export const API_BASE_URL = 'http://localhost:1234';

export type ApiRequestOptions = {
  path: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

const isJsonLike = (value: unknown): value is Record<string, unknown> | unknown[] => {
  if (!value) {
    return false;
  }

  if (value instanceof FormData || value instanceof URLSearchParams || value instanceof Blob) {
    return false;
  }

  if (typeof value === 'string') {
    return false;
  }

  return typeof value === 'object';
};

const parseJson = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Failed to parse server response as JSON');
  }
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiRequest<TResponse>({
  path,
  method = 'GET',
  body,
  headers,
  signal,
}: ApiRequestOptions): Promise<TResponse> {
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  let requestBody: BodyInit | undefined;

  if (body instanceof FormData || body instanceof Blob || typeof body === 'string') {
    requestBody = body as BodyInit;
  } else if (body !== undefined) {
    requestBody = JSON.stringify(body);
    if (!requestHeaders['Content-Type']) {
      requestHeaders['Content-Type'] = 'application/json';
    }
  }

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    body: requestBody,
    headers: requestHeaders,
    signal,
  });

  if (!response.ok) {
    const errorData = await parseJson(response).catch(() => null);
    const message =
      (errorData && isJsonLike(errorData) && 'message' in errorData && typeof errorData.message === 'string'
        ? errorData.message
        : response.statusText) || 'Request failed';

    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const data = await parseJson(response);
  return data as TResponse;
}
