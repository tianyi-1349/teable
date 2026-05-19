import type { IRedoVo } from '@teable/openapi';
import { redoVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const redoInputSchema = z.object({
  tableId: z.string(),
  windowId: z.string().min(1),
});

export type IRedoRequestDto = z.input<typeof redoInputSchema>;

export interface IRedoResponseDataDto {
  redo: IRedoVo;
}

export type IRedoResponseDto = IApiResponseDto<IRedoResponseDataDto>;
export type IRedoOkResponseDto = IApiOkResponseDto<IRedoResponseDataDto>;
export type IRedoErrorResponseDto = IApiErrorResponseDto;

export type IRedoEndpointResult =
  | { status: 200; body: IRedoOkResponseDto }
  | { status: HttpErrorStatus; body: IRedoErrorResponseDto };

export const redoResponseDataSchema = z.object({
  redo: redoVoSchema,
});

export const redoOkResponseSchema = apiOkResponseDtoSchema(redoResponseDataSchema);
export const redoErrorResponseSchema = apiErrorResponseDtoSchema;
