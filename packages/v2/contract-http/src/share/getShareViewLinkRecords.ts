import {
  type IShareViewLinkRecordsVo,
  shareViewLinkRecordsRoSchema,
  shareViewLinkRecordsVoSchema,
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

export const getShareViewLinkRecordsInputSchema = z.object({
  shareId: z.string(),
  query: shareViewLinkRecordsRoSchema,
});

export type IGetShareViewLinkRecordsRequestDto = z.input<typeof getShareViewLinkRecordsInputSchema>;

export interface IGetShareViewLinkRecordsResponseDataDto {
  linkRecords: IShareViewLinkRecordsVo;
}

export type IGetShareViewLinkRecordsResponseDto =
  IApiResponseDto<IGetShareViewLinkRecordsResponseDataDto>;
export type IGetShareViewLinkRecordsOkResponseDto =
  IApiOkResponseDto<IGetShareViewLinkRecordsResponseDataDto>;
export type IGetShareViewLinkRecordsErrorResponseDto = IApiErrorResponseDto;

export type IGetShareViewLinkRecordsEndpointResult =
  | { status: 200; body: IGetShareViewLinkRecordsOkResponseDto }
  | { status: HttpErrorStatus; body: IGetShareViewLinkRecordsErrorResponseDto };

export const getShareViewLinkRecordsResponseDataSchema = z.object({
  linkRecords: shareViewLinkRecordsVoSchema,
});

export const getShareViewLinkRecordsOkResponseSchema = apiOkResponseDtoSchema(
  getShareViewLinkRecordsResponseDataSchema
);
export const getShareViewLinkRecordsErrorResponseSchema = apiErrorResponseDtoSchema;
