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

export const applyUpdateWorkflowInputSchema = z.object({
  baseId: z.string(),
  workflowId: z.string(),
});

export type IApplyUpdateWorkflowRequestDto = z.input<typeof applyUpdateWorkflowInputSchema>;

export interface IApplyUpdateWorkflowResponseDataDto {
  workflow: IWorkflowVo;
}

export type IApplyUpdateWorkflowResponseDto = IApiResponseDto<IApplyUpdateWorkflowResponseDataDto>;
export type IApplyUpdateWorkflowOkResponseDto =
  IApiOkResponseDto<IApplyUpdateWorkflowResponseDataDto>;
export type IApplyUpdateWorkflowErrorResponseDto = IApiErrorResponseDto;

export type IApplyUpdateWorkflowEndpointResult =
  | { status: 200; body: IApplyUpdateWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: IApplyUpdateWorkflowErrorResponseDto };

export const applyUpdateWorkflowResponseDataSchema = z.object({
  workflow: workflowVoSchema,
});

export const applyUpdateWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  applyUpdateWorkflowResponseDataSchema
);
export const applyUpdateWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
