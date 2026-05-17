import { z } from 'zod';
import { getRecordsRoSchema } from '@teable/openapi';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getCommentRecordCountInputSchema = z.object({
  tableId: z.string(),
  recordId: z.string(),
});

export const getCommentTableCountInputSchema = z.object({
  tableId: z.string(),
  query: getRecordsRoSchema,
});

export type IGetCommentRecordCountRequestDto = z.input<typeof getCommentRecordCountInputSchema>;
export type IGetCommentTableCountRequestDto = z.input<typeof getCommentTableCountInputSchema>;

export interface IGetCommentRecordCountResponseDataDto {
  count: number;
}

export interface ICommentCountItemDto {
  recordId: string;
  count: number;
}

export interface IGetCommentTableCountResponseDataDto {
  counts: ICommentCountItemDto[];
}

export type IGetCommentRecordCountResponseDto =
  IApiResponseDto<IGetCommentRecordCountResponseDataDto>;
export type IGetCommentRecordCountOkResponseDto =
  IApiOkResponseDto<IGetCommentRecordCountResponseDataDto>;
export type IGetCommentRecordCountErrorResponseDto = IApiErrorResponseDto;

export type IGetCommentTableCountResponseDto =
  IApiResponseDto<IGetCommentTableCountResponseDataDto>;
export type IGetCommentTableCountOkResponseDto =
  IApiOkResponseDto<IGetCommentTableCountResponseDataDto>;
export type IGetCommentTableCountErrorResponseDto = IApiErrorResponseDto;

export type IGetCommentRecordCountEndpointResult =
  | { status: 200; body: IGetCommentRecordCountOkResponseDto }
  | { status: HttpErrorStatus; body: IGetCommentRecordCountErrorResponseDto };

export type IGetCommentTableCountEndpointResult =
  | { status: 200; body: IGetCommentTableCountOkResponseDto }
  | { status: HttpErrorStatus; body: IGetCommentTableCountErrorResponseDto };

export const commentCountItemSchema = z.object({
  recordId: z.string(),
  count: z.number(),
});

export const getCommentRecordCountResponseDataSchema = z.object({
  count: z.number(),
});

export const getCommentTableCountResponseDataSchema = z.object({
  counts: z.array(commentCountItemSchema),
});

export const getCommentRecordCountOkResponseSchema = apiOkResponseDtoSchema(
  getCommentRecordCountResponseDataSchema
);
export const getCommentTableCountOkResponseSchema = apiOkResponseDtoSchema(
  getCommentTableCountResponseDataSchema
);
export const getCommentCountErrorResponseSchema = apiErrorResponseDtoSchema;
