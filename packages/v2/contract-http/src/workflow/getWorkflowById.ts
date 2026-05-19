import { type IWorkflowDetailVo, workflowDetailVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getWorkflowByIdInputSchema = z.object({
  baseId: z.string(),
  workflowId: z.string(),
});

export type IGetWorkflowByIdRequestDto = z.input<typeof getWorkflowByIdInputSchema>;

export interface IGetWorkflowByIdResponseDataDto {
  workflow: IWorkflowDetailVo;
}

export type IGetWorkflowByIdResponseDto = IApiResponseDto<IGetWorkflowByIdResponseDataDto>;
export type IGetWorkflowByIdOkResponseDto = IApiOkResponseDto<IGetWorkflowByIdResponseDataDto>;
export type IGetWorkflowByIdErrorResponseDto = IApiErrorResponseDto;

export type IGetWorkflowByIdEndpointResult =
  | { status: 200; body: IGetWorkflowByIdOkResponseDto }
  | { status: HttpErrorStatus; body: IGetWorkflowByIdErrorResponseDto };

export const getWorkflowByIdResponseDataSchema = z.object({
  workflow: workflowDetailVoSchema,
});

export const getWorkflowByIdOkResponseSchema = apiOkResponseDtoSchema(
  getWorkflowByIdResponseDataSchema
);
export const getWorkflowByIdErrorResponseSchema = apiErrorResponseDtoSchema;
