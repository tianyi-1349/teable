import {
  type IShareViewCollaboratorsVo,
  shareViewCollaboratorsRoSchema,
  shareViewCollaboratorsVoSchema,
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

export const getShareViewCollaboratorsInputSchema = z.object({
  shareId: z.string(),
  query: shareViewCollaboratorsRoSchema.optional(),
});

export type IGetShareViewCollaboratorsRequestDto = z.input<
  typeof getShareViewCollaboratorsInputSchema
>;

export interface IGetShareViewCollaboratorsResponseDataDto {
  collaborators: IShareViewCollaboratorsVo;
}

export type IGetShareViewCollaboratorsResponseDto =
  IApiResponseDto<IGetShareViewCollaboratorsResponseDataDto>;
export type IGetShareViewCollaboratorsOkResponseDto =
  IApiOkResponseDto<IGetShareViewCollaboratorsResponseDataDto>;
export type IGetShareViewCollaboratorsErrorResponseDto = IApiErrorResponseDto;

export type IGetShareViewCollaboratorsEndpointResult =
  | { status: 200; body: IGetShareViewCollaboratorsOkResponseDto }
  | { status: HttpErrorStatus; body: IGetShareViewCollaboratorsErrorResponseDto };

export const getShareViewCollaboratorsResponseDataSchema = z.object({
  collaborators: shareViewCollaboratorsVoSchema,
});

export const getShareViewCollaboratorsOkResponseSchema = apiOkResponseDtoSchema(
  getShareViewCollaboratorsResponseDataSchema
);
export const getShareViewCollaboratorsErrorResponseSchema = apiErrorResponseDtoSchema;
