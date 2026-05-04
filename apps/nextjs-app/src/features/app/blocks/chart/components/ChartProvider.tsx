import type { IParentBridgeMethods, IUIConfig } from '@teable/sdk';
import React, { useRef } from 'react';
import type { IChartInteractionConfig, IChartInteractionFilter, IChartStorage } from '../types';

export interface IChartContext {
  tab: 'chart' | 'query';
  storage?: IChartStorage;
  uiConfig?: IUIConfig;
  queryError?: string;
  interactionFilter?: IChartInteractionFilter;
  interactionConfig: Required<IChartInteractionConfig>;
  onQueryError?: (error?: string) => void;
  onInteractionFilterChange: (filter?: IChartInteractionFilter) => Promise<unknown>;
  onTabChange: (tab: 'chart' | 'query') => void;
  onStorageChange: (storage: IChartStorage) => Promise<unknown>;
  parentBridgeMethods?: IParentBridgeMethods;
}

export const ChartContext = React.createContext<IChartContext>({
  tab: 'chart',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onTabChange: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onStorageChange: (storage: IChartStorage) => Promise.resolve(storage),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onInteractionFilterChange: (filter?: IChartInteractionFilter) => Promise.resolve(filter),
  interactionConfig: {
    mode: 'multi',
    clearBehavior: 'toggle-empty',
  },
});

export const ChartProvider = (props: {
  children: React.ReactNode;
  storage?: IChartStorage;
  uiConfig?: IUIConfig;
  parentBridgeMethods?: IParentBridgeMethods;
}) => {
  const { children, storage, uiConfig, parentBridgeMethods } = props;
  const [tab, setTab] = React.useState<'chart' | 'query'>(storage?.query ? 'chart' : 'query');
  const [storageState, setStorageState] = React.useState<IChartStorage | undefined>(storage);
  const [queryError, setQueryError] = React.useState<string | undefined>();
  const preStorage = useRef<IChartStorage | undefined>();
  const interactionUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (interactionUpdateTimerRef.current) {
        clearTimeout(interactionUpdateTimerRef.current);
      }
    };
  }, []);

  const updateStorage = async (storage: IChartStorage) => {
    try {
      preStorage.current = storage;
      setStorageState(storage);
      await parentBridgeMethods?.updateStorage(storage as unknown as Record<string, unknown>);
    } catch (error) {
      console.error('Failed to update storage', error);
      setStorageState(preStorage.current);
    }
  };

  const updateInteractionFilter = async (filter?: IChartInteractionFilter) => {
    if (!storageState) {
      return Promise.resolve();
    }
    if (interactionUpdateTimerRef.current) {
      clearTimeout(interactionUpdateTimerRef.current);
    }
    return new Promise((resolve) => {
      interactionUpdateTimerRef.current = setTimeout(async () => {
        await updateStorage({
          ...storageState,
          interaction: {
            ...storageState.interaction,
            filter,
          },
        });
        resolve(undefined);
      }, 50);
    });
  };

  return (
    <ChartContext.Provider
      value={{
        tab,
        uiConfig,
        storage: storageState,
        interactionFilter: storageState?.interaction?.filter,
        interactionConfig: {
          mode: storageState?.interaction?.config?.mode ?? 'multi',
          clearBehavior: storageState?.interaction?.config?.clearBehavior ?? 'toggle-empty',
        },
        queryError,
        parentBridgeMethods,
        onTabChange: setTab,
        onQueryError: setQueryError,
        onStorageChange: updateStorage,
        onInteractionFilterChange: updateInteractionFilter,
      }}
    >
      {children}
    </ChartContext.Provider>
  );
};
