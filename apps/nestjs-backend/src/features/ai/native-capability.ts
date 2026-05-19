import type {
  IGetAIConfig,
  IGetNativeAICapabilitiesQuery,
  INativeAICapability,
  INativeAICapabilitiesVo,
  IQueryNativeAICapabilitiesRo,
} from '@teable/openapi';

const nativeAiActions = ['aiChat', 'aiGenerate', 'aiExtractAndWrite', 'aiViewContext'] as const;

const hasChatModel = (config: IGetAIConfig | null) => Boolean(config?.chatModel?.lg);

export const resolveNativeCapabilities = (
  config: IGetAIConfig | null,
  disableActions: string[] = []
): INativeAICapability[] => {
  const disabled = new Set(disableActions);
  const modelConfigured = hasChatModel(config);

  return nativeAiActions.map((action) => {
    if (disabled.has(action)) {
      return { action, enabled: false, reason: 'Action is disabled by configuration.' };
    }
    if (!modelConfigured) {
      return { action, enabled: false, reason: 'AI chat model is not configured.' };
    }
    return { action, enabled: true };
  });
};

export const filterNativeCapabilities = (
  items: INativeAICapability[],
  query?: IGetNativeAICapabilitiesQuery
) => {
  return items.filter((item) => {
    if (query?.actions?.length && !query.actions.includes(item.action)) {
      return false;
    }
    if (query?.enabled != null && item.enabled !== query.enabled) {
      return false;
    }
    return true;
  });
};

export const buildNativeCapabilitiesVo = (
  items: INativeAICapability[]
): INativeAICapabilitiesVo => ({
  capabilities: items,
});

export const queryNativeCapabilities = (
  items: INativeAICapability[],
  queryRo: IQueryNativeAICapabilitiesRo
): INativeAICapabilitiesVo => {
  return buildNativeCapabilitiesVo(
    items.filter((item) => !queryRo.actions?.length || queryRo.actions.includes(item.action))
  );
};
