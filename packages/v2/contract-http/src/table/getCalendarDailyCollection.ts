import type { ICalendarDailyCollectionRo, ICalendarDailyCollectionVo } from '@teable/openapi';
import { calendarDailyCollectionRoSchema, calendarDailyCollectionVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getCalendarDailyCollectionInputSchema = z.object({
  tableId: z.string(),
  query: calendarDailyCollectionRoSchema,
});

export type IGetCalendarDailyCollectionRequestDto = {
  tableId: string;
  query: ICalendarDailyCollectionRo;
};

export interface IGetCalendarDailyCollectionResponseDataDto {
  calendarDailyCollection: ICalendarDailyCollectionVo;
}

export type IGetCalendarDailyCollectionResponseDto =
  IApiResponseDto<IGetCalendarDailyCollectionResponseDataDto>;
export type IGetCalendarDailyCollectionOkResponseDto =
  IApiOkResponseDto<IGetCalendarDailyCollectionResponseDataDto>;
export type IGetCalendarDailyCollectionErrorResponseDto = IApiErrorResponseDto;

export type IGetCalendarDailyCollectionEndpointResult =
  | { status: 200; body: IGetCalendarDailyCollectionOkResponseDto }
  | { status: HttpErrorStatus; body: IGetCalendarDailyCollectionErrorResponseDto };

export const getCalendarDailyCollectionResponseDataSchema = z.object({
  calendarDailyCollection: calendarDailyCollectionVoSchema,
});

export const getCalendarDailyCollectionOkResponseSchema = apiOkResponseDtoSchema(
  getCalendarDailyCollectionResponseDataSchema
);
export const getCalendarDailyCollectionErrorResponseSchema = apiErrorResponseDtoSchema;
