import {
  type IUpdateWorkflowRo,
  type IWorkflowVo,
  updateWorkflowRoSchema,
  workflowVoSchema,
} from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const updateWorkflowInputSchema = z
  .object({
    baseId: z.string(),
    workflowId: z.string(),
  })
  .merge(updateWorkflowRoSchema);

export type IUpdateWorkflowRequestDto = z.input<typeof updateWorkflowInputSchema>;
export type IUpdateWorkflowBodyDto = IUpdateWorkflowRo;

export interface IUpdateWorkflowResponseDataDto {
  workflow: IWorkflowVo;
}

export type IUpdateWorkflowResponseDto = IApiResponseDto<IUpdateWorkflowResponseDataDto>;
export type IUpdateWorkflowOkResponseDto = IApiOkResponseDto<IUpdateWorkflowResponseDataDto>;
export type IUpdateWorkflowErrorResponseDto = IApiErrorResponseDto;

export type IUpdateWorkflowEndpointResult =
  | { status: 200; body: IUpdateWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: IUpdateWorkflowErrorResponseDto };

export const updateWorkflowResponseDataSchema = z.object({
  workflow: workflowVoSchema,
});

export const updateWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  updateWorkflowResponseDataSchema
);
export const updateWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
