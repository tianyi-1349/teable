import {
  type IGroupPointsVo,
  groupPointsVoSchema,
  shareViewGroupPointsRoSchema,
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

export const getShareViewGroupPointsInputSchema = z.object({
  shareId: z.string(),
  query: shareViewGroupPointsRoSchema.optional(),
});

export type IGetShareViewGroupPointsRequestDto = z.input<typeof getShareViewGroupPointsInputSchema>;

export interface IGetShareViewGroupPointsResponseDataDto {
  groupPoints: IGroupPointsVo;
}

export type IGetShareViewGroupPointsResponseDto =
  IApiResponseDto<IGetShareViewGroupPointsResponseDataDto>;
export type IGetShareViewGroupPointsOkResponseDto =
  IApiOkResponseDto<IGetShareViewGroupPointsResponseDataDto>;
export type IGetShareViewGroupPointsErrorResponseDto = IApiErrorResponseDto;

export type IGetShareViewGroupPointsEndpointResult =
  | { status: 200; body: IGetShareViewGroupPointsOkResponseDto }
  | { status: HttpErrorStatus; body: IGetShareViewGroupPointsErrorResponseDto };

export const getShareViewGroupPointsResponseDataSchema = z.object({
  groupPoints: groupPointsVoSchema,
});

export const getShareViewGroupPointsOkResponseSchema = apiOkResponseDtoSchema(
  getShareViewGroupPointsResponseDataSchema
);
export const getShareViewGroupPointsErrorResponseSchema = apiErrorResponseDtoSchema;
