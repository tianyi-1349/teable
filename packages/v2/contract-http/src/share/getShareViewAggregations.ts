import {
  type IAggregationVo,
  aggregationVoSchema,
  shareViewAggregationsRoSchema,
} from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getShareViewAggregationsInputSchema = z.object({
  shareId: z.string(),
  query: shareViewAggregationsRoSchema.optional(),
});

export type IGetShareViewAggregationsRequestDto = z.input<
  typeof getShareViewAggregationsInputSchema
>;

export interface IGetShareViewAggregationsResponseDataDto {
  aggregations: IAggregationVo;
}

export type IGetShareViewAggregationsResponseDto =
  IApiResponseDto<IGetShareViewAggregationsResponseDataDto>;
export type IGetShareViewAggregationsOkResponseDto =
  IApiOkResponseDto<IGetShareViewAggregationsResponseDataDto>;
export type IGetShareViewAggregationsErrorResponseDto = IApiErrorResponseDto;

export type IGetShareViewAggregationsEndpointResult =
  | { status: 200; body: IGetShareViewAggregationsOkResponseDto }
  | { status: HttpErrorStatus; body: IGetShareViewAggregationsErrorResponseDto };

export const getShareViewAggregationsResponseDataSchema = z.object({
  aggregations: aggregationVoSchema,
});

export const getShareViewAggregationsOkResponseSchema = apiOkResponseDtoSchema(
  getShareViewAggregationsResponseDataSchema
);
export const getShareViewAggregationsErrorResponseSchema = apiErrorResponseDtoSchema;
