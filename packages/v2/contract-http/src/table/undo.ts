import type { IUndoVo } from '@teable/openapi';
import { undoVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const undoInputSchema = z.object({
  tableId: z.string(),
  windowId: z.string().min(1),
});

export type IUndoRequestDto = z.input<typeof undoInputSchema>;

export interface IUndoResponseDataDto {
  undo: IUndoVo;
}

export type IUndoResponseDto = IApiResponseDto<IUndoResponseDataDto>;
export type IUndoOkResponseDto = IApiOkResponseDto<IUndoResponseDataDto>;
export type IUndoErrorResponseDto = IApiErrorResponseDto;

export type IUndoEndpointResult =
  | { status: 200; body: IUndoOkResponseDto }
  | { status: HttpErrorStatus; body: IUndoErrorResponseDto };

export const undoResponseDataSchema = z.object({
  undo: undoVoSchema,
});

export const undoOkResponseSchema = apiOkResponseDtoSchema(undoResponseDataSchema);
export const undoErrorResponseSchema = apiErrorResponseDtoSchema;
