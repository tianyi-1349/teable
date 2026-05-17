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

export const activateWorkflowInputSchema = z.object({
  baseId: z.string(),
  workflowId: z.string(),
});

export type IActivateWorkflowRequestDto = z.input<typeof activateWorkflowInputSchema>;

export interface IActivateWorkflowResponseDataDto {
  workflow: IWorkflowVo;
}

export type IActivateWorkflowResponseDto = IApiResponseDto<IActivateWorkflowResponseDataDto>;
export type IActivateWorkflowOkResponseDto = IApiOkResponseDto<IActivateWorkflowResponseDataDto>;
export type IActivateWorkflowErrorResponseDto = IApiErrorResponseDto;

export type IActivateWorkflowEndpointResult =
  | { status: 200; body: IActivateWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: IActivateWorkflowErrorResponseDto };

export const activateWorkflowResponseDataSchema = z.object({
  workflow: workflowVoSchema,
});

export const activateWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  activateWorkflowResponseDataSchema
);
export const activateWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
