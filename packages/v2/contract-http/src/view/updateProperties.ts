import { shareViewMetaSchema, viewOptionsSchema } from '@teable/core';
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

export const updateViewNameInputSchema = getViewByIdInputSchema.extend({
  name: z.string(),
});

export const updateViewDescriptionInputSchema = getViewByIdInputSchema.extend({
  description: z.string(),
});

export const updateViewLockedInputSchema = getViewByIdInputSchema.extend({
  isLocked: z.boolean().optional(),
});

export const updateViewShareMetaInputSchema = getViewByIdInputSchema.extend({
  shareMeta: shareViewMetaSchema,
});

export const updateViewOptionsInputSchema = getViewByIdInputSchema.extend({
  options: viewOptionsSchema,
});

export const updateViewOrderInputSchema = getViewByIdInputSchema.extend({
  anchorId: z.string(),
  position: z.enum(['before', 'after']),
});

export type IUpdateViewNameRequestDto = z.input<typeof updateViewNameInputSchema>;
export type IUpdateViewDescriptionRequestDto = z.input<typeof updateViewDescriptionInputSchema>;
export type IUpdateViewLockedRequestDto = z.input<typeof updateViewLockedInputSchema>;
export type IUpdateViewShareMetaRequestDto = z.input<typeof updateViewShareMetaInputSchema>;
export type IUpdateViewOptionsRequestDto = z.input<typeof updateViewOptionsInputSchema>;
export type IUpdateViewOrderRequestDto = z.input<typeof updateViewOrderInputSchema>;

export interface IUpdateViewPropertyResponseDataDto {
  success: true;
}

export type IUpdateViewPropertyResponseDto = IApiResponseDto<IUpdateViewPropertyResponseDataDto>;
export type IUpdateViewPropertyOkResponseDto =
  IApiOkResponseDto<IUpdateViewPropertyResponseDataDto>;
export type IUpdateViewPropertyErrorResponseDto = IApiErrorResponseDto;

export type IUpdateViewPropertyEndpointResult =
  | { status: 200; body: IUpdateViewPropertyOkResponseDto }
  | { status: HttpErrorStatus; body: IUpdateViewPropertyErrorResponseDto };

export const updateViewPropertyResponseDataSchema = z.object({
  success: z.literal(true),
});

export const updateViewPropertyOkResponseSchema = apiOkResponseDtoSchema(
  updateViewPropertyResponseDataSchema
);

export const updateViewPropertyErrorResponseSchema = apiErrorResponseDtoSchema;
