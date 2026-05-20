/* eslint-disable import/order */
import { oc } from '@orpc/contract';
import type { AnyContractRouter } from '@orpc/contract';
import {
  createBaseInputSchema,
  createFieldInputSchema,
  createRecordInputSchema,
  createRecordsInputSchema,
  submitRecordInputSchema,
  createTableInputSchema,
  createTablesInputSchema,
  deleteByRangeCommandInputSchema,
  deleteFieldInputSchema,
  deleteRecordsInputSchema,
  deleteTableInputSchema,
  duplicateFieldInputSchema,
  duplicateRecordInputSchema,
  duplicateTableInputSchema,
  getRecordByIdInputSchema,
  getTableByIdInputSchema,
  importCsvInputSchema,
  importRecordsInputSchema,
  listBasesInputSchema,
  listTableRecordsInputSchema,
  listTablesInputSchema,
  pasteCommandInputSchema,
  clearCommandInputSchema,
  renameTableInputSchema,
  restoreTableInputSchema,
  updateFieldInputSchema,
  updateRecordInputSchema,
  updateRecordsInputSchema,
  reorderRecordsInputSchema,
} from '@teable/v2-core';

import { createBaseOkResponseSchema } from './base/createBase';
import { listBasesOkResponseSchema } from './base/listBases';
import {
  commentSubscribeInputSchema,
  commentSubscribeMutationOkResponseSchema,
  getCommentSubscribeOkResponseSchema,
} from './comment/commentSubscribe';
import {
  getCommentByIdInputSchema,
  getCommentByIdOkResponseSchema,
} from './comment/getCommentById';
import {
  getCommentRecordCountInputSchema,
  getCommentRecordCountOkResponseSchema,
  getCommentTableCountInputSchema,
  getCommentTableCountOkResponseSchema,
} from './comment/getCommentCounts';
import { listCommentsInputSchema, listCommentsOkResponseSchema } from './comment/listComments';
import {
  getDepartmentListInputSchema,
  getDepartmentListOkResponseSchema,
} from './organization/getDepartmentList';
import {
  getDepartmentUsersInputSchema,
  getDepartmentUsersOkResponseSchema,
} from './organization/getDepartmentUsers';
import {
  getOrganizationMeInputSchema,
  getOrganizationMeOkResponseSchema,
} from './organization/getOrganizationMe';
import {
  getPublishedAppNavigationModelInputSchema,
  getPublishedAppNavigationModelOkResponseSchema,
} from './published-app/getNavigationModel';
import {
  getPublishedAppNodeRuntimeInputSchema,
  getPublishedAppNodeRuntimeOkResponseSchema,
} from './published-app/getNodeRuntime';
import {
  getPublishedAppRuntimeManifestInputSchema,
  getPublishedAppRuntimeManifestOkResponseSchema,
} from './published-app/getRuntimeManifest';
import {
  getPublicSettingInputSchema,
  getPublicSettingOkResponseSchema,
} from './setting/getPublicSetting';
import { getSettingInputSchema, getSettingOkResponseSchema } from './setting/getSetting';
import {
  buttonClickShareViewInputSchema,
  buttonClickShareViewOkResponseSchema,
} from './share/buttonClickShareView';
import { copyShareViewInputSchema, copyShareViewOkResponseSchema } from './share/copyShareView';
import {
  formSubmitShareViewInputSchema,
  formSubmitShareViewOkResponseSchema,
} from './share/formSubmitShareView';
import { getShareViewInputSchema, getShareViewOkResponseSchema } from './share/getShareView';
import {
  getShareViewAggregationsInputSchema,
  getShareViewAggregationsOkResponseSchema,
} from './share/getShareViewAggregations';
import {
  getShareViewCalendarDailyCollectionInputSchema,
  getShareViewCalendarDailyCollectionOkResponseSchema,
} from './share/getShareViewCalendarDailyCollection';
import {
  getShareViewCollaboratorsInputSchema,
  getShareViewCollaboratorsOkResponseSchema,
} from './share/getShareViewCollaborators';
import {
  getShareViewGroupPointsInputSchema,
  getShareViewGroupPointsOkResponseSchema,
} from './share/getShareViewGroupPoints';
import {
  getShareViewLinkRecordsInputSchema,
  getShareViewLinkRecordsOkResponseSchema,
} from './share/getShareViewLinkRecords';
import {
  getShareViewRecordsInputSchema,
  getShareViewRecordsOkResponseSchema,
} from './share/getShareViewRecords';
import {
  getShareViewRowCountInputSchema,
  getShareViewRowCountOkResponseSchema,
} from './share/getShareViewRowCount';
import { clearOkResponseSchema } from './table/clear';
import { getAggregationInputSchema, getAggregationOkResponseSchema } from './table/getAggregation';
import {
  getCalendarDailyCollectionInputSchema,
  getCalendarDailyCollectionOkResponseSchema,
} from './table/getCalendarDailyCollection';
import { createFieldOkResponseSchema } from './table/createField';
import { createRecordOkResponseSchema } from './table/createRecord';
import { createRecordsOkResponseSchema } from './table/createRecords';
import { createTableErrorResponseSchema, createTableOkResponseSchema } from './table/createTable';
import { createTablesOkResponseSchema } from './table/createTables';
import { deleteByRangeOkResponseSchema } from './table/deleteByRange';
import { deleteFieldOkResponseSchema } from './table/deleteField';
import { deleteRecordsOkResponseSchema } from './table/deleteRecords';
import { deleteTableErrorResponseSchema, deleteTableOkResponseSchema } from './table/deleteTable';
import { duplicateFieldOkResponseSchema } from './table/duplicateField';
import { duplicateRecordOkResponseSchema } from './table/duplicateRecord';
import { duplicateTableOkResponseSchema } from './table/duplicateTable';
import {
  explainCreateFieldInputSchema,
  explainCreateRecordInputSchema,
  explainDeleteFieldInputSchema,
  explainDeleteTableInputSchema,
  explainDeleteRecordsInputSchema,
  explainOkResponseSchema,
  explainUpdateFieldInputSchema,
  explainUpdateRecordInputSchema,
} from './table/explainCommand';
import { getRecordByIdOkResponseSchema } from './table/getRecordById';
import { getRecordIndexInputSchema, getRecordIndexOkResponseSchema } from './table/getRecordIndex';
import { getGroupPointsInputSchema, getGroupPointsOkResponseSchema } from './table/getGroupPoints';
import { getRowCountInputSchema, getRowCountOkResponseSchema } from './table/getRowCount';
import { getSearchCountInputSchema, getSearchCountOkResponseSchema } from './table/getSearchCount';
import { getSearchIndexInputSchema, getSearchIndexOkResponseSchema } from './table/getSearchIndex';
import {
  getTaskStatusCollectionInputSchema,
  getTaskStatusCollectionOkResponseSchema,
} from './table/getTaskStatusCollection';
import { getTableByIdOkResponseSchema } from './table/getTableById';
import { importCsvOkResponseSchema } from './table/importCsv';
import { importRecordsOkResponseSchema } from './table/importRecords';
import { listTableRecordsOkResponseSchema } from './table/listTableRecords';
import { listTablesOkResponseSchema } from './table/listTables';
import { pasteOkResponseSchema } from './table/paste';
import { redoInputSchema, redoOkResponseSchema } from './table/redo';
import { renameTableOkResponseSchema } from './table/renameTable';
import { reorderRecordsOkResponseSchema } from './table/reorderRecords';
import { restoreTableOkResponseSchema } from './table/restoreTable';
import { submitRecordOkResponseSchema } from './table/submitRecord';
import { undoInputSchema, undoOkResponseSchema } from './table/undo';
import { updateFieldOkResponseSchema } from './table/updateField';
import { updateRecordOkResponseSchema } from './table/updateRecord';
import { updateRecordsOkResponseSchema } from './table/updateRecords';
import { getViewByIdInputSchema, getViewByIdOkResponseSchema } from './view/getViewById';
import {
  activateWorkflowInputSchema,
  activateWorkflowOkResponseSchema,
} from './workflow/activateWorkflow';
import {
  aiCreateDraftWorkflowInputSchema,
  aiCreateDraftWorkflowOkResponseSchema,
} from './workflow/aiCreateDraftWorkflow';
import {
  createWorkflowInputSchema,
  createWorkflowOkResponseSchema,
} from './workflow/createWorkflow';
import {
  applyUpdateWorkflowInputSchema,
  applyUpdateWorkflowOkResponseSchema,
} from './workflow/applyUpdateWorkflow';
import {
  deactivateWorkflowInputSchema,
  deactivateWorkflowOkResponseSchema,
} from './workflow/deactivateWorkflow';
import {
  deleteWorkflowInputSchema,
  deleteWorkflowOkResponseSchema,
} from './workflow/deleteWorkflow';
import {
  duplicateWorkflowInputSchema,
  duplicateWorkflowOkResponseSchema,
} from './workflow/duplicateWorkflow';
import {
  getWorkflowByIdInputSchema,
  getWorkflowByIdOkResponseSchema,
} from './workflow/getWorkflowById';
import { listViewsOkResponseSchema } from './view/listViews';
import {
  getWorkflowCapabilitiesInputSchema,
  getWorkflowCapabilitiesOkResponseSchema,
} from './workflow/getWorkflowCapabilities';
import {
  getWorkflowRunInputSchema,
  getWorkflowRunOkResponseSchema,
} from './workflow/getWorkflowRun';
import { listWorkflowsInputSchema, listWorkflowsOkResponseSchema } from './workflow/listWorkflows';
import {
  listWorkflowRunsInputSchema,
  listWorkflowRunsOkResponseSchema,
} from './workflow/listWorkflowRuns';
import {
  testNodeWorkflowInputSchema,
  testNodeWorkflowOkResponseSchema,
} from './workflow/testNodeWorkflow';
import {
  testRunWorkflowInputSchema,
  testRunWorkflowOkResponseSchema,
} from './workflow/testRunWorkflow';
import {
  triggerEmailReceivedWorkflowInputSchema,
  triggerEmailReceivedWorkflowOkResponseSchema,
} from './workflow/triggerEmailReceivedWorkflow';
import {
  triggerFormSubmittedWorkflowInputSchema,
  triggerFormSubmittedWorkflowOkResponseSchema,
} from './workflow/triggerFormSubmittedWorkflow';
import {
  triggerScheduleWorkflowInputSchema,
  triggerScheduleWorkflowOkResponseSchema,
} from './workflow/triggerScheduleWorkflow';
import {
  triggerWebhookWorkflowInputSchema,
  triggerWebhookWorkflowOkResponseSchema,
} from './workflow/triggerWebhookWorkflow';
import {
  updateWorkflowInputSchema,
  updateWorkflowOkResponseSchema,
} from './workflow/updateWorkflow';
import {
  getShareViewSearchCountInputSchema,
  getShareViewSearchCountOkResponseSchema,
} from './share/getShareViewSearchCount';
import {
  getShareViewSearchIndexInputSchema,
  getShareViewSearchIndexOkResponseSchema,
} from './share/getShareViewSearchIndex';
import {
  getTemplateByIdInputSchema,
  getTemplateByIdOkResponseSchema,
} from './template/getTemplateById';
import {
  getTemplatePermalinkInputSchema,
  getTemplatePermalinkOkResponseSchema,
} from './template/getTemplatePermalink';
import {
  incrementTemplateVisitInputSchema,
  incrementTemplateVisitOkResponseSchema,
} from './template/incrementTemplateVisit';
import {
  listPublishedTemplatesInputSchema,
  listPublishedTemplatesOkResponseSchema,
} from './template/listPublishedTemplates';
import { updateViewFilterInputSchema, updateViewFilterOkResponseSchema } from './view/updateFilter';
import { updateViewSortInputSchema, updateViewSortOkResponseSchema } from './view/updateSort';
import { updateViewGroupInputSchema, updateViewGroupOkResponseSchema } from './view/updateGroup';
import {
  updateViewDescriptionInputSchema,
  updateViewLockedInputSchema,
  updateViewNameInputSchema,
  updateViewOptionsInputSchema,
  updateViewOrderInputSchema,
  updateViewPropertyOkResponseSchema,
  updateViewShareMetaInputSchema,
} from './view/updateProperties';
import {
  updateViewColumnMetaInputSchema,
  updateViewColumnMetaOkResponseSchema,
} from './view/updateColumnMeta';

