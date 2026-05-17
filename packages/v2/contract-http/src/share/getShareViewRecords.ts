import { type IRecordsVo, recordsVoSchema, shareViewRecordsRoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getShareViewRecordsInputSchema = z.object({
  shareId: z.string(),
  query: shareViewRecordsRoSchema.optional(),
});

export type IGetShareViewRecordsRequestDto = z.input<typeof getShareViewRecordsInputSchema>;

export interface IGetShareViewRecordsResponseDataDto {
  records: IRecordsVo;
}

export type IGetShareViewRecordsResponseDto = IApiResponseDto<IGetShareViewRecordsResponseDataDto>;
export type IGetShareViewRecordsOkResponseDto =
  IApiOkResponseDto<IGetShareViewRecordsResponseDataDto>;
export type IGetShareViewRecordsErrorResponseDto = IApiErrorResponseDto;

export type IGetShareViewRecordsEndpointResult =
  | { status: 200; body: IGetShareViewRecordsOkResponseDto }
  | { status: HttpErrorStatus; body: IGetShareViewRecordsErrorResponseDto };

export const getShareViewRecordsResponseDataSchema = z.object({
  records: recordsVoSchema,
});

export const getShareViewRecordsOkResponseSchema = apiOkResponseDtoSchema(
  getShareViewRecordsResponseDataSchema
);
export const getShareViewRecordsErrorResponseSchema = apiErrorResponseDtoSchema;
