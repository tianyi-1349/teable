import {
  type ICalendarDailyCollectionVo,
  calendarDailyCollectionVoSchema,
  shareViewCalendarDailyCollectionRoSchema,
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

export const getShareViewCalendarDailyCollectionInputSchema = z.object({
  shareId: z.string(),
  query: shareViewCalendarDailyCollectionRoSchema,
});

export type IGetShareViewCalendarDailyCollectionRequestDto = z.input<
  typeof getShareViewCalendarDailyCollectionInputSchema
>;

export interface IGetShareViewCalendarDailyCollectionResponseDataDto {
  calendarDailyCollection: ICalendarDailyCollectionVo;
}

export type IGetShareViewCalendarDailyCollectionResponseDto =
  IApiResponseDto<IGetShareViewCalendarDailyCollectionResponseDataDto>;
export type IGetShareViewCalendarDailyCollectionOkResponseDto =
  IApiOkResponseDto<IGetShareViewCalendarDailyCollectionResponseDataDto>;
export type IGetShareViewCalendarDailyCollectionErrorResponseDto = IApiErrorResponseDto;

export type IGetShareViewCalendarDailyCollectionEndpointResult =
  | { status: 200; body: IGetShareViewCalendarDailyCollectionOkResponseDto }
  | { status: HttpErrorStatus; body: IGetShareViewCalendarDailyCollectionErrorResponseDto };

export const getShareViewCalendarDailyCollectionResponseDataSchema = z.object({
  calendarDailyCollection: calendarDailyCollectionVoSchema,
});

export const getShareViewCalendarDailyCollectionOkResponseSchema = apiOkResponseDtoSchema(
  getShareViewCalendarDailyCollectionResponseDataSchema
);
export const getShareViewCalendarDailyCollectionErrorResponseSchema = apiErrorResponseDtoSchema;
