import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { ApiError, apiRequest, ApiRequestOptions } from '../utils';

export type ApiMutationVariables = Omit<ApiRequestOptions, 'path' | 'method'> & {
  path?: string;
};

export type UseApiMutationConfig<TResponse> = {
  path: string;
  method?: string;
  options?: Omit<
    UseMutationOptions<TResponse, ApiError, ApiMutationVariables, unknown>,
    'mutationFn'
  >;
};

export function useApiMutation<TResponse>({
  path,
  method = 'POST',
  options,
}: UseApiMutationConfig<TResponse>) {
  return useMutation<TResponse, ApiError, ApiMutationVariables>({
    mutationFn: async (variables: ApiMutationVariables = {}) => {
      const { path: overridePath, ...requestOptions } = variables;
      const resolvedPath = overridePath ?? path;
      return apiRequest<TResponse>({
        path: resolvedPath,
        method,
        ...requestOptions,
      });
    },
    ...options,
  });
}
