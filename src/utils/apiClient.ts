export const API_BASE_URL = 'http://192.168.86.24:1234';

export type ApiRequestOptions = {
  path: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export type ApiStreamRequestOptions<TMessage, TResponse> = {
  path: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  onMessage?: (message: TMessage) => void;
  parseMessage?: (data: string) => TMessage;
  buildResponse: (messages: TMessage[]) => TResponse;
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

const buildRequest = ({
  path,
  method = 'GET',
  body,
  headers,
  signal,
}: ApiRequestOptions) => {
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

  return {
    url,
    requestHeaders,
    requestBody,
    method,
    signal,
  };
};

export async function apiRequest<TResponse>({
  path,
  method = 'GET',
  body,
  headers,
  signal,
}: ApiRequestOptions): Promise<TResponse> {
  const { url, requestHeaders, requestBody } = buildRequest({
    path,
    method,
    body,
    headers,
    signal,
  });

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

const parseSseEvents = <TMessage>(
  chunk: string,
  flush: boolean,
  handleEvent: (data: string) => boolean
) => {
  const normalized = chunk.replace(/\r\n/g, '\n');
  const segments = normalized.split('\n\n');
  const remainder = flush ? '' : segments.pop() ?? '';

  for (const segment of segments) {
    const lines = segment.split('\n');
    const dataLines: string[] = [];
    for (const line of lines) {
      if (!line || line.startsWith(':')) {
        continue;
      }
      if (line.startsWith('data:')) {
        dataLines.push(line.replace(/^data:\s*/, ''));
      }
    }

    if (!dataLines.length) {
      continue;
    }

    const data = dataLines.join('\n');
    const shouldStop = handleEvent(data);
    if (shouldStop) {
      return { remainder: '', shouldStop: true };
    }
  }

  return { remainder, shouldStop: false };
};

export async function apiStreamRequest<TMessage, TResponse>({
  path,
  method = 'GET',
  body,
  headers,
  signal,
  onMessage,
  parseMessage,
  buildResponse,
}: ApiStreamRequestOptions<TMessage, TResponse>): Promise<TResponse> {
  const { url, requestHeaders, requestBody } = buildRequest({
    path,
    method,
    body,
    headers: {
      Accept: 'text/event-stream',
      ...headers,
    },
    signal,
  });

  const response = await fetch(url, {
    method,
    body: requestBody,
    headers: requestHeaders,
    signal,
  });

  if (!response.ok) {
    const errorData = await parseJson(response).catch(() => null);
    const message =
      (errorData &&
      isJsonLike(errorData) &&
      'message' in errorData &&
      typeof (errorData as Record<string, unknown>).message === 'string'
        ? (errorData as Record<string, string>).message
        : response.statusText) || 'Request failed';

    throw new ApiError(message, response.status, errorData);
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!response.body || !contentType.includes('text/event-stream')) {
    const data = await parseJson(response);
    return data as TResponse;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  const messages: TMessage[] = [];
  let buffer = '';
  let shouldStop = false;
  const parse = parseMessage ?? ((data: string) => JSON.parse(data) as TMessage);

  while (!shouldStop) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });

    const result = parseSseEvents<TMessage>(buffer, done, (data) => {
      if (data === '[DONE]') {
        shouldStop = true;
        return true;
      }
      try {
        const message = parse(data);
        messages.push(message);
        onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse stream message', error);
      }
      return false;
    });

    buffer = result.remainder;
    shouldStop = shouldStop || result.shouldStop || done;
  }

  return buildResponse(messages);
}
