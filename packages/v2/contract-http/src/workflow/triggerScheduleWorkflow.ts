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

export const triggerScheduleWorkflowInputSchema = z.object({
  baseId: z.string(),
  workflowId: z.string(),
  body: z.unknown().optional(),
});

export type ITriggerScheduleWorkflowRequestDto = z.input<typeof triggerScheduleWorkflowInputSchema>;

export interface ITriggerScheduleWorkflowResponseDataDto {
  run: IWorkflowRunVo;
}

export type ITriggerScheduleWorkflowResponseDto =
  IApiResponseDto<ITriggerScheduleWorkflowResponseDataDto>;
export type ITriggerScheduleWorkflowOkResponseDto =
  IApiOkResponseDto<ITriggerScheduleWorkflowResponseDataDto>;
export type ITriggerScheduleWorkflowErrorResponseDto = IApiErrorResponseDto;

export type ITriggerScheduleWorkflowEndpointResult =
  | { status: 201; body: ITriggerScheduleWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: ITriggerScheduleWorkflowErrorResponseDto };

export const triggerScheduleWorkflowResponseDataSchema = z.object({
  run: workflowRunVoSchema,
});

export const triggerScheduleWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  triggerScheduleWorkflowResponseDataSchema
);
export const triggerScheduleWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
