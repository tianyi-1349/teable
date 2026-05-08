import { FieldCreatedRealtimeProjection } from '@teable/v2-core/application/projections/FieldCreatedRealtimeProjection';
import { FieldDeletedRealtimeProjection } from '@teable/v2-core/application/projections/FieldDeletedRealtimeProjection';
import { FieldOptionsAddedRealtimeProjection } from '@teable/v2-core/application/projections/FieldOptionsAddedRealtimeProjection';
import { FieldUpdatedRealtimeProjection } from '@teable/v2-core/application/projections/FieldUpdatedRealtimeProjection';
import { RecordCreatedRealtimeProjection } from '@teable/v2-core/application/projections/RecordCreatedRealtimeProjection';
import { RecordReorderedRealtimeProjection } from '@teable/v2-core/application/projections/RecordReorderedRealtimeProjection';
import { RecordsBatchCreatedRealtimeProjection } from '@teable/v2-core/application/projections/RecordsBatchCreatedRealtimeProjection';
import { RecordsBatchUpdatedRealtimeProjection } from '@teable/v2-core/application/projections/RecordsBatchUpdatedRealtimeProjection';
import { RecordsDeletedRealtimeProjection } from '@teable/v2-core/application/projections/RecordsDeletedRealtimeProjection';
import { RecordUpdatedRealtimeProjection } from '@teable/v2-core/application/projections/RecordUpdatedRealtimeProjection';
import { TableCreatedRealtimeProjection } from '@teable/v2-core/application/projections/TableCreatedRealtimeProjection';
import { ViewColumnMetaUpdatedRealtimeProjection } from '@teable/v2-core/application/projections/ViewColumnMetaUpdatedRealtimeProjection';
import { v2CoreTokens } from '@teable/v2-core/ports/tokens';
import type { DependencyContainer } from '@teable/v2-di';
import { Lifecycle, container } from '@teable/v2-di';

import type { IShareDbOpPublisher } from '../ShareDbPublisher';
import { ShareDbRealtimeEngine } from '../ShareDbRealtimeEngine';
import { v2ShareDbTokens } from './tokens';

export interface IV2ShareDbRealtimeConfig {
  publisher: IShareDbOpPublisher;
}

export const registerV2ShareDbRealtime = (
  c: DependencyContainer = container,
  config: IV2ShareDbRealtimeConfig
): DependencyContainer => {
  if (!config.publisher) {
    throw new Error('Invalid v2 ShareDB realtime config');
  }

  c.registerInstance(v2ShareDbTokens.publisher, config.publisher);
  c.register(v2CoreTokens.realtimeEngine, ShareDbRealtimeEngine, {
    lifecycle: Lifecycle.Singleton,
  });
  const hasTableDeps =
    c.isRegistered(v2CoreTokens.tableRepository) && c.isRegistered(v2CoreTokens.tableMapper);
  if (!hasTableDeps) {
    throw new Error('ShareDB realtime requires tableRepository and tableMapper registrations');
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
  c.register(FieldUpdatedRealtimeProjection, FieldUpdatedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });
  c.register(ViewColumnMetaUpdatedRealtimeProjection, ViewColumnMetaUpdatedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });
  c.register(FieldOptionsAddedRealtimeProjection, FieldOptionsAddedRealtimeProjection, {
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
  c.register(RecordsBatchCreatedRealtimeProjection, RecordsBatchCreatedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });
  c.register(RecordsDeletedRealtimeProjection, RecordsDeletedRealtimeProjection, {
    lifecycle: Lifecycle.Singleton,
  });

  return c;
};
