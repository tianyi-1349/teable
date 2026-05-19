import type { IFilterRo } from '@teable/core';
import { filterRoSchema } from '@teable/core';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';
import { getViewByIdInputSchema } from './getViewById';

export const updateViewFilterInputSchema = getViewByIdInputSchema.extend({
  filter: filterRoSchema.shape.filter,
});

export type IUpdateViewFilterRequestDto = z.input<typeof updateViewFilterInputSchema>;

export interface IUpdateViewFilterResponseDataDto {
  success: true;
}

export type IUpdateViewFilterResponseDto = IApiResponseDto<IUpdateViewFilterResponseDataDto>;
export type IUpdateViewFilterOkResponseDto = IApiOkResponseDto<IUpdateViewFilterResponseDataDto>;
export type IUpdateViewFilterErrorResponseDto = IApiErrorResponseDto;

export type IUpdateViewFilterEndpointResult =
  | { status: 200; body: IUpdateViewFilterOkResponseDto }
  | { status: HttpErrorStatus; body: IUpdateViewFilterErrorResponseDto };

export const updateViewFilterResponseDataSchema = z.object({
  success: z.literal(true),
});

export const updateViewFilterOkResponseSchema = apiOkResponseDtoSchema(
  updateViewFilterResponseDataSchema
);

export const updateViewFilterErrorResponseSchema = apiErrorResponseDtoSchema;

export type IUpdateViewFilterRo = IFilterRo;
