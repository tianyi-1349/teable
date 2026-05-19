import type { ISearchCountRo, ISearchCountVo } from '@teable/openapi';
import { searchCountRoSchema, searchCountVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getSearchCountInputSchema = z.object({
  tableId: z.string(),
  query: searchCountRoSchema,
});

export type IGetSearchCountRequestDto = {
  tableId: string;
  query: ISearchCountRo;
};

export interface IGetSearchCountResponseDataDto {
  searchCount: ISearchCountVo;
}

export type IGetSearchCountResponseDto = IApiResponseDto<IGetSearchCountResponseDataDto>;
export type IGetSearchCountOkResponseDto = IApiOkResponseDto<IGetSearchCountResponseDataDto>;
export type IGetSearchCountErrorResponseDto = IApiErrorResponseDto;

export type IGetSearchCountEndpointResult =
  | { status: 200; body: IGetSearchCountOkResponseDto }
  | { status: HttpErrorStatus; body: IGetSearchCountErrorResponseDto };

export const getSearchCountResponseDataSchema = z.object({
  searchCount: searchCountVoSchema,
});

export const getSearchCountOkResponseSchema = apiOkResponseDtoSchema(
  getSearchCountResponseDataSchema
);
export const getSearchCountErrorResponseSchema = apiErrorResponseDtoSchema;
