import {
  type ISearchIndexVo,
  searchIndexByQueryRoSchema,
  searchIndexVoSchema,
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

export const getShareViewSearchIndexInputSchema = z.object({
  shareId: z.string(),
  query: searchIndexByQueryRoSchema.optional(),
});

export type IGetShareViewSearchIndexRequestDto = z.input<typeof getShareViewSearchIndexInputSchema>;

export interface IGetShareViewSearchIndexResponseDataDto {
  searchIndex: ISearchIndexVo;
}

export type IGetShareViewSearchIndexResponseDto =
  IApiResponseDto<IGetShareViewSearchIndexResponseDataDto>;
export type IGetShareViewSearchIndexOkResponseDto =
  IApiOkResponseDto<IGetShareViewSearchIndexResponseDataDto>;
export type IGetShareViewSearchIndexErrorResponseDto = IApiErrorResponseDto;

export type IGetShareViewSearchIndexEndpointResult =
  | { status: 200; body: IGetShareViewSearchIndexOkResponseDto }
  | { status: HttpErrorStatus; body: IGetShareViewSearchIndexErrorResponseDto };

export const getShareViewSearchIndexResponseDataSchema = z.object({
  searchIndex: searchIndexVoSchema,
});

export const getShareViewSearchIndexOkResponseSchema = apiOkResponseDtoSchema(
  getShareViewSearchIndexResponseDataSchema
);
export const getShareViewSearchIndexErrorResponseSchema = apiErrorResponseDtoSchema;
