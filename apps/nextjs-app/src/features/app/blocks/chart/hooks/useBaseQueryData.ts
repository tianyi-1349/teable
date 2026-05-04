import { useQuery } from '@tanstack/react-query';
import type { CellFormat } from '@teable/core';
import {
  getDashboardInstallPluginQuery,
  getPluginPanelInstallPluginQuery,
  PluginPosition,
} from '@teable/openapi';
import { useContext, useMemo } from 'react';
import { ChartContext } from '../components/ChartProvider';
import { applyInteractionFilter, formatRes } from '../query';
import { useEnv } from './useEnv';

export const useBaseQueryData = (cellFormat?: CellFormat) => {
  const { baseId, positionId, positionType, tableId, pluginInstallId } = useEnv();
  const { interactionFilter } = useContext(ChartContext);
  const serializedInteractionFilter = interactionFilter
    ? JSON.stringify(interactionFilter)
    : undefined;
  const { data: dashboardQueryData } = useQuery({
    queryKey: [
      'dashboard-plugin-query',
      baseId,
      positionId,
      pluginInstallId,
      serializedInteractionFilter,
    ],
    queryFn: () =>
      getDashboardInstallPluginQuery(pluginInstallId, positionId, {
        baseId,
        interactionFilter: serializedInteractionFilter,
        cellFormat,
      }).then((res) => res.data),
    enabled: Boolean(
      positionType === PluginPosition.Dashboard && baseId && positionId && pluginInstallId
    ),
  });

  const { data: pluginPanelQueryData } = useQuery({
    queryKey: [
      'plugin-panel-plugin-query',
      tableId,
      positionId,
      pluginInstallId,
      serializedInteractionFilter,
    ],
    queryFn: () =>
      getPluginPanelInstallPluginQuery(pluginInstallId, positionId, {
        tableId: tableId!,
        interactionFilter: serializedInteractionFilter,
        cellFormat,
      }).then((res) => res.data),
    enabled: Boolean(
      positionType === PluginPosition.Panel && tableId && positionId && pluginInstallId
    ),
  });

  return useMemo(() => {
    const formatted =
      positionType === PluginPosition.Dashboard
        ? formatRes(dashboardQueryData)
        : formatRes(pluginPanelQueryData);

    return applyInteractionFilter(formatted, interactionFilter);
  }, [positionType, pluginPanelQueryData, dashboardQueryData, interactionFilter]);
};
