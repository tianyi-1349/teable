import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const deleteWorkflowInputSchema = z.object({
  baseId: z.string(),
  workflowId: z.string(),
});

export type IDeleteWorkflowRequestDto = z.input<typeof deleteWorkflowInputSchema>;

export interface IDeleteWorkflowResponseDataDto {
  success: true;
}

export type IDeleteWorkflowResponseDto = IApiResponseDto<IDeleteWorkflowResponseDataDto>;
export type IDeleteWorkflowOkResponseDto = IApiOkResponseDto<IDeleteWorkflowResponseDataDto>;
export type IDeleteWorkflowErrorResponseDto = IApiErrorResponseDto;

export type IDeleteWorkflowEndpointResult =
  | { status: 200; body: IDeleteWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: IDeleteWorkflowErrorResponseDto };

export const deleteWorkflowResponseDataSchema = z.object({
  success: z.literal(true),
});

export const deleteWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  deleteWorkflowResponseDataSchema
);
export const deleteWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
