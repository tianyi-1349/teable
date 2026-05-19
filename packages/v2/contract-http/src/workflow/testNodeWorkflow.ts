import {
  type IWorkflowRunVo,
  testNodeWorkflowRoSchema,
  workflowRunVoSchema,
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

export const testNodeWorkflowInputSchema = z
  .object({
    baseId: z.string(),
    workflowId: z.string(),
  })
  .merge(testNodeWorkflowRoSchema);

export type ITestNodeWorkflowRequestDto = z.input<typeof testNodeWorkflowInputSchema>;

export interface ITestNodeWorkflowResponseDataDto {
  run: IWorkflowRunVo;
}

export type ITestNodeWorkflowResponseDto = IApiResponseDto<ITestNodeWorkflowResponseDataDto>;
export type ITestNodeWorkflowOkResponseDto = IApiOkResponseDto<ITestNodeWorkflowResponseDataDto>;
export type ITestNodeWorkflowErrorResponseDto = IApiErrorResponseDto;

export type ITestNodeWorkflowEndpointResult =
  | { status: 201; body: ITestNodeWorkflowOkResponseDto }
  | { status: HttpErrorStatus; body: ITestNodeWorkflowErrorResponseDto };

export const testNodeWorkflowResponseDataSchema = z.object({
  run: workflowRunVoSchema,
});

export const testNodeWorkflowOkResponseSchema = apiOkResponseDtoSchema(
  testNodeWorkflowResponseDataSchema
);
export const testNodeWorkflowErrorResponseSchema = apiErrorResponseDtoSchema;
