import type { ISearchIndexByQueryRo, ISearchIndexVo } from '@teable/openapi';
import { searchIndexByQueryRoSchema, searchIndexVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getSearchIndexInputSchema = z.object({
  tableId: z.string(),
  query: searchIndexByQueryRoSchema,
});

export type IGetSearchIndexRequestDto = {
  tableId: string;
  query: ISearchIndexByQueryRo;
};

export interface IGetSearchIndexResponseDataDto {
  searchIndex: ISearchIndexVo;
}

export type IGetSearchIndexResponseDto = IApiResponseDto<IGetSearchIndexResponseDataDto>;
export type IGetSearchIndexOkResponseDto = IApiOkResponseDto<IGetSearchIndexResponseDataDto>;
export type IGetSearchIndexErrorResponseDto = IApiErrorResponseDto;

export type IGetSearchIndexEndpointResult =
  | { status: 200; body: IGetSearchIndexOkResponseDto }
  | { status: HttpErrorStatus; body: IGetSearchIndexErrorResponseDto };

export const getSearchIndexResponseDataSchema = z.object({
  searchIndex: searchIndexVoSchema,
});

export const getSearchIndexOkResponseSchema = apiOkResponseDtoSchema(
  getSearchIndexResponseDataSchema
);
export const getSearchIndexErrorResponseSchema = apiErrorResponseDtoSchema;
