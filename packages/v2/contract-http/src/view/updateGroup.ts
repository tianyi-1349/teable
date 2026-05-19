import type { IGroup } from '@teable/core';
import { groupSchema } from '@teable/core';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';
import { getViewByIdInputSchema } from './getViewById';

export const updateViewGroupInputSchema = getViewByIdInputSchema.extend({
  group: groupSchema,
});

export type IUpdateViewGroupRequestDto = z.input<typeof updateViewGroupInputSchema>;

export interface IUpdateViewGroupResponseDataDto {
  success: true;
}

export type IUpdateViewGroupResponseDto = IApiResponseDto<IUpdateViewGroupResponseDataDto>;
export type IUpdateViewGroupOkResponseDto = IApiOkResponseDto<IUpdateViewGroupResponseDataDto>;
export type IUpdateViewGroupErrorResponseDto = IApiErrorResponseDto;

export type IUpdateViewGroupEndpointResult =
  | { status: 200; body: IUpdateViewGroupOkResponseDto }
  | { status: HttpErrorStatus; body: IUpdateViewGroupErrorResponseDto };

export const updateViewGroupResponseDataSchema = z.object({
  success: z.literal(true),
});

export const updateViewGroupOkResponseSchema = apiOkResponseDtoSchema(
  updateViewGroupResponseDataSchema
);
export const updateViewGroupErrorResponseSchema = apiErrorResponseDtoSchema;

export interface IUpdateViewGroupRo {
  group: IGroup;
}
