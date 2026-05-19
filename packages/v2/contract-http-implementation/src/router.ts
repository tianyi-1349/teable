import { ORPCError, implement } from '@orpc/server';
import type { IExplainService } from '@teable/v2-command-explain';
import { v2CommandExplainTokens } from '@teable/v2-command-explain';
/* eslint-disable import/order */
import type {
  IExplainCreateFieldInput,
  IExplainCreateRecordInput,
  IExplainDeleteFieldInput,
  IExplainDeleteRecordsInput,
  IExplainDeleteTableInput,
  IExplainUpdateFieldInput,
  IExplainUpdateRecordInput,
  IHandlerResolver,
  IUpdateViewColumnMetaEndpointResult,
  IUpdateViewFilterEndpointResult,
  IUpdateViewGroupEndpointResult,
  IUpdateViewPropertyEndpointResult,
  IUpdateViewSortEndpointResult,
} from '@teable/v2-contract-http';
import { v2Contract } from '@teable/v2-contract-http';
import {
  ActorId,
  type ICommandBus,
  type IExecutionContext,
  type IQueryBus,
  v2CoreTokens,
} from '@teable/v2-core';

import { executeCreateBaseEndpoint } from './handlers/bases/createBase';
import { executeListBasesEndpoint } from './handlers/bases/listBases';
import { executeClearEndpoint } from './handlers/tables/clear';
import { executeCreateFieldEndpoint } from './handlers/tables/createField';
import { executeCreateRecordEndpoint } from './handlers/tables/createRecord';
import { executeCreateRecordsEndpoint } from './handlers/tables/createRecords';
import { executeCreateTableEndpoint } from './handlers/tables/createTable';
import { executeCreateTablesEndpoint } from './handlers/tables/createTables';
import { executeDeleteByRangeEndpoint } from './handlers/tables/deleteByRange';
import { executeDeleteFieldEndpoint } from './handlers/tables/deleteField';
import { executeDeleteRecordsEndpoint } from './handlers/tables/deleteRecords';
import { executeDeleteTableEndpoint } from './handlers/tables/deleteTable';
import { executeDuplicateFieldEndpoint } from './handlers/tables/duplicateField';
import { executeDuplicateRecordEndpoint } from './handlers/tables/duplicateRecord';
import { executeDuplicateTableEndpoint } from './handlers/tables/duplicateTable';
import {
  executeExplainCreateFieldEndpoint,
  executeExplainCreateRecordEndpoint,
  executeExplainDeleteFieldEndpoint,
  executeExplainDeleteTableEndpoint,
  executeExplainDeleteRecordsEndpoint,
  executeExplainUpdateFieldEndpoint,
  executeExplainUpdateRecordEndpoint,
} from './handlers/tables/explainCommand';
import { executeGetRecordByIdEndpoint } from './handlers/tables/getRecordById';
import { executeGetRecordIndexEndpoint } from './handlers/tables/getRecordIndex';
import { executeGetRowCountEndpoint } from './handlers/tables/getRowCount';
import { executeGetSearchCountEndpoint } from './handlers/tables/getSearchCount';
import { executeGetSearchIndexEndpoint } from './handlers/tables/getSearchIndex';
import { executeGetTableByIdEndpoint } from './handlers/tables/getTableById';
import { executeImportCsvEndpoint } from './handlers/tables/importCsv';
import { executeImportRecordsEndpoint } from './handlers/tables/importRecords';
import { executeListTableRecordsEndpoint } from './handlers/tables/listTableRecords';
import { executeListTablesEndpoint } from './handlers/tables/listTables';
import { executePasteEndpoint } from './handlers/tables/paste';
import { executeRedoEndpoint } from './handlers/tables/redo';
import { executeRenameTableEndpoint } from './handlers/tables/renameTable';
import { executeUndoEndpoint } from './handlers/tables/undo';
import { executeReorderRecordsEndpoint } from './handlers/tables/reorderRecords';
import { executeRestoreTableEndpoint } from './handlers/tables/restoreTable';
import { executeSubmitRecordEndpoint } from './handlers/tables/submitRecord';
import { executeUpdateFieldEndpoint } from './handlers/tables/updateField';
import { executeUpdateRecordEndpoint } from './handlers/tables/updateRecord';
import { executeUpdateRecordsEndpoint } from './handlers/tables/updateRecords';
import { executeGetViewByIdEndpoint } from './handlers/views/getViewById';
import { executeListViewsEndpoint } from './handlers/views/listViews';
import { executeUpdateViewColumnMetaCommandEndpoint } from './handlers/views/updateViewColumnMetaCommand';
import { executeUpdateViewDescriptionCommandEndpoint } from './handlers/views/updateViewDescriptionCommand';
import { executeUpdateViewFilterCommandEndpoint } from './handlers/views/updateViewFilterCommand';
import { executeUpdateViewGroupCommandEndpoint } from './handlers/views/updateViewGroupCommand';
import { executeUpdateViewLockedCommandEndpoint } from './handlers/views/updateViewLockedCommand';
import { executeUpdateViewNameCommandEndpoint } from './handlers/views/updateViewNameCommand';
import { executeUpdateViewOptionsCommandEndpoint } from './handlers/views/updateViewOptionsCommand';
import { executeUpdateViewOrderCommandEndpoint } from './handlers/views/updateViewOrderCommand';
import { executeUpdateViewShareMetaCommandEndpoint } from './handlers/views/updateViewShareMetaCommand';
import { executeUpdateViewSortCommandEndpoint } from './handlers/views/updateViewSortCommand';

