import { ORPCError, implement } from '@orpc/server';
import type { IExplainService } from '@teable/v2-command-explain';
import { v2CommandExplainTokens } from '@teable/v2-command-explain';
import type { IHandlerResolver } from '@teable/v2-contract-http';
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
import { executeGetTableByIdEndpoint } from './handlers/tables/getTableById';
import { executeImportCsvEndpoint } from './handlers/tables/importCsv';
import { executeImportRecordsEndpoint } from './handlers/tables/importRecords';
import { executeListTableRecordsEndpoint } from './handlers/tables/listTableRecords';
import { executeListTablesEndpoint } from './handlers/tables/listTables';
import { executePasteEndpoint } from './handlers/tables/paste';
import { executeRenameTableEndpoint } from './handlers/tables/renameTable';
import { executeReorderRecordsEndpoint } from './handlers/tables/reorderRecords';
import { executeRestoreTableEndpoint } from './handlers/tables/restoreTable';
import { executeSubmitRecordEndpoint } from './handlers/tables/submitRecord';
import { executeUpdateFieldEndpoint } from './handlers/tables/updateField';
import { executeUpdateRecordEndpoint } from './handlers/tables/updateRecord';
import { executeUpdateRecordsEndpoint } from './handlers/tables/updateRecords';

export interface IV2OrpcRouterOptions {
  createContainer?: () => IHandlerResolver | Promise<IHandlerResolver>;
  createExecutionContext?: () => IExecutionContext | Promise<IExecutionContext>;
}

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

  /**
   * Maps HTTP error response body to ORPCError with domain error info preserved.
   * Domain error code and tags are passed in the data property for extraction by the OpenAPI handler.
   */
  const throwDomainError = (
    orpcCode: 'BAD_REQUEST' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'INTERNAL_SERVER_ERROR',
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

  const throwHttpResultError = (
    status: number,
    errorBody: {
      message: string;
      code: string;
      tags: readonly string[];
      details?: Record<string, unknown>;
    }
  ): never => {
    switch (status) {
      case 400:
        return throwDomainError('BAD_REQUEST', errorBody);
      case 401:
        return throwDomainError('UNAUTHORIZED', errorBody);
      case 403:
        return throwDomainError('FORBIDDEN', errorBody);
      case 404:
        return throwDomainError('NOT_FOUND', errorBody);
      default:
        return throwDomainError('INTERNAL_SERVER_ERROR', errorBody);
    }
  };

  const unwrapOkResponse = <TData>(result: {
    status: number;
    body:
      | {
          ok: true;
          data: TData;
        }
      | {
          ok: false;
          error: {
            message: string;
            code: string;
            tags: readonly string[];
            details?: Record<string, unknown>;
          };
        };
  }) => {
    if (result.body.ok) {
      return result.body;
    }

    return throwHttpResultError(result.status, result.body.error);
  };

  const os = implement(v2Contract);

  const basesCreate = os.bases.create.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const basesList = os.bases.list.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesCreate = os.tables.create.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesCreateTables = os.tables.createTables.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesCreateField = os.tables.createField.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesDuplicateTable = os.tables.duplicateTable.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesUpdateField = os.tables.updateField.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesCreateRecord = os.tables.createRecord.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesSubmitRecord = os.tables.submitRecord.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesCreateRecords = os.tables.createRecords.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesUpdateRecord = os.tables.updateRecord.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesUpdateRecords = os.tables.updateRecords.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesReorderRecords = os.tables.reorderRecords.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesDuplicateRecord = os.tables.duplicateRecord.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesDuplicateField = os.tables.duplicateField.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesPaste = os.tables.paste.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesClear = os.tables.clear.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesDeleteByRange = os.tables.deleteByRange.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesDeleteRecords = os.tables.deleteRecords.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesDeleteField = os.tables.deleteField.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesGetById = os.tables.getById.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesGetRecord = os.tables.getRecord.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesDelete = os.tables.delete.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesRestore = os.tables.restore.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesList = os.tables.list.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesListRecords = os.tables.listRecords.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesRename = os.tables.rename.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesImportCsv = os.tables.importCsv.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesImportRecords = os.tables.importRecords.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesExplainCreateRecord = os.tables.explainCreateRecord.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesExplainCreateField = os.tables.explainCreateField.handler(async ({ input }) => {
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
    const result = await executeExplainCreateFieldEndpoint(executionContext, input, explainService);

    return unwrapOkResponse(result);
  });

  const tablesExplainUpdateField = os.tables.explainUpdateField.handler(async ({ input }) => {
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
    const result = await executeExplainUpdateFieldEndpoint(executionContext, input, explainService);

    return unwrapOkResponse(result);
  });

  const tablesExplainDeleteField = os.tables.explainDeleteField.handler(async ({ input }) => {
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
    const result = await executeExplainDeleteFieldEndpoint(executionContext, input, explainService);

    return unwrapOkResponse(result);
  });

  const tablesExplainDeleteTable = os.tables.explainDeleteTable.handler(async ({ input }) => {
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
    const result = await executeExplainDeleteTableEndpoint(executionContext, input, explainService);

    return unwrapOkResponse(result);
  });

  const tablesExplainUpdateRecord = os.tables.explainUpdateRecord.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

  const tablesExplainDeleteRecords = os.tables.explainDeleteRecords.handler(async ({ input }) => {
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

    return unwrapOkResponse(result);
  });

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
      getRecord: tablesGetRecord,
      importCsv: tablesImportCsv,
      importRecords: tablesImportRecords,
      list: tablesList,
      listRecords: tablesListRecords,
      rename: tablesRename,
      explainCreateRecord: tablesExplainCreateRecord,
      explainUpdateRecord: tablesExplainUpdateRecord,
      explainDeleteRecords: tablesExplainDeleteRecords,
    },
  });
};

export type V2OrpcRouter = ReturnType<typeof createV2OrpcRouter>;
