import { useMutation } from '@tanstack/react-query';
import { ApiError, apiRequest  } from '../utils';
import { ApiMutationVariables, UseApiMutationConfig } from '../types';


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
