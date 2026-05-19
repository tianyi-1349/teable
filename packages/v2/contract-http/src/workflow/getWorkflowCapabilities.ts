import { type IWorkflowCapabilitiesVo, workflowCapabilitiesVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getWorkflowCapabilitiesInputSchema = z.object({
  baseId: z.string(),
});

export type IGetWorkflowCapabilitiesRequestDto = z.input<typeof getWorkflowCapabilitiesInputSchema>;

export interface IGetWorkflowCapabilitiesResponseDataDto {
  capabilities: IWorkflowCapabilitiesVo;
}

export type IGetWorkflowCapabilitiesResponseDto =
  IApiResponseDto<IGetWorkflowCapabilitiesResponseDataDto>;
export type IGetWorkflowCapabilitiesOkResponseDto =
  IApiOkResponseDto<IGetWorkflowCapabilitiesResponseDataDto>;
export type IGetWorkflowCapabilitiesErrorResponseDto = IApiErrorResponseDto;

export type IGetWorkflowCapabilitiesEndpointResult =
  | { status: 200; body: IGetWorkflowCapabilitiesOkResponseDto }
  | { status: HttpErrorStatus; body: IGetWorkflowCapabilitiesErrorResponseDto };

export const getWorkflowCapabilitiesResponseDataSchema = z.object({
  capabilities: workflowCapabilitiesVoSchema,
});

export const getWorkflowCapabilitiesOkResponseSchema = apiOkResponseDtoSchema(
  getWorkflowCapabilitiesResponseDataSchema
);
export const getWorkflowCapabilitiesErrorResponseSchema = apiErrorResponseDtoSchema;
