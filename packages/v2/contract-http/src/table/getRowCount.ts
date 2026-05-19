import type { IQueryBaseRo, IRowCountVo } from '@teable/openapi';
import { queryBaseSchema, rowCountVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getRowCountInputSchema = z.object({
  tableId: z.string(),
  query: queryBaseSchema.optional(),
});

export type IGetRowCountRequestDto = {
  tableId: string;
  query?: IQueryBaseRo;
};

export interface IGetRowCountResponseDataDto {
  rowCount: IRowCountVo['rowCount'];
}

export type IGetRowCountResponseDto = IApiResponseDto<IGetRowCountResponseDataDto>;
export type IGetRowCountOkResponseDto = IApiOkResponseDto<IGetRowCountResponseDataDto>;
export type IGetRowCountErrorResponseDto = IApiErrorResponseDto;

export type IGetRowCountEndpointResult =
  | { status: 200; body: IGetRowCountOkResponseDto }
  | { status: HttpErrorStatus; body: IGetRowCountErrorResponseDto };

export const getRowCountResponseDataSchema = z.object({
  rowCount: rowCountVoSchema.shape.rowCount,
});

export const getRowCountOkResponseSchema = apiOkResponseDtoSchema(getRowCountResponseDataSchema);
export const getRowCountErrorResponseSchema = apiErrorResponseDtoSchema;
