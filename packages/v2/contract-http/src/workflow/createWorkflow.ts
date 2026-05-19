import { type IWorkflowVo, workflowRoSchema, workflowVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const createWorkflowInputSchema = z
  .object({
    baseId: z.string(),
  })
  .merge(workflowRoSchema);

export type ICreateWorkflowRequestDto = z.input<typeof createWorkflowInputSchema>;

export interface ICreateWorkflowResponseDataDto {
  workflow: IWorkflowVo;
}

export type ICreateWorkflowResponseDto = IApiResponseDto<ICreateWorkflowResponseDataDto>;
export type ICreateWorkflowOkResponseDto = IApiOkResponseDto<ICreateWorkflowResponseDataDto>;
export type ICreateWorkflowErrorResponseDto = IApiErrorResponseDto;

export type ICreateWorkflowEndpointResult =
  | { status: 201; body: ICreateWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: ICreateWorkflowErrorResponseDto };

export const createWorkflowResponseDataSchema = z.object({
  workflow: workflowVoSchema,
});

export const createWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  createWorkflowResponseDataSchema
);
export const createWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
