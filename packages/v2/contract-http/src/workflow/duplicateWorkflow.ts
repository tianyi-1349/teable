import {
  type IDuplicateWorkflowRo,
  type IWorkflowVo,
  duplicateWorkflowRoSchema,
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

export const duplicateWorkflowInputSchema = z
  .object({
    baseId: z.string(),
    workflowId: z.string(),
  })
  .merge(duplicateWorkflowRoSchema);

export type IDuplicateWorkflowRequestDto = z.input<typeof duplicateWorkflowInputSchema>;
export type IDuplicateWorkflowBodyDto = IDuplicateWorkflowRo;

export interface IDuplicateWorkflowResponseDataDto {
  workflow: IWorkflowVo;
}

export type IDuplicateWorkflowResponseDto = IApiResponseDto<IDuplicateWorkflowResponseDataDto>;
export type IDuplicateWorkflowOkResponseDto = IApiOkResponseDto<IDuplicateWorkflowResponseDataDto>;
export type IDuplicateWorkflowErrorResponseDto = IApiErrorResponseDto;

export type IDuplicateWorkflowEndpointResult =
  | { status: 201; body: IDuplicateWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: IDuplicateWorkflowErrorResponseDto };

export const duplicateWorkflowResponseDataSchema = z.object({
  workflow: workflowVoSchema,
});

export const duplicateWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  duplicateWorkflowResponseDataSchema
);
export const duplicateWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
