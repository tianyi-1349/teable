import type { ITaskStatusCollectionVo } from '@teable/openapi';
import { taskStatusCollectionVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getTaskStatusCollectionInputSchema = z.object({
  tableId: z.string(),
});

export type IGetTaskStatusCollectionRequestDto = {
  tableId: string;
};

export interface IGetTaskStatusCollectionResponseDataDto {
  taskStatusCollection: ITaskStatusCollectionVo;
}

export type IGetTaskStatusCollectionResponseDto =
  IApiResponseDto<IGetTaskStatusCollectionResponseDataDto>;
export type IGetTaskStatusCollectionOkResponseDto =
  IApiOkResponseDto<IGetTaskStatusCollectionResponseDataDto>;
export type IGetTaskStatusCollectionErrorResponseDto = IApiErrorResponseDto;

export type IGetTaskStatusCollectionEndpointResult =
  | { status: 200; body: IGetTaskStatusCollectionOkResponseDto }
  | { status: HttpErrorStatus; body: IGetTaskStatusCollectionErrorResponseDto };

export const getTaskStatusCollectionResponseDataSchema = z.object({
  taskStatusCollection: taskStatusCollectionVoSchema,
});

export const getTaskStatusCollectionOkResponseSchema = apiOkResponseDtoSchema(
  getTaskStatusCollectionResponseDataSchema
);
export const getTaskStatusCollectionErrorResponseSchema = apiErrorResponseDtoSchema;
