import type { DomainError, GetViewByIdResult } from '@teable/v2-core';
import { type Result } from 'neverthrow';
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
import { type IViewDto, viewDtoSchema } from './dto';
import { getViewByIdInputSchema as getViewByIdQueryInputSchema } from '@teable/v2-core';

export const getViewByIdInputSchema = getViewByIdQueryInputSchema;

export type IGetViewByIdRequestDto = z.input<typeof getViewByIdInputSchema>;

export interface IGetViewByIdResponseDataDto {
  view: IViewDto;
}

export type IGetViewByIdResponseDto = IApiResponseDto<IGetViewByIdResponseDataDto>;
export type IGetViewByIdOkResponseDto = IApiOkResponseDto<IGetViewByIdResponseDataDto>;
export type IGetViewByIdErrorResponseDto = IApiErrorResponseDto;

export type IGetViewByIdEndpointResult =
  | { status: 200; body: IGetViewByIdOkResponseDto }
  | { status: HttpErrorStatus; body: IGetViewByIdErrorResponseDto };

export const getViewByIdResponseDataSchema = z.object({
  view: viewDtoSchema,
});

export const getViewByIdOkResponseSchema = apiOkResponseDtoSchema(getViewByIdResponseDataSchema);
export const getViewByIdErrorResponseSchema = apiErrorResponseDtoSchema;

export const mapGetViewByIdResultToDto = (
  result: GetViewByIdResult
): Result<IGetViewByIdResponseDataDto, DomainError> => {
  return mapViewToDto(result.view).map((view) => ({ view }));
};
