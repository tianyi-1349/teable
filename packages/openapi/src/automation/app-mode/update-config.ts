import type { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { axios } from '../../axios';
import { registerRoute, urlBuilder } from '../../utils';
import { z } from '../../zod';
import { appModeConfigSchema, type IAppModeConfig } from './types';

export const UPDATE_APP_MODE_CONFIG = '/base/{baseId}/app-mode/config';

export const UpdateAppModeConfigRoute: RouteConfig = registerRoute({
  method: 'put',
  path: UPDATE_APP_MODE_CONFIG,
  description: 'Update app mode configuration for a base',
  request: {
    params: z.object({
      baseId: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: appModeConfigSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Returns latest app mode configuration.',
      content: {
        'application/json': {
          schema: appModeConfigSchema,
        },
      },
    },
  },
  tags: ['app-mode'],
});

export const updateAppModeConfig = async (baseId: string, config: IAppModeConfig) => {
  return axios.put<IAppModeConfig>(urlBuilder(UPDATE_APP_MODE_CONFIG, { baseId }), config);
};
