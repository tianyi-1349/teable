import type { IAggregationRo, IAggregationVo } from '@teable/openapi';
import { aggregationRoSchema, aggregationVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getAggregationInputSchema = z.object({
  tableId: z.string(),
  query: aggregationRoSchema.optional(),
});

export type IGetAggregationRequestDto = {
  tableId: string;
  query?: IAggregationRo;
};

export interface IGetAggregationResponseDataDto {
  aggregation: IAggregationVo;
}

export type IGetAggregationResponseDto = IApiResponseDto<IGetAggregationResponseDataDto>;
export type IGetAggregationOkResponseDto = IApiOkResponseDto<IGetAggregationResponseDataDto>;
export type IGetAggregationErrorResponseDto = IApiErrorResponseDto;

export type IGetAggregationEndpointResult =
  | { status: 200; body: IGetAggregationOkResponseDto }
  | { status: HttpErrorStatus; body: IGetAggregationErrorResponseDto };

export const getAggregationResponseDataSchema = z.object({
  aggregation: aggregationVoSchema,
});

export const getAggregationOkResponseSchema = apiOkResponseDtoSchema(
  getAggregationResponseDataSchema
);
export const getAggregationErrorResponseSchema = apiErrorResponseDtoSchema;
