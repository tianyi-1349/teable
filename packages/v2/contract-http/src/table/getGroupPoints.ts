import type { IGroupPointsRo, IGroupPointsVo } from '@teable/openapi';
import { groupPointsRoSchema, groupPointsVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getGroupPointsInputSchema = z.object({
  tableId: z.string(),
  query: groupPointsRoSchema.optional(),
});

export type IGetGroupPointsRequestDto = {
  tableId: string;
  query?: IGroupPointsRo;
};

export interface IGetGroupPointsResponseDataDto {
  groupPoints: IGroupPointsVo;
}

export type IGetGroupPointsResponseDto = IApiResponseDto<IGetGroupPointsResponseDataDto>;
export type IGetGroupPointsOkResponseDto = IApiOkResponseDto<IGetGroupPointsResponseDataDto>;
export type IGetGroupPointsErrorResponseDto = IApiErrorResponseDto;

export type IGetGroupPointsEndpointResult =
  | { status: 200; body: IGetGroupPointsOkResponseDto }
  | { status: HttpErrorStatus; body: IGetGroupPointsErrorResponseDto };

export const getGroupPointsResponseDataSchema = z.object({
  groupPoints: groupPointsVoSchema,
});

export const getGroupPointsOkResponseSchema = apiOkResponseDtoSchema(
  getGroupPointsResponseDataSchema
);
export const getGroupPointsErrorResponseSchema = apiErrorResponseDtoSchema;
