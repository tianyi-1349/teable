import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const commentSubscribeInputSchema = z.object({
  tableId: z.string(),
  recordId: z.string(),
});

export type ICommentSubscribeRequestDto = z.input<typeof commentSubscribeInputSchema>;

export interface ICommentSubscribeDetailDto {
  tableId: string;
  recordId: string;
  createdBy: string;
}

export interface IGetCommentSubscribeResponseDataDto {
  subscription: ICommentSubscribeDetailDto | null;
}

export interface ICommentSubscribeMutationResponseDataDto {
  success: true;
}

export type IGetCommentSubscribeResponseDto = IApiResponseDto<IGetCommentSubscribeResponseDataDto>;
export type IGetCommentSubscribeOkResponseDto =
  IApiOkResponseDto<IGetCommentSubscribeResponseDataDto>;
export type IGetCommentSubscribeErrorResponseDto = IApiErrorResponseDto;

export type ICommentSubscribeMutationResponseDto =
  IApiResponseDto<ICommentSubscribeMutationResponseDataDto>;
export type ICommentSubscribeMutationOkResponseDto =
  IApiOkResponseDto<ICommentSubscribeMutationResponseDataDto>;
export type ICommentSubscribeMutationErrorResponseDto = IApiErrorResponseDto;

export type IGetCommentSubscribeEndpointResult =
  | { status: 200; body: IGetCommentSubscribeOkResponseDto }
  | { status: HttpErrorStatus; body: IGetCommentSubscribeErrorResponseDto };

export type ICommentSubscribeMutationEndpointResult =
  | { status: 200; body: ICommentSubscribeMutationOkResponseDto }
  | { status: HttpErrorStatus; body: ICommentSubscribeMutationErrorResponseDto };

export const commentSubscribeDetailSchema = z.object({
  tableId: z.string(),
  recordId: z.string(),
  createdBy: z.string(),
});

export const getCommentSubscribeResponseDataSchema = z.object({
  subscription: commentSubscribeDetailSchema.nullable(),
});

export const commentSubscribeMutationResponseDataSchema = z.object({
  success: z.literal(true),
});

export const getCommentSubscribeOkResponseSchema = apiOkResponseDtoSchema(
  getCommentSubscribeResponseDataSchema
);
export const commentSubscribeMutationOkResponseSchema = apiOkResponseDtoSchema(
  commentSubscribeMutationResponseDataSchema
);
export const commentSubscribeErrorResponseSchema = apiErrorResponseDtoSchema;
