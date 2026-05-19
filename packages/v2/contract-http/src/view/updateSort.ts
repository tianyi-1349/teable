import type { ISort } from '@teable/core';
import { sortSchema } from '@teable/core';
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

export const updateViewSortInputSchema = getViewByIdInputSchema.extend({
  sort: sortSchema,
});

export type IUpdateViewSortRequestDto = z.input<typeof updateViewSortInputSchema>;

export interface IUpdateViewSortResponseDataDto {
  success: true;
}

export type IUpdateViewSortResponseDto = IApiResponseDto<IUpdateViewSortResponseDataDto>;
export type IUpdateViewSortOkResponseDto = IApiOkResponseDto<IUpdateViewSortResponseDataDto>;
export type IUpdateViewSortErrorResponseDto = IApiErrorResponseDto;

export type IUpdateViewSortEndpointResult =
  | { status: 200; body: IUpdateViewSortOkResponseDto }
  | { status: HttpErrorStatus; body: IUpdateViewSortErrorResponseDto };

export const updateViewSortResponseDataSchema = z.object({
  success: z.literal(true),
});

export const updateViewSortOkResponseSchema = apiOkResponseDtoSchema(
  updateViewSortResponseDataSchema
);
export const updateViewSortErrorResponseSchema = apiErrorResponseDtoSchema;

export interface IUpdateViewSortRo {
  sort: ISort;
}
