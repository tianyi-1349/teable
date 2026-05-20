import { type IOrganizationMeVo, organizationVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getOrganizationMeInputSchema = z.object({});

export type IGetOrganizationMeRequestDto = z.input<typeof getOrganizationMeInputSchema>;

export interface IGetOrganizationMeResponseDataDto {
  organization?: IOrganizationMeVo;
}

export type IGetOrganizationMeResponseDto = IApiResponseDto<IGetOrganizationMeResponseDataDto>;
export type IGetOrganizationMeOkResponseDto = IApiOkResponseDto<IGetOrganizationMeResponseDataDto>;
export type IGetOrganizationMeErrorResponseDto = IApiErrorResponseDto;

export type IGetOrganizationMeEndpointResult =
  | { status: 200; body: IGetOrganizationMeOkResponseDto }
  | { status: HttpErrorStatus; body: IGetOrganizationMeErrorResponseDto };

export const getOrganizationMeResponseDataSchema = z.object({
  organization: organizationVoSchema,
});

export const getOrganizationMeOkResponseSchema = apiOkResponseDtoSchema(
  getOrganizationMeResponseDataSchema
);
export const getOrganizationMeErrorResponseSchema = apiErrorResponseDtoSchema;
