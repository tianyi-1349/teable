import type { ICreateRecordsRo, IRecord, IUpdateRecordsRo } from '../record';

export type IAiRecordOperationRo =
  | {
      action: 'create';
      tableId: string;
      payload: ICreateRecordsRo & { aiContext?: unknown };
    }
  | {
      action: 'update';
      tableId: string;
      payload: IUpdateRecordsRo & { aiContext?: unknown };
    }
  | {
      action: 'delete';
      tableId: string;
      payload: {
        recordIds: string[];
        aiContext?: unknown;
      };
    };

export type IAiRecordOperationVo =
  | {
      action: 'create' | 'update';
      tableId: string;
      records: IRecord[];
    }
  | {
      action: 'delete';
      tableId: string;
      deletedRecordIds: string[];
    };
