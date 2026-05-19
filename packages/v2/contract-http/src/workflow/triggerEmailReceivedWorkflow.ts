import { type IWorkflowRunVo, workflowRunVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const triggerEmailReceivedWorkflowInputSchema = z.object({
  baseId: z.string(),
  workflowId: z.string(),
  body: z.unknown().optional(),
});

export type ITriggerEmailReceivedWorkflowRequestDto = z.input<
  typeof triggerEmailReceivedWorkflowInputSchema
>;

export interface ITriggerEmailReceivedWorkflowResponseDataDto {
  run: IWorkflowRunVo;
}

export type ITriggerEmailReceivedWorkflowResponseDto =
  IApiResponseDto<ITriggerEmailReceivedWorkflowResponseDataDto>;
export type ITriggerEmailReceivedWorkflowOkResponseDto =
  IApiOkResponseDto<ITriggerEmailReceivedWorkflowResponseDataDto>;
export type ITriggerEmailReceivedWorkflowErrorResponseDto = IApiErrorResponseDto;

export type ITriggerEmailReceivedWorkflowEndpointResult =
  | { status: 201; body: ITriggerEmailReceivedWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: ITriggerEmailReceivedWorkflowErrorResponseDto };

export const triggerEmailReceivedWorkflowResponseDataSchema = z.object({
  run: workflowRunVoSchema,
});

export const triggerEmailReceivedWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  triggerEmailReceivedWorkflowResponseDataSchema
);
export const triggerEmailReceivedWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
