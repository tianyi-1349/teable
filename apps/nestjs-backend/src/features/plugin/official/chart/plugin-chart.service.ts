import { Injectable } from '@nestjs/common';
import { CellFormat, HttpErrorCode } from '@teable/core';
import { BaseQueryColumnType, type IBaseQuery } from '@teable/openapi';
import { CustomHttpException } from '../../../../custom.exception';
import { BaseQueryService } from '../../../base/base-query/base-query.service';
import { DashboardService } from '../../../dashboard/dashboard.service';
import { PluginPanelService } from '../../../plugin-panel/plugin-panel.service';

interface IInteractionFilterPayload {
  dimensionColumn: string;
  dimensionValues: (string | number)[];
}

export const mergeInteractionFilterToQuery = (
  query: IBaseQuery,
  interactionFilter?: string
): IBaseQuery => {
  if (!interactionFilter) {
    return query;
  }

  let parsed: IInteractionFilterPayload | undefined;
  try {
    parsed = JSON.parse(interactionFilter) as IInteractionFilterPayload;
  } catch {
    return query;
  }

  if (!parsed?.dimensionColumn || !parsed.dimensionValues?.length) {
    return query;
  }

  const interactionWhere = {
    conjunction: 'or' as const,
    filterSet: parsed.dimensionValues.map((value) => ({
      column: parsed!.dimensionColumn,
      type: BaseQueryColumnType.Field,
      operator: 'is' as const,
      value,
    })),
  };

  if (!query.where) {
    return {
      ...query,
      where: interactionWhere,
    };
  }

  return {
    ...query,
    where: {
      conjunction: 'and',
      filterSet: [query.where, interactionWhere],
    },
  };
};

@Injectable()
export class PluginChartService {
  constructor(
    private readonly baseQueryService: BaseQueryService,
    private readonly dashboardService: DashboardService,
    private readonly pluginPanelService: PluginPanelService
  ) {}

  async getDashboardPluginQuery(
    pluginInstallId: string,
    positionId: string,
    baseId: string,
    interactionFilter?: string,
    cellFormat: CellFormat = CellFormat.Text
  ) {
    const { storage } = await this.dashboardService.getPluginInstall(
      baseId,
      positionId,
      pluginInstallId
    );
    const query = storage?.query as IBaseQuery;
    if (!query) {
      throw new CustomHttpException(
        'Dashboard Plugin Storage Query not found',
        HttpErrorCode.VALIDATION_ERROR,
        {
          localization: {
            i18nKey: 'httpErrors.pluginChart.queryNotFound',
          },
        }
      );
    }
    return this.baseQueryService.baseQuery(
      baseId,
      mergeInteractionFilterToQuery(query, interactionFilter),
      cellFormat
    );
  }

  async getPluginPanelPluginQuery(
    pluginInstallId: string,
    positionId: string,
    tableId: string,
    interactionFilter?: string,
    cellFormat: CellFormat = CellFormat.Text
  ) {
    const { baseId, storage } = await this.pluginPanelService.getPluginPanelPlugin(
      tableId,
      positionId,
      pluginInstallId
    );
    const query = storage?.query as IBaseQuery;
    if (!query) {
      throw new CustomHttpException(
        'Plugin Panel Plugin Storage Query not found',
        HttpErrorCode.VALIDATION_ERROR,
        {
          localization: {
            i18nKey: 'httpErrors.pluginChart.queryNotFound',
          },
        }
      );
    }
    return this.baseQueryService.baseQuery(
      baseId,
      mergeInteractionFilterToQuery(query, interactionFilter),
      cellFormat
    );
  }
}
