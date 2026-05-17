import { type IRowCountVo, rowCountVoSchema, shareViewRowCountRoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getShareViewRowCountInputSchema = z.object({
  shareId: z.string(),
  query: shareViewRowCountRoSchema.optional(),
});

export type IGetShareViewRowCountRequestDto = z.input<typeof getShareViewRowCountInputSchema>;

export interface IGetShareViewRowCountResponseDataDto {
  rowCount: IRowCountVo;
}

export type IGetShareViewRowCountResponseDto =
  IApiResponseDto<IGetShareViewRowCountResponseDataDto>;
export type IGetShareViewRowCountOkResponseDto =
  IApiOkResponseDto<IGetShareViewRowCountResponseDataDto>;
export type IGetShareViewRowCountErrorResponseDto = IApiErrorResponseDto;

export type IGetShareViewRowCountEndpointResult =
  | { status: 200; body: IGetShareViewRowCountOkResponseDto }
  | { status: HttpErrorStatus; body: IGetShareViewRowCountErrorResponseDto };

export const getShareViewRowCountResponseDataSchema = z.object({
  rowCount: rowCountVoSchema,
});

export const getShareViewRowCountOkResponseSchema = apiOkResponseDtoSchema(
  getShareViewRowCountResponseDataSchema
);
export const getShareViewRowCountErrorResponseSchema = apiErrorResponseDtoSchema;
