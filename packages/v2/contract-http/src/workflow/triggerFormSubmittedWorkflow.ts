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

export const triggerFormSubmittedWorkflowInputSchema = z.object({
  baseId: z.string(),
  workflowId: z.string(),
  body: z.unknown().optional(),
});

export type ITriggerFormSubmittedWorkflowRequestDto = z.input<
  typeof triggerFormSubmittedWorkflowInputSchema
>;

export interface ITriggerFormSubmittedWorkflowResponseDataDto {
  run: IWorkflowRunVo;
}

export type ITriggerFormSubmittedWorkflowResponseDto =
  IApiResponseDto<ITriggerFormSubmittedWorkflowResponseDataDto>;
export type ITriggerFormSubmittedWorkflowOkResponseDto =
  IApiOkResponseDto<ITriggerFormSubmittedWorkflowResponseDataDto>;
export type ITriggerFormSubmittedWorkflowErrorResponseDto = IApiErrorResponseDto;

export type ITriggerFormSubmittedWorkflowEndpointResult =
  | { status: 201; body: ITriggerFormSubmittedWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: ITriggerFormSubmittedWorkflowErrorResponseDto };

export const triggerFormSubmittedWorkflowResponseDataSchema = z.object({
  run: workflowRunVoSchema,
});

export const triggerFormSubmittedWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  triggerFormSubmittedWorkflowResponseDataSchema
);
export const triggerFormSubmittedWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
