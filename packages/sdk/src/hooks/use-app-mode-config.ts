import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAppModeConfig, type IAppModeConfig, updateAppModeConfig } from '@teable/openapi';
import { useBaseId } from './use-base-id';

const appModeConfigQueryKey = (baseId: string) => ['app-mode', 'config', baseId] as const;

export const useAppModeConfig = (customBaseId?: string) => {
  const contextBaseId = useBaseId();
  const baseId = customBaseId ?? contextBaseId;
  const resolvedBaseId = baseId ?? '';
  const queryClient = useQueryClient();

  const {
    data: config,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: appModeConfigQueryKey(resolvedBaseId),
    queryFn: () => getAppModeConfig(resolvedBaseId).then((res) => res.data),
    enabled: Boolean(baseId),
  });

  const { mutateAsync: updateConfig, isPending: isUpdating } = useMutation({
    mutationFn: async (nextConfig: IAppModeConfig) => {
      if (!baseId) {
        throw new Error('baseId is required to update app mode config');
      }

      return updateAppModeConfig(baseId, nextConfig).then((res) => res.data);
    },
    onSuccess: (nextConfig) => {
      queryClient.setQueryData(appModeConfigQueryKey(resolvedBaseId), nextConfig);
    },
  });

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: appModeConfigQueryKey(resolvedBaseId) });

  return {
    baseId,
    config,
    isLoading,
    isFetching,
    isUpdating,
    updateConfig,
    refetch,
  };
};
