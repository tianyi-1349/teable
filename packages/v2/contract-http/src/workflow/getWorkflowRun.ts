import { type IWorkflowRunDetailVo, workflowRunDetailVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getWorkflowRunInputSchema = z.object({
  baseId: z.string(),
  workflowId: z.string(),
  runId: z.string(),
});

export type IGetWorkflowRunRequestDto = z.input<typeof getWorkflowRunInputSchema>;

export interface IGetWorkflowRunResponseDataDto {
  run: IWorkflowRunDetailVo;
}

export type IGetWorkflowRunResponseDto = IApiResponseDto<IGetWorkflowRunResponseDataDto>;
export type IGetWorkflowRunOkResponseDto = IApiOkResponseDto<IGetWorkflowRunResponseDataDto>;
export type IGetWorkflowRunErrorResponseDto = IApiErrorResponseDto;

export type IGetWorkflowRunEndpointResult =
  | { status: 200; body: IGetWorkflowRunOkResponseDto }
  | { status: HttpErrorStatus; body: IGetWorkflowRunErrorResponseDto };

export const getWorkflowRunResponseDataSchema = z.object({
  run: workflowRunDetailVoSchema,
});

export const getWorkflowRunOkResponseSchema = apiOkResponseDtoSchema(
  getWorkflowRunResponseDataSchema
);
export const getWorkflowRunErrorResponseSchema = apiErrorResponseDtoSchema;
