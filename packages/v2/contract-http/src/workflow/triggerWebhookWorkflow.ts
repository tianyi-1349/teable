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

export const triggerWebhookWorkflowInputSchema = z.object({
  baseId: z.string(),
  workflowId: z.string(),
  body: z.unknown().optional(),
  webhookSecret: z.string().optional(),
  webhookSignature: z.string().optional(),
  webhookTimestamp: z.string().optional(),
});

export type ITriggerWebhookWorkflowRequestDto = z.input<typeof triggerWebhookWorkflowInputSchema>;

export interface ITriggerWebhookWorkflowResponseDataDto {
  run: IWorkflowRunVo;
}

export type ITriggerWebhookWorkflowResponseDto =
  IApiResponseDto<ITriggerWebhookWorkflowResponseDataDto>;
export type ITriggerWebhookWorkflowOkResponseDto =
  IApiOkResponseDto<ITriggerWebhookWorkflowResponseDataDto>;
export type ITriggerWebhookWorkflowErrorResponseDto = IApiErrorResponseDto;
export type ITriggerWebhookWorkflowErrorStatus = HttpErrorStatus | 413 | 429;

export type ITriggerWebhookWorkflowEndpointResult =
  | { status: 201; body: ITriggerWebhookWorkflowOkResponseDto }
  | { status: ITriggerWebhookWorkflowErrorStatus; body: ITriggerWebhookWorkflowErrorResponseDto };

export const triggerWebhookWorkflowResponseDataSchema = z.object({
  run: workflowRunVoSchema,
});

export const triggerWebhookWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  triggerWebhookWorkflowResponseDataSchema
);
export const triggerWebhookWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
