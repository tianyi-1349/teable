import { FieldCreatedRealtimeProjection } from '@teable/v2-core/application/projections/FieldCreatedRealtimeProjection';
import { FieldDeletedRealtimeProjection } from '@teable/v2-core/application/projections/FieldDeletedRealtimeProjection';
import { RecordCreatedRealtimeProjection } from '@teable/v2-core/application/projections/RecordCreatedRealtimeProjection';
import { RecordReorderedRealtimeProjection } from '@teable/v2-core/application/projections/RecordReorderedRealtimeProjection';
import { RecordsBatchUpdatedRealtimeProjection } from '@teable/v2-core/application/projections/RecordsBatchUpdatedRealtimeProjection';
import { RecordsDeletedRealtimeProjection } from '@teable/v2-core/application/projections/RecordsDeletedRealtimeProjection';
import { RecordUpdatedRealtimeProjection } from '@teable/v2-core/application/projections/RecordUpdatedRealtimeProjection';
import { TableCreatedRealtimeProjection } from '@teable/v2-core/application/projections/TableCreatedRealtimeProjection';
import { ViewColumnMetaUpdatedRealtimeProjection } from '@teable/v2-core/application/projections/ViewColumnMetaUpdatedRealtimeProjection';
import type { ILogger } from '@teable/v2-core/ports/Logger';
import { v2CoreTokens } from '@teable/v2-core/ports/tokens';
import type { DependencyContainer } from '@teable/v2-di';
import { Lifecycle, container } from '@teable/v2-di';

import { BroadcastChannelRealtimeEngine } from '../BroadcastChannelRealtimeEngine';
import {
  broadcastChannelDefaults,
  getBroadcastChannelRealtimeHub,
} from '../BroadcastChannelRealtimeHub';
import { v2BroadcastChannelTokens } from './tokens';

export type IV2BroadcastChannelRealtimeConfig = {
  channelName?: string;
};

export const registerV2BroadcastChannelRealtime = (
  c: DependencyContainer = container,
  config: IV2BroadcastChannelRealtimeConfig = {}
): DependencyContainer => {
  const channelName = config.channelName ?? broadcastChannelDefaults.channelName;
  const logger = c.isRegistered(v2CoreTokens.logger)
    ? c.resolve<ILogger>(v2CoreTokens.logger)
    : undefined;
  const hubResult = getBroadcastChannelRealtimeHub(channelName, logger);
  if (hubResult.isErr()) {
    throw new Error(hubResult.error.message);
  }

  c.registerInstance(v2BroadcastChannelTokens.hub, hubResult.value);
  c.register(v2CoreTokens.realtimeEngine, BroadcastChannelRealtimeEngine, {
    lifecycle: Lifecycle.Singleton,
  });
  const hasTableDeps =
    c.isRegistered(v2CoreTokens.tableRepository) && c.isRegistered(v2CoreTokens.tableMapper);
  if (!hasTableDeps) {
    throw new Error(
      'BroadcastChannel realtime requires tableRepository and tableMapper registrations'
    );
  }
  c.register(TableCreatedRealtimeProjection, TableCreatedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });
  c.register(FieldCreatedRealtimeProjection, FieldCreatedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });
  c.register(FieldDeletedRealtimeProjection, FieldDeletedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });
  c.register(ViewColumnMetaUpdatedRealtimeProjection, ViewColumnMetaUpdatedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });

  // Record realtime projections
  c.register(RecordCreatedRealtimeProjection, RecordCreatedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });
  c.register(RecordUpdatedRealtimeProjection, RecordUpdatedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });
  c.register(RecordReorderedRealtimeProjection, RecordReorderedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });
  c.register(RecordsBatchUpdatedRealtimeProjection, RecordsBatchUpdatedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });
  c.register(RecordsDeletedRealtimeProjection, RecordsDeletedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });

  return c;
};
