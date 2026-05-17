import type { IRecordIndexRo, IRecordIndexVo } from '@teable/openapi';
import { recordIndexRoSchema, recordIndexVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getRecordIndexInputSchema = z.object({
  tableId: z.string(),
  query: recordIndexRoSchema,
});

export type IGetRecordIndexRequestDto = {
  tableId: string;
  query: IRecordIndexRo;
};

export interface IGetRecordIndexResponseDataDto {
  recordIndex: IRecordIndexVo;
}

export type IGetRecordIndexResponseDto = IApiResponseDto<IGetRecordIndexResponseDataDto>;
export type IGetRecordIndexOkResponseDto = IApiOkResponseDto<IGetRecordIndexResponseDataDto>;
export type IGetRecordIndexErrorResponseDto = IApiErrorResponseDto;

export type IGetRecordIndexEndpointResult =
  | { status: 200; body: IGetRecordIndexOkResponseDto }
  | { status: HttpErrorStatus; body: IGetRecordIndexErrorResponseDto };

export const getRecordIndexResponseDataSchema = z.object({
  recordIndex: recordIndexVoSchema,
});

export const getRecordIndexOkResponseSchema = apiOkResponseDtoSchema(
  getRecordIndexResponseDataSchema
);
export const getRecordIndexErrorResponseSchema = apiErrorResponseDtoSchema;
