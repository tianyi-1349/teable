import type { DomainError, IListViewsQueryInput, ListViewsResult } from '@teable/v2-core';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';
import { mapViewToDto } from '../table/dto';
import { sequenceResults } from '../shared/neverthrow';
import { type IViewDto, viewDtoSchema } from './dto';

export type IListViewsRequestDto = IListViewsQueryInput;

export interface IListViewsResponseDataDto {
  views: Array<IViewDto>;
}

export type IListViewsResponseDto = IApiResponseDto<IListViewsResponseDataDto>;
export type IListViewsOkResponseDto = IApiOkResponseDto<IListViewsResponseDataDto>;
export type IListViewsErrorResponseDto = IApiErrorResponseDto;

export type IListViewsEndpointResult =
  | { status: 200; body: IListViewsOkResponseDto }
  | { status: HttpErrorStatus; body: IListViewsErrorResponseDto };

export const listViewsResponseDataSchema = z.object({
  views: z.array(viewDtoSchema),
});

export const listViewsOkResponseSchema = apiOkResponseDtoSchema(listViewsResponseDataSchema);
export const listViewsErrorResponseSchema = apiErrorResponseDtoSchema;

export const mapListViewsResultToDto = (
  result: ListViewsResult
): Result<IListViewsResponseDataDto, DomainError> => {
  return sequenceResults(result.views.map(mapViewToDto)).map((views) => ({ views: [...views] }));
};
