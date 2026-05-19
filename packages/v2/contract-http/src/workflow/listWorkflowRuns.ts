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

export const listWorkflowRunsInputSchema = z.object({
  baseId: z.string(),
  workflowId: z.string(),
});

export type IListWorkflowRunsRequestDto = z.input<typeof listWorkflowRunsInputSchema>;

export interface IListWorkflowRunsResponseDataDto {
  runs: IWorkflowRunVo[];
}

export type IListWorkflowRunsResponseDto = IApiResponseDto<IListWorkflowRunsResponseDataDto>;
export type IListWorkflowRunsOkResponseDto = IApiOkResponseDto<IListWorkflowRunsResponseDataDto>;
export type IListWorkflowRunsErrorResponseDto = IApiErrorResponseDto;

export type IListWorkflowRunsEndpointResult =
  | { status: 200; body: IListWorkflowRunsOkResponseDto }
  | { status: HttpErrorStatus; body: IListWorkflowRunsErrorResponseDto };

export const listWorkflowRunsResponseDataSchema = z.object({
  runs: z.array(workflowRunVoSchema),
});

export const listWorkflowRunsOkResponseSchema = apiOkResponseDtoSchema(
  listWorkflowRunsResponseDataSchema
);
export const listWorkflowRunsErrorResponseSchema = apiErrorResponseDtoSchema;
