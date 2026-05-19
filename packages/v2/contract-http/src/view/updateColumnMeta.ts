import type { IColumnMetaRo } from '@teable/core';
import { columnMetaRoSchema } from '@teable/core';
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

export const updateViewColumnMetaInputSchema = getViewByIdInputSchema.extend({
  columnMeta: columnMetaRoSchema,
});

export type IUpdateViewColumnMetaRequestDto = z.input<typeof updateViewColumnMetaInputSchema>;

export interface IUpdateViewColumnMetaResponseDataDto {
  success: true;
}

export type IUpdateViewColumnMetaResponseDto =
  IApiResponseDto<IUpdateViewColumnMetaResponseDataDto>;
export type IUpdateViewColumnMetaOkResponseDto =
  IApiOkResponseDto<IUpdateViewColumnMetaResponseDataDto>;
export type IUpdateViewColumnMetaErrorResponseDto = IApiErrorResponseDto;

export type IUpdateViewColumnMetaEndpointResult =
  | { status: 200; body: IUpdateViewColumnMetaOkResponseDto }
  | { status: HttpErrorStatus; body: IUpdateViewColumnMetaErrorResponseDto };

export const updateViewColumnMetaResponseDataSchema = z.object({
  success: z.literal(true),
});

export const updateViewColumnMetaOkResponseSchema = apiOkResponseDtoSchema(
  updateViewColumnMetaResponseDataSchema
);

export const updateViewColumnMetaErrorResponseSchema = apiErrorResponseDtoSchema;

export type IUpdateViewColumnMetaRo = IColumnMetaRo;
