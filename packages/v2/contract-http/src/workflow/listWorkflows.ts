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

export const listWorkflowsInputSchema = z.object({
  baseId: z.string(),
});

export type IListWorkflowsRequestDto = z.input<typeof listWorkflowsInputSchema>;

export interface IListWorkflowsResponseDataDto {
  workflows: IWorkflowVo[];
}

export type IListWorkflowsResponseDto = IApiResponseDto<IListWorkflowsResponseDataDto>;
export type IListWorkflowsOkResponseDto = IApiOkResponseDto<IListWorkflowsResponseDataDto>;
export type IListWorkflowsErrorResponseDto = IApiErrorResponseDto;

export type IListWorkflowsEndpointResult =
  | { status: 200; body: IListWorkflowsOkResponseDto }
  | { status: HttpErrorStatus; body: IListWorkflowsErrorResponseDto };

export const listWorkflowsResponseDataSchema = z.object({
  workflows: z.array(workflowVoSchema),
});

export const listWorkflowsOkResponseSchema = apiOkResponseDtoSchema(
  listWorkflowsResponseDataSchema
);
export const listWorkflowsErrorResponseSchema = apiErrorResponseDtoSchema;
