import {
  aiCreateWorkflowDraftRoSchema,
  type IWorkflowDetailVo,
  workflowDetailVoSchema,
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

export const aiCreateDraftWorkflowInputSchema = z
  .object({
    baseId: z.string(),
  })
  .merge(aiCreateWorkflowDraftRoSchema);

export type IAiCreateDraftWorkflowRequestDto = z.input<typeof aiCreateDraftWorkflowInputSchema>;

export interface IAiCreateDraftWorkflowResponseDataDto {
  workflow: IWorkflowDetailVo;
}

export type IAiCreateDraftWorkflowResponseDto =
  IApiResponseDto<IAiCreateDraftWorkflowResponseDataDto>;
export type IAiCreateDraftWorkflowOkResponseDto =
  IApiOkResponseDto<IAiCreateDraftWorkflowResponseDataDto>;
export type IAiCreateDraftWorkflowErrorResponseDto = IApiErrorResponseDto;

export type IAiCreateDraftWorkflowEndpointResult =
  | { status: 201; body: IAiCreateDraftWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: IAiCreateDraftWorkflowErrorResponseDto };

export const aiCreateDraftWorkflowResponseDataSchema = z.object({
  workflow: workflowDetailVoSchema,
});

export const aiCreateDraftWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  aiCreateDraftWorkflowResponseDataSchema
);
export const aiCreateDraftWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