const BASES_CREATE_PATH = '/bases/create';
const BASES_LIST_PATH = '/bases/list';
const TABLES_CREATE_FIELD_PATH = '/tables/createField';
const TABLES_CREATE_PATH = '/tables/create';
const TABLES_CREATE_TABLES_PATH = '/tables/createTables';
const TABLES_CREATE_RECORD_PATH = '/tables/createRecord';
const TABLES_SUBMIT_RECORD_PATH = '/tables/submitRecord';
const TABLES_CREATE_RECORDS_PATH = '/tables/createRecords';
const TABLES_DELETE_RECORDS_PATH = '/tables/deleteRecords';
const TABLES_DELETE_FIELD_PATH = '/tables/deleteField';
const TABLES_DELETE_PATH = '/tables/delete';
const PUBLISHED_APPS_TAG = 'published-apps';
const TABLES_EXPLAIN_CREATE_FIELD_PATH = '/tables/explainCreateField';
const TABLES_EXPLAIN_CREATE_RECORD_PATH = '/tables/explainCreateRecord';
const TABLES_EXPLAIN_UPDATE_FIELD_PATH = '/tables/explainUpdateField';
const TABLES_EXPLAIN_UPDATE_RECORD_PATH = '/tables/explainUpdateRecord';
const TABLES_EXPLAIN_DELETE_FIELD_PATH = '/tables/explainDeleteField';
const TABLES_EXPLAIN_DELETE_TABLE_PATH = '/tables/explainDeleteTable';
const TABLES_EXPLAIN_DELETE_RECORDS_PATH = '/tables/explainDeleteRecords';
const TABLES_GET_PATH = '/tables/get';
const TABLES_GET_RECORD_PATH = '/tables/getRecord';
const TABLES_IMPORT_CSV_PATH = '/tables/importCsv';
const TABLES_IMPORT_RECORDS_PATH = '/tables/importRecords';
const TABLES_LIST_RECORDS_PATH = '/tables/listRecords';
const TABLES_LIST_PATH = '/tables/list';
const TABLES_PASTE_PATH = '/tables/paste';
const TABLES_CLEAR_PATH = '/tables/clear';
const TABLES_DELETE_BY_RANGE_PATH = '/tables/deleteByRange';
const TABLES_RENAME_PATH = '/tables/rename';
const TABLES_RESTORE_PATH = '/tables/restore';
const TABLES_UPDATE_FIELD_PATH = '/tables/updateField';
const TABLES_UPDATE_RECORD_PATH = '/tables/updateRecord';
const TABLES_UPDATE_RECORDS_PATH = '/tables/updateRecords';
const TABLES_REORDER_RECORDS_PATH = '/tables/reorderRecords';
const TABLES_DUPLICATE_FIELD_PATH = '/tables/duplicateField';
const TABLES_DUPLICATE_RECORD_PATH = '/tables/duplicateRecord';
const TABLES_DUPLICATE_TABLE_PATH = '/tables/duplicateTable';
const TABLES_GET_ROW_COUNT_PATH = '/tables/getRowCount';
const TABLES_GET_RECORD_INDEX_PATH = '/tables/getRecordIndex';
const TABLES_GET_SEARCH_COUNT_PATH = '/tables/getSearchCount';
const TABLES_GET_SEARCH_INDEX_PATH = '/tables/getSearchIndex';
const TABLES_GET_AGGREGATION_PATH = '/tables/getAggregation';
const TABLES_GET_GROUP_POINTS_PATH = '/tables/getGroupPoints';
const TABLES_GET_CALENDAR_DAILY_COLLECTION_PATH = '/tables/getCalendarDailyCollection';
const TABLES_GET_TASK_STATUS_COLLECTION_PATH = '/tables/getTaskStatusCollection';
const TABLES_UNDO_PATH = '/tables/undo';
const TABLES_REDO_PATH = '/tables/redo';
const VIEWS_GET_BY_ID_PATH = '/views/getById';
const VIEWS_LIST_PATH = '/views/list';
const VIEWS_UPDATE_NAME_PATH = '/views/updateName';
const VIEWS_UPDATE_DESCRIPTION_PATH = '/views/updateDescription';
const VIEWS_UPDATE_LOCKED_PATH = '/views/updateLocked';
const VIEWS_UPDATE_SHARE_META_PATH = '/views/updateShareMeta';
const VIEWS_UPDATE_OPTIONS_PATH = '/views/updateOptions';
const VIEWS_UPDATE_ORDER_PATH = '/views/updateOrder';
const VIEWS_UPDATE_FILTER_PATH = '/views/updateFilter';
const VIEWS_UPDATE_SORT_PATH = '/views/updateSort';
const VIEWS_UPDATE_GROUP_PATH = '/views/updateGroup';
const VIEWS_REORDER_RECORDS_PATH = '/views/reorderRecords';
const VIEWS_UPDATE_COLUMN_META_PATH = '/views/updateColumnMeta';
const COMMENTS_GET_BY_ID_PATH = '/comments/getById';
const COMMENTS_LIST_PATH = '/comments/list';
const COMMENTS_GET_RECORD_COUNT_PATH = '/comments/getRecordCount';
const COMMENTS_GET_TABLE_COUNT_PATH = '/comments/getTableCount';
const COMMENTS_GET_SUBSCRIBE_PATH = '/comments/getSubscribeDetail';
const COMMENTS_SUBSCRIBE_PATH = '/comments/subscribe';
const COMMENTS_UNSUBSCRIBE_PATH = '/comments/unsubscribe';
const ORGANIZATION_GET_ME_PATH = '/organization/getMe';
const ORGANIZATION_GET_DEPARTMENT_USERS_PATH = '/organization/getDepartmentUsers';
const ORGANIZATION_GET_DEPARTMENT_LIST_PATH = '/organization/getDepartmentList';
const PUBLISHED_APPS_GET_NAVIGATION_MODEL_PATH = '/publishedApps/getNavigationModel';
const PUBLISHED_APPS_GET_NODE_RUNTIME_PATH = '/publishedApps/getNodeRuntime';
const PUBLISHED_APPS_GET_RUNTIME_MANIFEST_PATH = '/publishedApps/getRuntimeManifest';
const SHARE_BUTTON_CLICK_VIEW_PATH = '/share/buttonClickView';
const SHARE_COPY_VIEW_PATH = '/share/copyView';
const SHARE_FORM_SUBMIT_VIEW_PATH = '/share/formSubmitView';
const SHARE_GET_VIEW_PATH = '/share/getView';
const SHARE_GET_VIEW_AGGREGATIONS_PATH = '/share/getViewAggregations';
const SHARE_GET_VIEW_CALENDAR_DAILY_COLLECTION_PATH = '/share/getViewCalendarDailyCollection';
const SHARE_GET_VIEW_COLLABORATORS_PATH = '/share/getViewCollaborators';
const SHARE_GET_VIEW_GROUP_POINTS_PATH = '/share/getViewGroupPoints';
const SHARE_GET_VIEW_LINK_RECORDS_PATH = '/share/getViewLinkRecords';
const SHARE_GET_VIEW_ROW_COUNT_PATH = '/share/getViewRowCount';
const SHARE_GET_VIEW_RECORDS_PATH = '/share/getViewRecords';
const SHARE_GET_VIEW_SEARCH_COUNT_PATH = '/share/getViewSearchCount';
const SHARE_GET_VIEW_SEARCH_INDEX_PATH = '/share/getViewSearchIndex';
const SETTINGS_GET_PATH = '/settings/get';
const SETTINGS_GET_PUBLIC_PATH = '/settings/getPublic';
const TEMPLATES_GET_BY_ID_PATH = '/templates/getById';
const TEMPLATES_GET_PERMALINK_PATH = '/templates/getPermalink';
const TEMPLATES_INCREMENT_VISIT_PATH = '/templates/incrementVisit';
const TEMPLATES_LIST_PUBLISHED_PATH = '/templates/listPublished';
const WORKFLOWS_ACTIVATE_PATH = '/workflows/activate';
const WORKFLOWS_AI_CREATE_DRAFT_PATH = '/workflows/aiCreateDraft';
const WORKFLOWS_APPLY_UPDATE_PATH = '/workflows/applyUpdate';
const WORKFLOWS_LIST_PATH = '/workflows/list';
const WORKFLOWS_CREATE_PATH = '/workflows/create';
const WORKFLOWS_DEACTIVATE_PATH = '/workflows/deactivate';
const WORKFLOWS_UPDATE_PATH = '/workflows/update';
const WORKFLOWS_DELETE_PATH = '/workflows/delete';
const WORKFLOWS_DUPLICATE_PATH = '/workflows/duplicate';
const WORKFLOWS_GET_BY_ID_PATH = '/workflows/getById';
const WORKFLOWS_GET_CAPABILITIES_PATH = '/workflows/getCapabilities';
const WORKFLOWS_LIST_RUNS_PATH = '/workflows/listRuns';
const WORKFLOWS_GET_RUN_PATH = '/workflows/getRun';
const WORKFLOWS_TRIGGER_WEBHOOK_PATH = '/workflows/triggerWebhook';
const WORKFLOWS_TRIGGER_SCHEDULE_PATH = '/workflows/triggerSchedule';
const WORKFLOWS_TRIGGER_FORM_SUBMITTED_PATH = '/workflows/triggerFormSubmitted';
const WORKFLOWS_TRIGGER_EMAIL_RECEIVED_PATH = '/workflows/triggerEmailReceived';
const WORKFLOWS_TEST_RUN_PATH = '/workflows/testRun';

