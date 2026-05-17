import { type IWorkflowRunVo, testRunWorkflowRoSchema, workflowRunVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const testRunWorkflowInputSchema = z
  .object({
    baseId: z.string(),
    workflowId: z.string(),
  })
  .merge(testRunWorkflowRoSchema);

export type ITestRunWorkflowRequestDto = z.input<typeof testRunWorkflowInputSchema>;

export interface ITestRunWorkflowResponseDataDto {
  run: IWorkflowRunVo;
}

export type ITestRunWorkflowResponseDto = IApiResponseDto<ITestRunWorkflowResponseDataDto>;
export type ITestRunWorkflowOkResponseDto = IApiOkResponseDto<ITestRunWorkflowResponseDataDto>;
export type ITestRunWorkflowErrorResponseDto = IApiErrorResponseDto;

export type ITestRunWorkflowEndpointResult =
  | { status: 201; body: ITestRunWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: ITestRunWorkflowErrorResponseDto };

export const testRunWorkflowResponseDataSchema = z.object({
  run: workflowRunVoSchema,
});

export const testRunWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  testRunWorkflowResponseDataSchema
);
export const testRunWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
