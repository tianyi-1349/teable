import type { IHandlerResolver } from '@teable/v2-contract-http';
import {
  createV2OrpcRouter,
  type IFeatureFlags,
  type IV1Adapter,
} from '@teable/v2-contract-http-implementation';
import { createV2OpenApiNodeHandler } from '@teable/v2-contract-http-openapi';
import type { IExecutionContext } from '@teable/v2-core';
import * as express from 'express';

export interface IV2ExpressRouterOptions {
  createContainer?: () => IHandlerResolver | Promise<IHandlerResolver>;
  createExecutionContext?: () => IExecutionContext | Promise<IExecutionContext>;
  featureFlags?: IFeatureFlags;
  v1Adapter?: IV1Adapter;
}

export const createV2ExpressRouter = (options: IV2ExpressRouterOptions = {}): express.Router => {
  const router = express.Router();
  const orpcRouter = createV2OrpcRouter({
    createContainer: options.createContainer,
    createExecutionContext: options.createExecutionContext,
    featureFlags: options.featureFlags,
    v1Adapter: options.v1Adapter,
  });
  const handler = createV2OpenApiNodeHandler(orpcRouter);

  router.use(async (req, res, next) => {
    const result = await handler.handle(req, res, { context: {} });
    if (result.matched) return;
    next();
  });

  return router;
};
