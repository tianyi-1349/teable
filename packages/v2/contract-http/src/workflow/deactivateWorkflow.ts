import { type IWorkflowVo, workflowVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const deactivateWorkflowInputSchema = z.object({
  baseId: z.string(),
  workflowId: z.string(),
});

export type IDeactivateWorkflowRequestDto = z.input<typeof deactivateWorkflowInputSchema>;

export interface IDeactivateWorkflowResponseDataDto {
  workflow: IWorkflowVo;
}

export type IDeactivateWorkflowResponseDto = IApiResponseDto<IDeactivateWorkflowResponseDataDto>;
export type IDeactivateWorkflowOkResponseDto =
  IApiOkResponseDto<IDeactivateWorkflowResponseDataDto>;
export type IDeactivateWorkflowErrorResponseDto = IApiErrorResponseDto;

export type IDeactivateWorkflowEndpointResult =
  | { status: 200; body: IDeactivateWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: IDeactivateWorkflowErrorResponseDto };

export const deactivateWorkflowResponseDataSchema = z.object({
  workflow: workflowVoSchema,
});

export const deactivateWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  deactivateWorkflowResponseDataSchema
);
export const deactivateWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