const v2ContractDefinition = {
  bases: {
    create: oc
      .route({
        method: 'POST',
        path: BASES_CREATE_PATH,
        successStatus: 201,
        summary: 'Create base',
        tags: ['bases'],
      })
      .input(createBaseInputSchema)
      .output(createBaseOkResponseSchema),
    list: oc
      .route({
        method: 'GET',
        path: BASES_LIST_PATH,
        successStatus: 200,
        summary: 'List bases',
        tags: ['bases'],
      })
      .input(listBasesInputSchema)
      .output(listBasesOkResponseSchema),
  },
  tables: {
    create: oc
      .route({
        method: 'POST',
        path: TABLES_CREATE_PATH,
        successStatus: 201,
        summary: 'Create table',
        tags: ['tables'],
      })
      .input(createTableInputSchema)
      .output(createTableOkResponseSchema),
    createTables: oc
      .route({
        method: 'POST',
        path: TABLES_CREATE_TABLES_PATH,
        successStatus: 201,
        summary: 'Create tables',
        tags: ['tables'],
      })
      .input(createTablesInputSchema)
      .output(createTablesOkResponseSchema),
    createField: oc
      .route({
        method: 'POST',
        path: TABLES_CREATE_FIELD_PATH,
        successStatus: 200,
        summary: 'Create field',
        tags: ['tables'],
      })
      .input(createFieldInputSchema)
      .output(createFieldOkResponseSchema),
    explainCreateField: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_CREATE_FIELD_PATH,
        successStatus: 200,
        summary: 'Explain create field',
        tags: ['tables'],
      })
      .input(explainCreateFieldInputSchema)
      .output(explainOkResponseSchema),
    updateField: oc
      .route({
        method: 'POST',
        path: TABLES_UPDATE_FIELD_PATH,
        successStatus: 200,
        summary: 'Update field',
        tags: ['tables'],
      })
      .input(updateFieldInputSchema)
      .output(updateFieldOkResponseSchema),
    explainUpdateField: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_UPDATE_FIELD_PATH,
        successStatus: 200,
        summary: 'Explain update field',
        tags: ['tables'],
      })
      .input(explainUpdateFieldInputSchema)
      .output(explainOkResponseSchema),
    updateRecords: oc
      .route({
        method: 'POST',
        path: TABLES_UPDATE_RECORDS_PATH,
        successStatus: 200,
        summary: 'Update multiple records by filter or recordIds',
        tags: ['tables'],
      })
      .input(updateRecordsInputSchema)
      .output(updateRecordsOkResponseSchema),
    createRecord: oc
      .route({
        method: 'POST',
        path: TABLES_CREATE_RECORD_PATH,
        successStatus: 201,
        summary: 'Create record',
        tags: ['tables'],
      })
      .input(createRecordInputSchema)
      .output(createRecordOkResponseSchema),
    submitRecord: oc
      .route({
        method: 'POST',
        path: TABLES_SUBMIT_RECORD_PATH,
        successStatus: 201,
        summary: 'Submit record from form',
        tags: ['tables'],
      })
      .input(submitRecordInputSchema)
      .output(submitRecordOkResponseSchema),
    createRecords: oc
      .route({
        method: 'POST',
        path: TABLES_CREATE_RECORDS_PATH,
        successStatus: 201,
        summary: 'Create multiple records',
        tags: ['tables'],
      })
      .input(createRecordsInputSchema)
      .output(createRecordsOkResponseSchema),
    deleteRecords: oc
      .route({
        method: 'DELETE',
        path: TABLES_DELETE_RECORDS_PATH,
        successStatus: 200,
        summary: 'Delete records',
        tags: ['tables'],
      })
      .input(deleteRecordsInputSchema)
      .output(deleteRecordsOkResponseSchema),
    deleteField: oc
      .route({
        method: 'DELETE',
        path: TABLES_DELETE_FIELD_PATH,
        successStatus: 200,
        summary: 'Delete field',
        tags: ['tables'],
      })
      .input(deleteFieldInputSchema)
      .output(deleteFieldOkResponseSchema),
    explainDeleteField: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_DELETE_FIELD_PATH,
        successStatus: 200,
        summary: 'Explain delete field',
        tags: ['tables'],
      })
      .input(explainDeleteFieldInputSchema)
      .output(explainOkResponseSchema),
    explainDeleteTable: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_DELETE_TABLE_PATH,
        successStatus: 200,
        summary: 'Explain delete table',
        tags: ['tables'],
      })
      .input(explainDeleteTableInputSchema)
      .output(explainOkResponseSchema),
    delete: oc
      .route({
        method: 'DELETE',
        path: TABLES_DELETE_PATH,
        successStatus: 200,
        summary: 'Delete table',
        tags: ['tables'],
      })
      .input(deleteTableInputSchema)
      .output(deleteTableOkResponseSchema),
    restore: oc
      .route({
        method: 'POST',
        path: TABLES_RESTORE_PATH,
        successStatus: 200,
        summary: 'Restore table',
        tags: ['tables'],
      })
      .input(restoreTableInputSchema)
      .output(restoreTableOkResponseSchema),
    getById: oc
      .route({
        method: 'GET',
        path: TABLES_GET_PATH,
        successStatus: 200,
        summary: 'Get table by id',
        tags: ['tables'],
      })
      .input(getTableByIdInputSchema)
      .output(getTableByIdOkResponseSchema),
    getRecord: oc
      .route({
        method: 'GET',
        path: TABLES_GET_RECORD_PATH,
        successStatus: 200,
        summary: 'Get record by id',
        tags: ['tables'],
      })
      .input(getRecordByIdInputSchema)
      .output(getRecordByIdOkResponseSchema),
    getRowCount: oc
      .route({
        method: 'GET',
        path: TABLES_GET_ROW_COUNT_PATH,
        successStatus: 200,
        summary: 'Get row count',
        tags: ['tables'],
      })
      .input(getRowCountInputSchema)
      .output(getRowCountOkResponseSchema),
    getRecordIndex: oc
      .route({
        method: 'GET',
        path: TABLES_GET_RECORD_INDEX_PATH,
        successStatus: 200,
        summary: 'Get record index',
        tags: ['tables'],
      })
      .input(getRecordIndexInputSchema)
      .output(getRecordIndexOkResponseSchema),
    getSearchCount: oc
      .route({
        method: 'GET',
        path: TABLES_GET_SEARCH_COUNT_PATH,
        successStatus: 200,
        summary: 'Get search count',
        tags: ['tables'],
      })
      .input(getSearchCountInputSchema)
      .output(getSearchCountOkResponseSchema),
    getSearchIndex: oc
      .route({
        method: 'GET',
        path: TABLES_GET_SEARCH_INDEX_PATH,
        successStatus: 200,
        summary: 'Get search index',
        tags: ['tables'],
      })
      .input(getSearchIndexInputSchema)
      .output(getSearchIndexOkResponseSchema),
    getAggregation: oc
      .route({
        method: 'GET',
        path: TABLES_GET_AGGREGATION_PATH,
        successStatus: 200,
        summary: 'Get aggregation',
        tags: ['tables'],
      })
      .input(getAggregationInputSchema)
      .output(getAggregationOkResponseSchema),
    getGroupPoints: oc
      .route({
        method: 'GET',
        path: TABLES_GET_GROUP_POINTS_PATH,
        successStatus: 200,
        summary: 'Get group points',
        tags: ['tables'],
      })
      .input(getGroupPointsInputSchema)
      .output(getGroupPointsOkResponseSchema),
    getCalendarDailyCollection: oc
      .route({
        method: 'GET',
        path: TABLES_GET_CALENDAR_DAILY_COLLECTION_PATH,
        successStatus: 200,
        summary: 'Get calendar daily collection',
        tags: ['tables'],
      })
      .input(getCalendarDailyCollectionInputSchema)
      .output(getCalendarDailyCollectionOkResponseSchema),
    getTaskStatusCollection: oc
      .route({
        method: 'GET',
        path: TABLES_GET_TASK_STATUS_COLLECTION_PATH,
        successStatus: 200,
        summary: 'Get task status collection',
        tags: ['tables'],
      })
      .input(getTaskStatusCollectionInputSchema)
      .output(getTaskStatusCollectionOkResponseSchema),
    importCsv: oc
      .route({
        method: 'POST',
        path: TABLES_IMPORT_CSV_PATH,
        successStatus: 201,
        summary: 'Import CSV to create table with records',
        tags: ['tables'],
      })
      .input(importCsvInputSchema)
      .output(importCsvOkResponseSchema),
    importRecords: oc
      .route({
        method: 'POST',
        path: TABLES_IMPORT_RECORDS_PATH,
        successStatus: 200,
        summary: 'Import records into existing table',
        tags: ['tables'],
      })
      .input(importRecordsInputSchema)
      .output(importRecordsOkResponseSchema),
    listRecords: oc
      .route({
        method: 'GET',
        path: TABLES_LIST_RECORDS_PATH,
        successStatus: 200,
        summary: 'List table records',
        tags: ['tables'],
      })
      .input(listTableRecordsInputSchema)
      .output(listTableRecordsOkResponseSchema),
    list: oc
      .route({
        method: 'GET',
        path: TABLES_LIST_PATH,
        successStatus: 200,
        summary: 'List tables',
        tags: ['tables'],
      })
      .input(listTablesInputSchema)
      .output(listTablesOkResponseSchema),
    rename: oc
      .route({
        method: 'POST',
        path: TABLES_RENAME_PATH,
        successStatus: 200,
        summary: 'Rename table',
        tags: ['tables'],
      })
      .input(renameTableInputSchema)
      .output(renameTableOkResponseSchema),
    updateRecord: oc
      .route({
        method: 'POST',
        path: TABLES_UPDATE_RECORD_PATH,
        successStatus: 200,
        summary: 'Update record',
        tags: ['tables'],
      })
      .input(updateRecordInputSchema)
      .output(updateRecordOkResponseSchema),
    reorderRecords: oc
      .route({
        method: 'POST',
        path: TABLES_REORDER_RECORDS_PATH,
        successStatus: 200,
        summary: 'Reorder records',
        tags: ['tables'],
      })
      .input(reorderRecordsInputSchema)
      .output(reorderRecordsOkResponseSchema),
    duplicateField: oc
      .route({
        method: 'POST',
        path: TABLES_DUPLICATE_FIELD_PATH,
        successStatus: 200,
        summary: 'Duplicate field',
        tags: ['tables'],
      })
      .input(duplicateFieldInputSchema)
      .output(duplicateFieldOkResponseSchema),
    duplicateRecord: oc
      .route({
        method: 'POST',
        path: TABLES_DUPLICATE_RECORD_PATH,
        successStatus: 201,
        summary: 'Duplicate record',
        tags: ['tables'],
      })
      .input(duplicateRecordInputSchema)
      .output(duplicateRecordOkResponseSchema),
    duplicateTable: oc
      .route({
        method: 'POST',
        path: TABLES_DUPLICATE_TABLE_PATH,
        successStatus: 201,
        summary: 'Duplicate table',
        tags: ['tables'],
      })
      .input(duplicateTableInputSchema)
      .output(duplicateTableOkResponseSchema),
    paste: oc
      .route({
        method: 'POST',
        path: TABLES_PASTE_PATH,
        successStatus: 200,
        summary: 'Paste content to table cells',
        tags: ['tables'],
      })
      .input(pasteCommandInputSchema)
      .output(pasteOkResponseSchema),
    clear: oc
      .route({
        method: 'POST',
        path: TABLES_CLEAR_PATH,
        successStatus: 200,
        summary: 'Clear cell values in selected range',
        tags: ['tables'],
      })
      .input(clearCommandInputSchema)
      .output(clearOkResponseSchema),
    deleteByRange: oc
      .route({
        method: 'DELETE',
        path: TABLES_DELETE_BY_RANGE_PATH,
        successStatus: 200,
        summary: 'Delete records by range selection',
        tags: ['tables'],
      })
      .input(deleteByRangeCommandInputSchema)
      .output(deleteByRangeOkResponseSchema),
    explainCreateRecord: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_CREATE_RECORD_PATH,
        successStatus: 200,
        summary: 'Explain create record command',
        tags: ['tables', 'explain'],
      })
      .input(explainCreateRecordInputSchema)
      .output(explainOkResponseSchema),
    explainUpdateRecord: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_UPDATE_RECORD_PATH,
        successStatus: 200,
        summary: 'Explain update record command',
        tags: ['tables', 'explain'],
      })
      .input(explainUpdateRecordInputSchema)
      .output(explainOkResponseSchema),
    explainDeleteRecords: oc
      .route({
        method: 'POST',
        path: TABLES_EXPLAIN_DELETE_RECORDS_PATH,
        successStatus: 200,
        summary: 'Explain delete records command',
        tags: ['tables', 'explain'],
      })
      .input(explainDeleteRecordsInputSchema)
      .output(explainOkResponseSchema),
    undo: oc
      .route({
        method: 'POST',
        path: TABLES_UNDO_PATH,
        successStatus: 200,
        summary: 'Undo latest operation',
        tags: ['tables'],
      })
      .input(undoInputSchema)
      .output(undoOkResponseSchema),
    redo: oc
      .route({
        method: 'POST',
        path: TABLES_REDO_PATH,
        successStatus: 200,
        summary: 'Redo latest operation',
        tags: ['tables'],
      })
      .input(redoInputSchema)
      .output(redoOkResponseSchema),
  },
  views: {
    list: oc
      .route({
        method: 'GET',
        path: VIEWS_LIST_PATH,
        successStatus: 200,
        summary: 'List views by table',
        tags: ['views'],
      })
      .input(getTableByIdInputSchema)
      .output(listViewsOkResponseSchema),
    getById: oc
      .route({
        method: 'GET',
        path: VIEWS_GET_BY_ID_PATH,
        successStatus: 200,
        summary: 'Get view by id',
        tags: ['views'],
      })
      .input(getViewByIdInputSchema)
      .output(getViewByIdOkResponseSchema),
    updateName: oc
      .route({
        method: 'POST',
        path: VIEWS_UPDATE_NAME_PATH,
        successStatus: 200,
        summary: 'Update view name',
        tags: ['views'],
      })
      .input(updateViewNameInputSchema)
      .output(updateViewPropertyOkResponseSchema),
    updateDescription: oc
      .route({
        method: 'POST',
        path: VIEWS_UPDATE_DESCRIPTION_PATH,
        successStatus: 200,
        summary: 'Update view description',
        tags: ['views'],
      })
      .input(updateViewDescriptionInputSchema)
      .output(updateViewPropertyOkResponseSchema),
    updateLocked: oc
      .route({
        method: 'POST',
        path: VIEWS_UPDATE_LOCKED_PATH,
        successStatus: 200,
        summary: 'Update view locked status',
        tags: ['views'],
      })
      .input(updateViewLockedInputSchema)
      .output(updateViewPropertyOkResponseSchema),
    updateShareMeta: oc
      .route({
        method: 'POST',
        path: VIEWS_UPDATE_SHARE_META_PATH,
        successStatus: 200,
        summary: 'Update view share meta',
        tags: ['views'],
      })
      .input(updateViewShareMetaInputSchema)
      .output(updateViewPropertyOkResponseSchema),
    updateOptions: oc
      .route({
        method: 'POST',
        path: VIEWS_UPDATE_OPTIONS_PATH,
        successStatus: 200,
        summary: 'Update view options',
        tags: ['views'],
      })
      .input(updateViewOptionsInputSchema)
      .output(updateViewPropertyOkResponseSchema),
    updateOrder: oc
      .route({
        method: 'POST',
        path: VIEWS_UPDATE_ORDER_PATH,
        successStatus: 200,
        summary: 'Update view order',
        tags: ['views'],
      })
      .input(updateViewOrderInputSchema)
      .output(updateViewPropertyOkResponseSchema),
    updateFilter: oc
      .route({
        method: 'POST',
        path: VIEWS_UPDATE_FILTER_PATH,
        successStatus: 200,
        summary: 'Update view filter',
        tags: ['views'],
      })
      .input(updateViewFilterInputSchema)
      .output(updateViewFilterOkResponseSchema),
    updateSort: oc
      .route({
        method: 'POST',
        path: VIEWS_UPDATE_SORT_PATH,
        successStatus: 200,
        summary: 'Update view sort',
        tags: ['views'],
      })
      .input(updateViewSortInputSchema)
      .output(updateViewSortOkResponseSchema),
    updateGroup: oc
      .route({
        method: 'POST',
        path: VIEWS_UPDATE_GROUP_PATH,
        successStatus: 200,
        summary: 'Update view group',
        tags: ['views'],
      })
      .input(updateViewGroupInputSchema)
      .output(updateViewGroupOkResponseSchema),
    updateColumnMeta: oc
      .route({
        method: 'POST',
        path: VIEWS_UPDATE_COLUMN_META_PATH,
        successStatus: 200,
        summary: 'Update view column meta',
        tags: ['views'],
      })
      .input(updateViewColumnMetaInputSchema)
      .output(updateViewColumnMetaOkResponseSchema),
    reorderRecords: oc
      .route({
        method: 'POST',
        path: VIEWS_REORDER_RECORDS_PATH,
        successStatus: 200,
        summary: 'Reorder records in view',
        tags: ['views'],
      })
      .input(reorderRecordsInputSchema)
      .output(reorderRecordsOkResponseSchema),
  },
  comments: {
    getSubscribeDetail: oc
      .route({
        method: 'GET',
        path: COMMENTS_GET_SUBSCRIBE_PATH,
        successStatus: 200,
        summary: 'Get comment subscribe detail',
        tags: ['comments'],
      })
      .input(commentSubscribeInputSchema)
      .output(getCommentSubscribeOkResponseSchema),
    subscribe: oc
      .route({
        method: 'POST',
        path: COMMENTS_SUBSCRIBE_PATH,
        successStatus: 200,
        summary: 'Subscribe comment',
        tags: ['comments'],
      })
      .input(commentSubscribeInputSchema)
      .output(commentSubscribeMutationOkResponseSchema),
    unsubscribe: oc
      .route({
        method: 'POST',
        path: COMMENTS_UNSUBSCRIBE_PATH,
        successStatus: 200,
        summary: 'Unsubscribe comment',
        tags: ['comments'],
      })
      .input(commentSubscribeInputSchema)
      .output(commentSubscribeMutationOkResponseSchema),
    getRecordCount: oc
      .route({
        method: 'GET',
        path: COMMENTS_GET_RECORD_COUNT_PATH,
        successStatus: 200,
        summary: 'Get comment count for record',
        tags: ['comments'],
      })
      .input(getCommentRecordCountInputSchema)
      .output(getCommentRecordCountOkResponseSchema),
    getTableCount: oc
      .route({
        method: 'GET',
        path: COMMENTS_GET_TABLE_COUNT_PATH,
        successStatus: 200,
        summary: 'Get comment counts for table query',
        tags: ['comments'],
      })
      .input(getCommentTableCountInputSchema)
      .output(getCommentTableCountOkResponseSchema),
    list: oc
      .route({
        method: 'GET',
        path: COMMENTS_LIST_PATH,
        successStatus: 200,
        summary: 'List comments',
        tags: ['comments'],
      })
      .input(listCommentsInputSchema)
      .output(listCommentsOkResponseSchema),
    getById: oc
      .route({
        method: 'GET',
        path: COMMENTS_GET_BY_ID_PATH,
        successStatus: 200,
        summary: 'Get comment by id',
        tags: ['comments'],
      })
      .input(getCommentByIdInputSchema)
      .output(getCommentByIdOkResponseSchema),
  },
  organization: {
    getMe: oc
      .route({
        method: 'GET',
        path: ORGANIZATION_GET_ME_PATH,
        successStatus: 200,
        summary: 'Get current organization info',
        tags: ['organization'],
      })
      .input(getOrganizationMeInputSchema)
      .output(getOrganizationMeOkResponseSchema),
    getDepartmentUsers: oc
      .route({
        method: 'GET',
        path: ORGANIZATION_GET_DEPARTMENT_USERS_PATH,
        successStatus: 200,
        summary: 'Get organization department users',
        tags: ['organization'],
      })
      .input(getDepartmentUsersInputSchema)
      .output(getDepartmentUsersOkResponseSchema),
    getDepartmentList: oc
      .route({
        method: 'GET',
        path: ORGANIZATION_GET_DEPARTMENT_LIST_PATH,
        successStatus: 200,
        summary: 'Get organization department list',
        tags: ['organization'],
      })
      .input(getDepartmentListInputSchema)
      .output(getDepartmentListOkResponseSchema),
  },
  publishedApps: {
    getNavigationModel: oc
      .route({
        method: 'GET',
        path: PUBLISHED_APPS_GET_NAVIGATION_MODEL_PATH,
        successStatus: 200,
        summary: 'Get published app navigation model',
        tags: [PUBLISHED_APPS_TAG],
      })
      .input(getPublishedAppNavigationModelInputSchema)
      .output(getPublishedAppNavigationModelOkResponseSchema),
    getNodeRuntime: oc
      .route({
        method: 'GET',
        path: PUBLISHED_APPS_GET_NODE_RUNTIME_PATH,
        successStatus: 200,
        summary: 'Get published app node runtime',
        tags: [PUBLISHED_APPS_TAG],
      })
      .input(getPublishedAppNodeRuntimeInputSchema)
      .output(getPublishedAppNodeRuntimeOkResponseSchema),
    getRuntimeManifest: oc
      .route({
        method: 'GET',
        path: PUBLISHED_APPS_GET_RUNTIME_MANIFEST_PATH,
        successStatus: 200,
        summary: 'Get published app runtime manifest',
        tags: [PUBLISHED_APPS_TAG],
      })
      .input(getPublishedAppRuntimeManifestInputSchema)
      .output(getPublishedAppRuntimeManifestOkResponseSchema),
  },
  share: {
    buttonClickView: oc
      .route({
        method: 'POST',
        path: SHARE_BUTTON_CLICK_VIEW_PATH,
        successStatus: 200,
        summary: 'Button click in share view',
        tags: ['share'],
      })
      .input(buttonClickShareViewInputSchema)
      .output(buttonClickShareViewOkResponseSchema),
    copyView: oc
      .route({
        method: 'GET',
        path: SHARE_COPY_VIEW_PATH,
        successStatus: 200,
        summary: 'Copy in share view',
        tags: ['share'],
      })
      .input(copyShareViewInputSchema)
      .output(copyShareViewOkResponseSchema),
    formSubmitView: oc
      .route({
        method: 'POST',
        path: SHARE_FORM_SUBMIT_VIEW_PATH,
        successStatus: 201,
        summary: 'Submit form in share view',
        tags: ['share'],
      })
      .input(formSubmitShareViewInputSchema)
      .output(formSubmitShareViewOkResponseSchema),
    getViewAggregations: oc
      .route({
        method: 'GET',
        path: SHARE_GET_VIEW_AGGREGATIONS_PATH,
        successStatus: 200,
        summary: 'Get share view aggregations',
        tags: ['share'],
      })
      .input(getShareViewAggregationsInputSchema)
      .output(getShareViewAggregationsOkResponseSchema),
    getView: oc
      .route({
        method: 'GET',
        path: SHARE_GET_VIEW_PATH,
        successStatus: 200,
        summary: 'Get share view',
        tags: ['share'],
      })
      .input(getShareViewInputSchema)
      .output(getShareViewOkResponseSchema),
    getViewGroupPoints: oc
      .route({
        method: 'GET',
        path: SHARE_GET_VIEW_GROUP_POINTS_PATH,
        successStatus: 200,
        summary: 'Get share view group points',
        tags: ['share'],
      })
      .input(getShareViewGroupPointsInputSchema)
      .output(getShareViewGroupPointsOkResponseSchema),
    getViewCalendarDailyCollection: oc
      .route({
        method: 'GET',
        path: SHARE_GET_VIEW_CALENDAR_DAILY_COLLECTION_PATH,
        successStatus: 200,
        summary: 'Get share view calendar daily collection',
        tags: ['share'],
      })
      .input(getShareViewCalendarDailyCollectionInputSchema)
      .output(getShareViewCalendarDailyCollectionOkResponseSchema),
    getViewLinkRecords: oc
      .route({
        method: 'GET',
        path: SHARE_GET_VIEW_LINK_RECORDS_PATH,
        successStatus: 200,
        summary: 'Get share view link records',
        tags: ['share'],
      })
      .input(getShareViewLinkRecordsInputSchema)
      .output(getShareViewLinkRecordsOkResponseSchema),
    getViewCollaborators: oc
      .route({
        method: 'GET',
        path: SHARE_GET_VIEW_COLLABORATORS_PATH,
        successStatus: 200,
        summary: 'Get share view collaborators',
        tags: ['share'],
      })
      .input(getShareViewCollaboratorsInputSchema)
      .output(getShareViewCollaboratorsOkResponseSchema),
    getViewRowCount: oc
      .route({
        method: 'GET',
        path: SHARE_GET_VIEW_ROW_COUNT_PATH,
        successStatus: 200,
        summary: 'Get share view row count',
        tags: ['share'],
      })
      .input(getShareViewRowCountInputSchema)
      .output(getShareViewRowCountOkResponseSchema),
    getViewRecords: oc
      .route({
        method: 'GET',
        path: SHARE_GET_VIEW_RECORDS_PATH,
        successStatus: 200,
        summary: 'Get share view records',
        tags: ['share'],
      })
      .input(getShareViewRecordsInputSchema)
      .output(getShareViewRecordsOkResponseSchema),
    getViewSearchCount: oc
      .route({
        method: 'GET',
        path: SHARE_GET_VIEW_SEARCH_COUNT_PATH,
        successStatus: 200,
        summary: 'Get share view search count',
        tags: ['share'],
      })
      .input(getShareViewSearchCountInputSchema)
      .output(getShareViewSearchCountOkResponseSchema),
    getViewSearchIndex: oc
      .route({
        method: 'GET',
        path: SHARE_GET_VIEW_SEARCH_INDEX_PATH,
        successStatus: 200,
        summary: 'Get share view search index',
        tags: ['share'],
      })
      .input(getShareViewSearchIndexInputSchema)
      .output(getShareViewSearchIndexOkResponseSchema),
  },
  settings: {
    get: oc
      .route({
        method: 'GET',
        path: SETTINGS_GET_PATH,
        successStatus: 200,
        summary: 'Get instance setting',
        tags: ['settings'],
      })
      .input(getSettingInputSchema)
      .output(getSettingOkResponseSchema),
    getPublic: oc
      .route({
        method: 'GET',
        path: SETTINGS_GET_PUBLIC_PATH,
        successStatus: 200,
        summary: 'Get public instance setting',
        tags: ['settings'],
      })
      .input(getPublicSettingInputSchema)
      .output(getPublicSettingOkResponseSchema),
  },
  templates: {
    getById: oc
      .route({
        method: 'GET',
        path: TEMPLATES_GET_BY_ID_PATH,
        successStatus: 200,
        summary: 'Get template by id',
        tags: ['templates'],
      })
      .input(getTemplateByIdInputSchema)
      .output(getTemplateByIdOkResponseSchema),
    getPermalink: oc
      .route({
        method: 'GET',
        path: TEMPLATES_GET_PERMALINK_PATH,
        successStatus: 200,
        summary: 'Get template permalink',
        tags: ['templates'],
      })
      .input(getTemplatePermalinkInputSchema)
      .output(getTemplatePermalinkOkResponseSchema),
    incrementVisit: oc
      .route({
        method: 'POST',
        path: TEMPLATES_INCREMENT_VISIT_PATH,
        successStatus: 200,
        summary: 'Increment template visit',
        tags: ['templates'],
      })
      .input(incrementTemplateVisitInputSchema)
      .output(incrementTemplateVisitOkResponseSchema),
    listPublished: oc
      .route({
        method: 'GET',
        path: TEMPLATES_LIST_PUBLISHED_PATH,
        successStatus: 200,
        summary: 'List published templates',
        tags: ['templates'],
      })
      .input(listPublishedTemplatesInputSchema)
      .output(listPublishedTemplatesOkResponseSchema),
  },
  workflows: {
    aiCreateDraft: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_AI_CREATE_DRAFT_PATH,
        successStatus: 201,
        summary: 'Create workflow draft with AI',
        tags: ['workflows'],
      })
      .input(aiCreateDraftWorkflowInputSchema)
      .output(aiCreateDraftWorkflowOkResponseSchema),
    applyUpdate: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_APPLY_UPDATE_PATH,
        successStatus: 200,
        summary: 'Apply workflow draft update',
        tags: ['workflows'],
      })
      .input(applyUpdateWorkflowInputSchema)
      .output(applyUpdateWorkflowOkResponseSchema),
    activate: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_ACTIVATE_PATH,
        successStatus: 200,
        summary: 'Activate workflow',
        tags: ['workflows'],
      })
      .input(activateWorkflowInputSchema)
      .output(activateWorkflowOkResponseSchema),
    create: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_CREATE_PATH,
        successStatus: 201,
        summary: 'Create workflow',
        tags: ['workflows'],
      })
      .input(createWorkflowInputSchema)
      .output(createWorkflowOkResponseSchema),
    deactivate: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_DEACTIVATE_PATH,
        successStatus: 200,
        summary: 'Deactivate workflow',
        tags: ['workflows'],
      })
      .input(deactivateWorkflowInputSchema)
      .output(deactivateWorkflowOkResponseSchema),
    list: oc
      .route({
        method: 'GET',
        path: WORKFLOWS_LIST_PATH,
        successStatus: 200,
        summary: 'List workflows',
        tags: ['workflows'],
      })
      .input(listWorkflowsInputSchema)
      .output(listWorkflowsOkResponseSchema),
    update: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_UPDATE_PATH,
        successStatus: 200,
        summary: 'Update workflow',
        tags: ['workflows'],
      })
      .input(updateWorkflowInputSchema)
      .output(updateWorkflowOkResponseSchema),
    delete: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_DELETE_PATH,
        successStatus: 200,
        summary: 'Delete workflow',
        tags: ['workflows'],
      })
      .input(deleteWorkflowInputSchema)
      .output(deleteWorkflowOkResponseSchema),
    duplicate: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_DUPLICATE_PATH,
        successStatus: 201,
        summary: 'Duplicate workflow',
        tags: ['workflows'],
      })
      .input(duplicateWorkflowInputSchema)
      .output(duplicateWorkflowOkResponseSchema),
    getById: oc
      .route({
        method: 'GET',
        path: WORKFLOWS_GET_BY_ID_PATH,
        successStatus: 200,
        summary: 'Get workflow by id',
        tags: ['workflows'],
      })
      .input(getWorkflowByIdInputSchema)
      .output(getWorkflowByIdOkResponseSchema),
    getCapabilities: oc
      .route({
        method: 'GET',
        path: WORKFLOWS_GET_CAPABILITIES_PATH,
        successStatus: 200,
        summary: 'Get workflow capabilities',
        tags: ['workflows'],
      })
      .input(getWorkflowCapabilitiesInputSchema)
      .output(getWorkflowCapabilitiesOkResponseSchema),
    listRuns: oc
      .route({
        method: 'GET',
        path: WORKFLOWS_LIST_RUNS_PATH,
        successStatus: 200,
        summary: 'List workflow runs',
        tags: ['workflows'],
      })
      .input(listWorkflowRunsInputSchema)
      .output(listWorkflowRunsOkResponseSchema),
    getRun: oc
      .route({
        method: 'GET',
        path: WORKFLOWS_GET_RUN_PATH,
        successStatus: 200,
        summary: 'Get workflow run',
        tags: ['workflows'],
      })
      .input(getWorkflowRunInputSchema)
      .output(getWorkflowRunOkResponseSchema),
    testNode: oc
      .route({
        method: 'POST',
        path: '/workflows/{workflowId}/test-node',
        successStatus: 201,
        summary: 'Test workflow node',
        tags: ['workflows'],
      })
      .input(testNodeWorkflowInputSchema)
      .output(testNodeWorkflowOkResponseSchema),
    triggerWebhook: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_TRIGGER_WEBHOOK_PATH,
        successStatus: 201,
        summary: 'Trigger webhook workflow',
        tags: ['workflows'],
      })
      .input(triggerWebhookWorkflowInputSchema)
      .output(triggerWebhookWorkflowOkResponseSchema),
    triggerSchedule: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_TRIGGER_SCHEDULE_PATH,
        successStatus: 201,
        summary: 'Trigger schedule workflow',
        tags: ['workflows'],
      })
      .input(triggerScheduleWorkflowInputSchema)
      .output(triggerScheduleWorkflowOkResponseSchema),
    triggerFormSubmitted: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_TRIGGER_FORM_SUBMITTED_PATH,
        successStatus: 201,
        summary: 'Trigger form submitted workflow',
        tags: ['workflows'],
      })
      .input(triggerFormSubmittedWorkflowInputSchema)
      .output(triggerFormSubmittedWorkflowOkResponseSchema),
    triggerEmailReceived: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_TRIGGER_EMAIL_RECEIVED_PATH,
        successStatus: 201,
        summary: 'Trigger email received workflow',
        tags: ['workflows'],
      })
      .input(triggerEmailReceivedWorkflowInputSchema)
      .output(triggerEmailReceivedWorkflowOkResponseSchema),
    testRun: oc
      .route({
        method: 'POST',
        path: WORKFLOWS_TEST_RUN_PATH,
        successStatus: 201,
        summary: 'Test run workflow',
        tags: ['workflows'],
      })
      .input(testRunWorkflowInputSchema)
      .output(testRunWorkflowOkResponseSchema),
  },
} as const satisfies AnyContractRouter;

export type V2Contract = typeof v2ContractDefinition;

export const v2Contract: V2Contract = v2ContractDefinition;

export const v2ContractErrors = {
  400: createTableErrorResponseSchema,
  404: deleteTableErrorResponseSchema,
  500: createTableErrorResponseSchema,
} as const;
