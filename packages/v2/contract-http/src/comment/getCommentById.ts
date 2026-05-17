import { type ICommentVo, commentSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getCommentByIdInputSchema = z.object({
  commentId: z.string(),
});

export type IGetCommentByIdRequestDto = z.input<typeof getCommentByIdInputSchema>;

export interface IGetCommentByIdResponseDataDto {
  comment: ICommentVo | null;
}

export type IGetCommentByIdResponseDto = IApiResponseDto<IGetCommentByIdResponseDataDto>;
export type IGetCommentByIdOkResponseDto = IApiOkResponseDto<IGetCommentByIdResponseDataDto>;
export type IGetCommentByIdErrorResponseDto = IApiErrorResponseDto;

export type IGetCommentByIdEndpointResult =
  | { status: 200; body: IGetCommentByIdOkResponseDto }
  | { status: HttpErrorStatus; body: IGetCommentByIdErrorResponseDto };

export const getCommentByIdResponseDataSchema = z.object({
  comment: commentSchema.nullable(),
});

export const getCommentByIdOkResponseSchema = apiOkResponseDtoSchema(
  getCommentByIdResponseDataSchema
);
export const getCommentByIdErrorResponseSchema = apiErrorResponseDtoSchema;
