import { afterEach, describe, expect, it, vi } from 'vitest';

import { API_BASE_URL } from '../../src/config';
import { apiStreamRequest } from '../../src/utils';

describe('apiStreamRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed JSON for non-stream responses', async () => {
    const responseData = { status: 'ok', payload: { id: '123' } };
    const response = new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
    });

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(response);

    const result = await apiStreamRequest<{ message: string }, typeof responseData>({
      path: '/test',
      method: 'POST',
      body: { query: 'hello' },
      headers: { 'x-test': 'true' },
      buildResponse: () => responseData,
    });

    expect(result).toEqual(responseData);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/test`, {
      method: 'POST',
      body: JSON.stringify({ query: 'hello' }),
      headers: expect.objectContaining({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-test': 'true',
      }),
      signal: undefined,
    });
  });
});
