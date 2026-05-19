import { type ICommentVo, commentSchema, getCommentListQueryRoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const listCommentsInputSchema = z
  .object({
    tableId: z.string(),
    recordId: z.string(),
  })
  .merge(getCommentListQueryRoSchema);

export type IListCommentsRequestDto = z.input<typeof listCommentsInputSchema>;

export interface IListCommentsResponseDataDto {
  comments: ICommentVo[];
  nextCursor?: string | null;
}

export type IListCommentsResponseDto = IApiResponseDto<IListCommentsResponseDataDto>;
export type IListCommentsOkResponseDto = IApiOkResponseDto<IListCommentsResponseDataDto>;
export type IListCommentsErrorResponseDto = IApiErrorResponseDto;

export type IListCommentsEndpointResult =
  | { status: 200; body: IListCommentsOkResponseDto }
  | { status: HttpErrorStatus; body: IListCommentsErrorResponseDto };

export const listCommentsResponseDataSchema = z.object({
  comments: z.array(commentSchema),
  nextCursor: z.string().nullable().optional(),
});

export const listCommentsOkResponseSchema = apiOkResponseDtoSchema(listCommentsResponseDataSchema);
export const listCommentsErrorResponseSchema = apiErrorResponseDtoSchema;