export interface IV2OrpcRouterOptions {
  createContainer?: () => IHandlerResolver | Promise<IHandlerResolver>;
  createExecutionContext?: () => IExecutionContext | Promise<IExecutionContext>;
}

type OrpcHandlerOptions = { input: unknown };
type OrpcTypedHandlerOptions<TInput> = { input: TInput };
type ViewMutationEndpointResult =
  | IUpdateViewColumnMetaEndpointResult
  | IUpdateViewFilterEndpointResult
  | IUpdateViewGroupEndpointResult
  | IUpdateViewPropertyEndpointResult
  | IUpdateViewSortEndpointResult;

export const createV2OrpcRouter = (options: IV2OrpcRouterOptions = {}) => {
  let defaultContainerPromise: Promise<IHandlerResolver> | undefined;
  const createDefaultContainer = async (): Promise<IHandlerResolver> => {
    const { createV2NodePgContainer } = await import('@teable/v2-container-node');
    return createV2NodePgContainer();
  };
  const createContainer =
    options.createContainer ??
    (() => {
      if (!defaultContainerPromise) defaultContainerPromise = createDefaultContainer();
      return defaultContainerPromise;
    });
  const createExecutionContext =
    options.createExecutionContext ??
    (() => {
      const actorIdResult = ActorId.create('system');
      if (actorIdResult.isErr()) {
        throw new Error(actorIdResult.error.message);
      }
      return { actorId: actorIdResult.value };
    });

  const containerErrorMessage = 'Failed to create container';
  const executionContextErrorMessage = 'Failed to resolve execution context';

  const handleContainerError = (error: unknown): never => {
    let detail: string;
    if (error instanceof Error) {
      detail = error.message || error.stack || String(error);
    } else {
      detail = JSON.stringify(error, null, 2);
    }
    const message = `${containerErrorMessage}: ${detail}`;
    console.error(message, error);
    throw new ORPCError('INTERNAL_SERVER_ERROR', { message });
  };

  const resolveContainer = async (): Promise<IHandlerResolver> => {
    try {
      return await Promise.resolve(createContainer());
    } catch (error) {
      return handleContainerError(error);
    }
  };

  const createNestAdapterRequiredHandler = (message: string) => async (): Promise<never> => {
    throw new ORPCError('INTERNAL_SERVER_ERROR', { message });
  };

  /**
   * Maps HTTP error response body to ORPCError with domain error info preserved.
   * Domain error code and tags are passed in the data property for extraction by the OpenAPI handler.
   */
  const throwDomainError = (
    orpcCode: 'BAD_REQUEST' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR',
    errorBody: {
      message: string;
      code: string;
      tags: readonly string[];
      details?: Record<string, unknown>;
    }
  ): never => {
    throw new ORPCError(orpcCode, {
      message: errorBody.message,
      data: {
        domainCode: errorBody.code,
        domainTags: errorBody.tags,
        details: errorBody.details,
      },
    });
  };

  const os = implement(v2Contract) as ReturnType<typeof implement> & {
    bases: Record<
      string,
      { handler: (handler: (options: { input: unknown }) => Promise<unknown>) => unknown }
    >;
    comments: Record<
      string,
      { handler: (handler: (options: { input: unknown }) => Promise<unknown>) => unknown }
    >;
    publishedApps: Record<
      string,
      { handler: (handler: (options: { input: unknown }) => Promise<unknown>) => unknown }
    >;
    share: Record<
      string,
      { handler: (handler: (options: { input: unknown }) => Promise<unknown>) => unknown }
    >;
    settings: Record<
      string,
      { handler: (handler: (options: { input: unknown }) => Promise<unknown>) => unknown }
    >;
    templates: Record<
      string,
      { handler: (handler: (options: { input: unknown }) => Promise<unknown>) => unknown }
    >;
    workflows: Record<
      string,
      { handler: (handler: (options: { input: unknown }) => Promise<unknown>) => unknown }
    >;
    tables: Record<
      string,
      { handler: (handler: (options: { input: unknown }) => Promise<unknown>) => unknown }
    >;
    router: (router: unknown) => unknown;
  };

  const basesCreate = os.bases.create.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
    const result = await executeCreateBaseEndpoint(executionContext, input, commandBus);

    if (result.status === 201) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const basesList = os.bases.list.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const queryBus = container.resolve<IQueryBus>(v2CoreTokens.queryBus);
    const result = await executeListBasesEndpoint(executionContext, input, queryBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesCreate = os.tables.create.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
    const result = await executeCreateTableEndpoint(executionContext, input, commandBus);

    if (result.status === 201) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesCreateTables = os.tables.createTables.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeCreateTablesEndpoint(executionContext, input, commandBus);

      if (result.status === 201) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesCreateField = os.tables.createField.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
    const result = await executeCreateFieldEndpoint(executionContext, input, commandBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesDuplicateTable = os.tables.duplicateTable.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeDuplicateTableEndpoint(executionContext, input, commandBus);

      if (result.status === 201) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesUpdateField = os.tables.updateField.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
    const result = await executeUpdateFieldEndpoint(executionContext, input, commandBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesCreateRecord = os.tables.createRecord.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeCreateRecordEndpoint(executionContext, input, commandBus);

      if (result.status === 201) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesSubmitRecord = os.tables.submitRecord.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeSubmitRecordEndpoint(executionContext, input, commandBus);

      if (result.status === 201) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesCreateRecords = os.tables.createRecords.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeCreateRecordsEndpoint(executionContext, input, commandBus);

      if (result.status === 201) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesUpdateRecord = os.tables.updateRecord.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeUpdateRecordEndpoint(executionContext, input, commandBus);

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesUpdateRecords = os.tables.updateRecords.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeUpdateRecordsEndpoint(executionContext, input, commandBus);

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesReorderRecords = os.tables.reorderRecords.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeReorderRecordsEndpoint(executionContext, input, commandBus);

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const viewsReorderRecords = os.views.reorderRecords.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeReorderRecordsEndpoint(executionContext, input, commandBus);

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const viewsList = os.views.list.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const queryBus = container.resolve<IQueryBus>(v2CoreTokens.queryBus);
    const result = await executeListViewsEndpoint(executionContext, input, queryBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const viewsGetById = os.views.getById.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const queryBus = container.resolve<IQueryBus>(v2CoreTokens.queryBus);
    const result = await executeGetViewByIdEndpoint(executionContext, input, queryBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const executeViewMutation = async <TResult extends ViewMutationEndpointResult>(
    input: unknown,
    executor: (
      executionContext: IExecutionContext,
      input: unknown,
      commandBus: ICommandBus
    ) => Promise<TResult>
  ) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
    const result = await executor(executionContext, input, commandBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  };

  const viewsUpdateName = os.views.updateName.handler(async ({ input }: OrpcHandlerOptions) =>
    executeViewMutation(input, executeUpdateViewNameCommandEndpoint)
  );

  const viewsUpdateDescription = os.views.updateDescription.handler(
    async ({ input }: OrpcHandlerOptions) =>
      executeViewMutation(input, executeUpdateViewDescriptionCommandEndpoint)
  );

  const viewsUpdateLocked = os.views.updateLocked.handler(async ({ input }: OrpcHandlerOptions) =>
    executeViewMutation(input, executeUpdateViewLockedCommandEndpoint)
  );

  const viewsUpdateShareMeta = os.views.updateShareMeta.handler(
    async ({ input }: OrpcHandlerOptions) =>
      executeViewMutation(input, executeUpdateViewShareMetaCommandEndpoint)
  );

  const viewsUpdateOptions = os.views.updateOptions.handler(async ({ input }: OrpcHandlerOptions) =>
    executeViewMutation(input, executeUpdateViewOptionsCommandEndpoint)
  );

  const viewsUpdateOrder = os.views.updateOrder.handler(async ({ input }: OrpcHandlerOptions) =>
    executeViewMutation(input, executeUpdateViewOrderCommandEndpoint)
  );

  const viewsUpdateFilter = os.views.updateFilter.handler(async ({ input }: OrpcHandlerOptions) =>
    executeViewMutation(input, executeUpdateViewFilterCommandEndpoint)
  );

  const viewsUpdateSort = os.views.updateSort.handler(async ({ input }: OrpcHandlerOptions) =>
    executeViewMutation(input, executeUpdateViewSortCommandEndpoint)
  );

  const viewsUpdateGroup = os.views.updateGroup.handler(async ({ input }: OrpcHandlerOptions) =>
    executeViewMutation(input, executeUpdateViewGroupCommandEndpoint)
  );

  const viewsUpdateColumnMeta = os.views.updateColumnMeta.handler(
    async ({ input }: OrpcHandlerOptions) =>
      executeViewMutation(input, executeUpdateViewColumnMetaCommandEndpoint)
  );

  const commentAdapterMessage =
    'Comment endpoints in generic v2 router require a Nest backend adapter';

  const commentsList = os.comments.list.handler(
    createNestAdapterRequiredHandler(commentAdapterMessage)
  );
  const commentsGetRecordCount = os.comments.getRecordCount.handler(
    createNestAdapterRequiredHandler(commentAdapterMessage)
  );
  const commentsGetSubscribeDetail = os.comments.getSubscribeDetail.handler(
    createNestAdapterRequiredHandler(commentAdapterMessage)
  );
  const commentsSubscribe = os.comments.subscribe.handler(
    createNestAdapterRequiredHandler(commentAdapterMessage)
  );
  const commentsUnsubscribe = os.comments.unsubscribe.handler(
    createNestAdapterRequiredHandler(commentAdapterMessage)
  );
  const commentsGetTableCount = os.comments.getTableCount.handler(
    createNestAdapterRequiredHandler(commentAdapterMessage)
  );
  const commentsGetById = os.comments.getById.handler(
    createNestAdapterRequiredHandler(commentAdapterMessage)
  );

  const shareAdapterMessage = 'Share endpoints in generic v2 router require a Nest backend adapter';

  const publishedAppAdapterMessage =
    'Published app endpoints in generic v2 router require a Nest backend adapter';

  const shareGetView = os.share.getView.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );
  const shareGetViewAggregations = os.share.getViewAggregations.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );
  const shareGetViewGroupPoints = os.share.getViewGroupPoints.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );
  const shareGetViewCalendarDailyCollection = os.share.getViewCalendarDailyCollection.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );
  const shareGetViewLinkRecords = os.share.getViewLinkRecords.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );
  const shareGetViewCollaborators = os.share.getViewCollaborators.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );
  const shareGetViewRowCount = os.share.getViewRowCount.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );
  const shareGetViewRecords = os.share.getViewRecords.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );
  const shareGetViewSearchCount = os.share.getViewSearchCount.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );
  const shareGetViewSearchIndex = os.share.getViewSearchIndex.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );
  const shareButtonClickView = os.share.buttonClickView.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );
  const shareCopyView = os.share.copyView.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );
  const shareFormSubmitView = os.share.formSubmitView.handler(
    createNestAdapterRequiredHandler(shareAdapterMessage)
  );

  const publishedAppsGetRuntimeManifest = os.publishedApps.getRuntimeManifest.handler(
    createNestAdapterRequiredHandler(publishedAppAdapterMessage)
  );
  const publishedAppsGetNavigationModel = os.publishedApps.getNavigationModel.handler(
    createNestAdapterRequiredHandler(publishedAppAdapterMessage)
  );
  const publishedAppsGetNodeRuntime = os.publishedApps.getNodeRuntime.handler(
    createNestAdapterRequiredHandler(publishedAppAdapterMessage)
  );

  const templateAdapterMessage =
    'Template endpoints in generic v2 router require a Nest backend adapter';

  const settingAdapterMessage =
    'Setting endpoints in generic v2 router require a Nest backend adapter';

  const settingsGet = os.settings.get.handler(
    createNestAdapterRequiredHandler(settingAdapterMessage)
  );
  const settingsGetPublic = os.settings.getPublic.handler(
    createNestAdapterRequiredHandler(settingAdapterMessage)
  );
  const templatesListPublished = os.templates.listPublished.handler(
    createNestAdapterRequiredHandler(templateAdapterMessage)
  );
  const templatesGetById = os.templates.getById.handler(
    createNestAdapterRequiredHandler(templateAdapterMessage)
  );
  const templatesGetPermalink = os.templates.getPermalink.handler(
    createNestAdapterRequiredHandler(templateAdapterMessage)
  );
  const templatesIncrementVisit = os.templates.incrementVisit.handler(
    createNestAdapterRequiredHandler(templateAdapterMessage)
  );

  const workflowAdapterMessage =
    'Workflow endpoints in generic v2 router require a Nest backend adapter';

  const workflowsActivate = os.workflows.activate.handler(
    createNestAdapterRequiredHandler(workflowAdapterMessage)
  );
  const workflowsCreate = os.workflows.create.handler(
    createNestAdapterRequiredHandler(workflowAdapterMessage)
  );
  const workflowsDeactivate = os.workflows.deactivate.handler(
    createNestAdapterRequiredHandler(workflowAdapterMessage)
  );
  const workflowsList = os.workflows.list.handler(
    createNestAdapterRequiredHandler(workflowAdapterMessage)
  );
  const workflowsUpdate = os.workflows.update.handler(
    createNestAdapterRequiredHandler(workflowAdapterMessage)
  );
  const workflowsDelete = os.workflows.delete.handler(
    createNestAdapterRequiredHandler(workflowAdapterMessage)
  );
  const workflowsDuplicate = os.workflows.duplicate.handler(
    createNestAdapterRequiredHandler(workflowAdapterMessage)
  );
  const workflowsGetById = os.workflows.getById.handler(
    createNestAdapterRequiredHandler(workflowAdapterMessage)
  );
  const workflowsGetCapabilities = os.workflows.getCapabilities.handler(
    createNestAdapterRequiredHandler(workflowAdapterMessage)
  );
  const workflowsListRuns = os.workflows.listRuns.handler(
    createNestAdapterRequiredHandler(workflowAdapterMessage)
  );
  const workflowsGetRun = os.workflows.getRun.handler(
    createNestAdapterRequiredHandler(workflowAdapterMessage)
  );
  const workflowsTestRun = os.workflows.testRun.handler(
    createNestAdapterRequiredHandler(workflowAdapterMessage)
  );

  const tablesGetRowCount = os.tables.getRowCount.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();
    const getRowCount = container.resolve<(tableId: string, query?: unknown) => Promise<unknown>>(
      Symbol.for('v2.tables.getRowCount') as never
    );
    const result = await executeGetRowCountEndpoint(input, getRowCount as never);

    if (result.status === 200) return result.body;
    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }
    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesGetRecordIndex = os.tables.getRecordIndex.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();
      const getRecordIndex = container.resolve<
        (tableId: string, query: unknown) => Promise<unknown>
      >(Symbol.for('v2.tables.getRecordIndex') as never);
      const result = await executeGetRecordIndexEndpoint(input, getRecordIndex as never);

      if (result.status === 200) return result.body;
      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }
      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesGetSearchCount = os.tables.getSearchCount.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();
      const getSearchCount = container.resolve<
        (tableId: string, query: unknown) => Promise<unknown>
      >(Symbol.for('v2.tables.getSearchCount') as never);
      const result = await executeGetSearchCountEndpoint(input, getSearchCount as never);

      if (result.status === 200) return result.body;
      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }
      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesGetSearchIndex = os.tables.getSearchIndex.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();
      const getSearchIndex = container.resolve<
        (tableId: string, query: unknown) => Promise<unknown>
      >(Symbol.for('v2.tables.getSearchIndex') as never);
      const result = await executeGetSearchIndexEndpoint(input, getSearchIndex as never);

      if (result.status === 200) return result.body;
      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }
      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesUndo = os.tables.undo.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();
    const undo = container.resolve<(tableId: string, windowId: string) => Promise<unknown>>(
      Symbol.for('v2.tables.undo') as never
    );
    const result = await executeUndoEndpoint(input, undo as never);

    if (result.status === 200) return result.body;
    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }
    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesRedo = os.tables.redo.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();
    const redo = container.resolve<(tableId: string, windowId: string) => Promise<unknown>>(
      Symbol.for('v2.tables.redo') as never
    );
    const result = await executeRedoEndpoint(input, redo as never);

    if (result.status === 200) return result.body;
    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }
    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesDuplicateRecord = os.tables.duplicateRecord.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeDuplicateRecordEndpoint(executionContext, input, commandBus);

      if (result.status === 201) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesDuplicateField = os.tables.duplicateField.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeDuplicateFieldEndpoint(executionContext, input, commandBus);

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesPaste = os.tables.paste.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
    const result = await executePasteEndpoint(executionContext, input, commandBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesClear = os.tables.clear.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
    const result = await executeClearEndpoint(executionContext, input, commandBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesDeleteByRange = os.tables.deleteByRange.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeDeleteByRangeEndpoint(executionContext, input, commandBus);

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesDeleteRecords = os.tables.deleteRecords.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeDeleteRecordsEndpoint(executionContext, input, commandBus);

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesDeleteField = os.tables.deleteField.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
    const result = await executeDeleteFieldEndpoint(executionContext, input, commandBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    if (result.status === 403) {
      throwDomainError('FORBIDDEN', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesGetById = os.tables.getById.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const queryBus = container.resolve<IQueryBus>(v2CoreTokens.queryBus);
    const result = await executeGetTableByIdEndpoint(executionContext, input, queryBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesGetRecord = os.tables.getRecord.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const queryBus = container.resolve<IQueryBus>(v2CoreTokens.queryBus);
    const result = await executeGetRecordByIdEndpoint(executionContext, input, queryBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesDelete = os.tables.delete.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
    const result = await executeDeleteTableEndpoint(executionContext, input, commandBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesRestore = os.tables.restore.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
    const result = await executeRestoreTableEndpoint(executionContext, input, commandBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesList = os.tables.list.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const queryBus = container.resolve<IQueryBus>(v2CoreTokens.queryBus);
    const result = await executeListTablesEndpoint(executionContext, input, queryBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesListRecords = os.tables.listRecords.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const queryBus = container.resolve<IQueryBus>(v2CoreTokens.queryBus);
    const result = await executeListTableRecordsEndpoint(executionContext, input, queryBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesRename = os.tables.rename.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
    const result = await executeRenameTableEndpoint(executionContext, input, commandBus);

    if (result.status === 200) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesImportCsv = os.tables.importCsv.handler(async ({ input }: OrpcHandlerOptions) => {
    const container = await resolveContainer();

    let executionContext: IExecutionContext;
    try {
      executionContext = await createExecutionContext();
    } catch {
      throw new ORPCError('INTERNAL_SERVER_ERROR', {
        message: executionContextErrorMessage,
      });
    }

    const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
    const result = await executeImportCsvEndpoint(executionContext, input, commandBus);

    if (result.status === 201) return result.body;

    if (result.status === 400) {
      throwDomainError('BAD_REQUEST', result.body.error);
    }

    if (result.status === 404) {
      throwDomainError('NOT_FOUND', result.body.error);
    }

    throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
  });

  const tablesImportRecords = os.tables.importRecords.handler(
    async ({ input }: OrpcHandlerOptions) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
      const result = await executeImportRecordsEndpoint(executionContext, input, commandBus);

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesExplainCreateRecord = os.tables.explainCreateRecord.handler(
    async ({ input }: OrpcTypedHandlerOptions<IExplainCreateRecordInput>) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const explainService = container.resolve<IExplainService>(
        v2CommandExplainTokens.explainService
      );
      const result = await executeExplainCreateRecordEndpoint(
        executionContext,
        input,
        explainService
      );

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesExplainCreateField = os.tables.explainCreateField.handler(
    async ({ input }: OrpcTypedHandlerOptions<IExplainCreateFieldInput>) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const explainService = container.resolve<IExplainService>(
        v2CommandExplainTokens.explainService
      );
      const result = await executeExplainCreateFieldEndpoint(
        executionContext,
        input,
        explainService
      );

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesExplainUpdateField = os.tables.explainUpdateField.handler(
    async ({ input }: OrpcTypedHandlerOptions<IExplainUpdateFieldInput>) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const explainService = container.resolve<IExplainService>(
        v2CommandExplainTokens.explainService
      );
      const result = await executeExplainUpdateFieldEndpoint(
        executionContext,
        input,
        explainService
      );

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesExplainDeleteField = os.tables.explainDeleteField.handler(
    async ({ input }: OrpcTypedHandlerOptions<IExplainDeleteFieldInput>) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const explainService = container.resolve<IExplainService>(
        v2CommandExplainTokens.explainService
      );
      const result = await executeExplainDeleteFieldEndpoint(
        executionContext,
        input,
        explainService
      );

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesExplainDeleteTable = os.tables.explainDeleteTable.handler(
    async ({ input }: OrpcTypedHandlerOptions<IExplainDeleteTableInput>) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const explainService = container.resolve<IExplainService>(
        v2CommandExplainTokens.explainService
      );
      const result = await executeExplainDeleteTableEndpoint(
        executionContext,
        input,
        explainService
      );

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesExplainUpdateRecord = os.tables.explainUpdateRecord.handler(
    async ({ input }: OrpcTypedHandlerOptions<IExplainUpdateRecordInput>) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const explainService = container.resolve<IExplainService>(
        v2CommandExplainTokens.explainService
      );
      const result = await executeExplainUpdateRecordEndpoint(
        executionContext,
        input,
        explainService
      );

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  const tablesExplainDeleteRecords = os.tables.explainDeleteRecords.handler(
    async ({ input }: OrpcTypedHandlerOptions<IExplainDeleteRecordsInput>) => {
      const container = await resolveContainer();

      let executionContext: IExecutionContext;
      try {
        executionContext = await createExecutionContext();
      } catch {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: executionContextErrorMessage,
        });
      }

      const explainService = container.resolve<IExplainService>(
        v2CommandExplainTokens.explainService
      );
      const result = await executeExplainDeleteRecordsEndpoint(
        executionContext,
        input,
        explainService
      );

      if (result.status === 200) return result.body;

      if (result.status === 400) {
        throwDomainError('BAD_REQUEST', result.body.error);
      }

      if (result.status === 404) {
        throwDomainError('NOT_FOUND', result.body.error);
      }

      throwDomainError('INTERNAL_SERVER_ERROR', result.body.error);
    }
  );

  return os.router({
    bases: {
      create: basesCreate,
      list: basesList,
    },
    tables: {
      create: tablesCreate,
      createTables: tablesCreateTables,
      duplicateTable: tablesDuplicateTable,
      createField: tablesCreateField,
      updateField: tablesUpdateField,
      explainCreateField: tablesExplainCreateField,
      explainUpdateField: tablesExplainUpdateField,
      createRecord: tablesCreateRecord,
      submitRecord: tablesSubmitRecord,
      createRecords: tablesCreateRecords,
      updateRecord: tablesUpdateRecord,
      updateRecords: tablesUpdateRecords,
      reorderRecords: tablesReorderRecords,
      duplicateField: tablesDuplicateField,
      duplicateRecord: tablesDuplicateRecord,
      paste: tablesPaste,
      clear: tablesClear,
      deleteByRange: tablesDeleteByRange,
      deleteRecords: tablesDeleteRecords,
      deleteField: tablesDeleteField,
      explainDeleteField: tablesExplainDeleteField,
      explainDeleteTable: tablesExplainDeleteTable,
      delete: tablesDelete,
      restore: tablesRestore,
      getById: tablesGetById,
      getRowCount: tablesGetRowCount,
      getRecordIndex: tablesGetRecordIndex,
      getRecord: tablesGetRecord,
      getSearchCount: tablesGetSearchCount,
      getSearchIndex: tablesGetSearchIndex,
      importCsv: tablesImportCsv,
      importRecords: tablesImportRecords,
      list: tablesList,
      listRecords: tablesListRecords,
      rename: tablesRename,
      undo: tablesUndo,
      redo: tablesRedo,
      explainCreateRecord: tablesExplainCreateRecord,
      explainUpdateRecord: tablesExplainUpdateRecord,
      explainDeleteRecords: tablesExplainDeleteRecords,
    },
    views: {
      list: viewsList,
      getById: viewsGetById,
      updateName: viewsUpdateName,
      updateDescription: viewsUpdateDescription,
      updateLocked: viewsUpdateLocked,
      updateShareMeta: viewsUpdateShareMeta,
      updateOptions: viewsUpdateOptions,
      updateOrder: viewsUpdateOrder,
      updateFilter: viewsUpdateFilter,
      updateSort: viewsUpdateSort,
      updateGroup: viewsUpdateGroup,
      updateColumnMeta: viewsUpdateColumnMeta,
      reorderRecords: viewsReorderRecords,
    },
    comments: {
      getSubscribeDetail: commentsGetSubscribeDetail,
      subscribe: commentsSubscribe,
      unsubscribe: commentsUnsubscribe,
      getRecordCount: commentsGetRecordCount,
      getTableCount: commentsGetTableCount,
      list: commentsList,
      getById: commentsGetById,
    },
    publishedApps: {
      getNavigationModel: publishedAppsGetNavigationModel,
      getNodeRuntime: publishedAppsGetNodeRuntime,
      getRuntimeManifest: publishedAppsGetRuntimeManifest,
    },
    share: {
      buttonClickView: shareButtonClickView,
      copyView: shareCopyView,
      formSubmitView: shareFormSubmitView,
      getViewAggregations: shareGetViewAggregations,
      getView: shareGetView,
      getViewGroupPoints: shareGetViewGroupPoints,
      getViewCalendarDailyCollection: shareGetViewCalendarDailyCollection,
      getViewLinkRecords: shareGetViewLinkRecords,
      getViewCollaborators: shareGetViewCollaborators,
      getViewRowCount: shareGetViewRowCount,
      getViewRecords: shareGetViewRecords,
      getViewSearchCount: shareGetViewSearchCount,
      getViewSearchIndex: shareGetViewSearchIndex,
    },
    settings: {
      get: settingsGet,
      getPublic: settingsGetPublic,
    },
    templates: {
      getById: templatesGetById,
      getPermalink: templatesGetPermalink,
      incrementVisit: templatesIncrementVisit,
      listPublished: templatesListPublished,
    },
    workflows: {
      activate: workflowsActivate,
      create: workflowsCreate,
      deactivate: workflowsDeactivate,
      list: workflowsList,
      update: workflowsUpdate,
      delete: workflowsDelete,
      duplicate: workflowsDuplicate,
      getById: workflowsGetById,
      getCapabilities: workflowsGetCapabilities,
      listRuns: workflowsListRuns,
      getRun: workflowsGetRun,
      testRun: workflowsTestRun,
    },
  });
};

export type V2OrpcRouter = ReturnType<typeof createV2OrpcRouter>;
