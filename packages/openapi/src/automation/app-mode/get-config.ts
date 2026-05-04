import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { appModeConfigSchema, type IAppModeConfig } from './types';

export const GET_APP_MODE_CONFIG = '/base/{baseId}/app-mode/config';

export const GetAppModeConfigRoute: RouteConfig = registerRoute({
  method: 'get',
  path: GET_APP_MODE_CONFIG,
  description: 'Get app mode configuration for a base',
  request: {
    params: z.object({
      baseId: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Returns app mode configuration.',
      content: {
        'application/json': {
          schema: appModeConfigSchema,
        },
      },
    },
  },
  tags: ['app-mode'],
});

export const getAppModeConfig = async (baseId: string) => {
  return axios.get<IAppModeConfig>(urlBuilder(GET_APP_MODE_CONFIG, { baseId }));
};
