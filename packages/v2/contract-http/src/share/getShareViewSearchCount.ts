import { type ISearchCountVo, searchCountRoSchema, searchCountVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getShareViewSearchCountInputSchema = z.object({
  shareId: z.string(),
  query: searchCountRoSchema.optional(),
});

export type IGetShareViewSearchCountRequestDto = z.input<typeof getShareViewSearchCountInputSchema>;

export interface IGetShareViewSearchCountResponseDataDto {
  searchCount: ISearchCountVo;
}

export type IGetShareViewSearchCountResponseDto =
  IApiResponseDto<IGetShareViewSearchCountResponseDataDto>;
export type IGetShareViewSearchCountOkResponseDto =
  IApiOkResponseDto<IGetShareViewSearchCountResponseDataDto>;
export type IGetShareViewSearchCountErrorResponseDto = IApiErrorResponseDto;

export type IGetShareViewSearchCountEndpointResult =
  | { status: 200; body: IGetShareViewSearchCountOkResponseDto }
  | { status: HttpErrorStatus; body: IGetShareViewSearchCountErrorResponseDto };

export const getShareViewSearchCountResponseDataSchema = z.object({
  searchCount: searchCountVoSchema,
});

export const getShareViewSearchCountOkResponseSchema = apiOkResponseDtoSchema(
  getShareViewSearchCountResponseDataSchema
);
export const getShareViewSearchCountErrorResponseSchema = apiErrorResponseDtoSchema;
