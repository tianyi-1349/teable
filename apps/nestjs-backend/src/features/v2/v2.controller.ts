import { Controller } from '@nestjs/common';
import { Implement, implement, ORPCError } from '@orpc/nest';
import type {
  ICopyVo,
  ITemplateVo,
  IWorkflowRunDetailVo,
  IWorkflowRunVo,
  ShareViewGetVo,
} from '@teable/openapi';
import { v2Contract } from '@teable/v2-contract-http';
import type {
  ICopyShareViewOkResponseDto,
  IGetShareViewOkResponseDto,
  ICopyShareViewResponseDataDto,
  IGetShareViewResponseDataDto,
} from '@teable/v2-contract-http';
import {
  executeGetAggregationEndpoint,
  executeGetCalendarDailyCollectionEndpoint,
  executeGetGroupPointsEndpoint,
  executeGetRecordIndexEndpoint,
  executeGetRowCountEndpoint,
  executeGetSearchCountEndpoint,
  executeGetSearchIndexEndpoint,
  executeGetTaskStatusCollectionEndpoint,
  executeActivateWorkflowEndpoint,
  executeAiCreateDraftWorkflowEndpoint,
  executeApplyUpdateWorkflowEndpoint,
  executeButtonClickShareViewEndpoint,
  executeCommentSubscribeEndpoint,
  executeCommentUnsubscribeEndpoint,
  executeCreateTableEndpoint,
  executeCreateWorkflowEndpoint,
  executeDeactivateWorkflowEndpoint,
  executeDeleteRecordsEndpoint,
  executeDeleteWorkflowEndpoint,
  executeDuplicateWorkflowEndpoint,
  executeGetCommentByIdEndpoint,
  executeGetCommentRecordCountEndpoint,
  executeGetCommentSubscribeEndpoint,
  executeGetCommentTableCountEndpoint,
  executeGetDepartmentListEndpoint,
  executeGetDepartmentUsersEndpoint,
  executeGetOrganizationMeEndpoint,
  executeGetPublicSettingEndpoint,
  executeGetPublishedAppNavigationModelEndpoint,
  executeGetPublishedAppNodeRuntimeEndpoint,
  executeGetPublishedAppRuntimeManifestEndpoint,
  executeGetSettingEndpoint,
  executeGetShareViewAggregationsEndpoint,
  executeGetShareViewCalendarDailyCollectionEndpoint,
  executeGetShareViewCollaboratorsEndpoint,
  executeGetShareViewEndpoint,
  executeGetShareViewGroupPointsEndpoint,
  executeGetShareViewLinkRecordsEndpoint,
  executeGetShareViewRecordsEndpoint,
  executeGetShareViewRowCountEndpoint,
  executeGetShareViewSearchCountEndpoint,
  executeGetShareViewSearchIndexEndpoint,
  executeGetTableByIdEndpoint,
  executeGetTemplateByIdEndpoint,
  executeGetTemplatePermalinkEndpoint,
  executeGetViewByIdEndpoint,
  executeGetWorkflowByIdEndpoint,
  executeGetWorkflowCapabilitiesEndpoint,
  executeGetWorkflowRunEndpoint,
  executeIncrementTemplateVisitEndpoint,
  executeListCommentsEndpoint,
  executeListPublishedTemplatesEndpoint,
  executeListViewsEndpoint,
  executeListWorkflowRunsEndpoint,
  executeListWorkflowsEndpoint,
  executeReorderRecordsEndpoint,
  executeRedoEndpoint,
  executeTestNodeWorkflowEndpoint,
  executeTestRunWorkflowEndpoint,
  executeTriggerEmailReceivedWorkflowEndpoint,
  executeTriggerFormSubmittedWorkflowEndpoint,
  executeTriggerScheduleWorkflowEndpoint,
  executeTriggerWebhookWorkflowEndpoint,
  executeUndoEndpoint,
  executeUpdateRecordsEndpoint,
  executeUpdateViewColumnMetaCommandEndpoint,
  executeUpdateViewDescriptionCommandEndpoint,
  executeUpdateViewFilterCommandEndpoint,
  executeUpdateViewGroupCommandEndpoint,
  executeUpdateViewLockedCommandEndpoint,
  executeUpdateViewNameCommandEndpoint,
  executeUpdateViewOptionsCommandEndpoint,
  executeUpdateViewOrderCommandEndpoint,
  executeUpdateViewShareMetaCommandEndpoint,
  executeUpdateViewSortCommandEndpoint,
  executeUpdateWorkflowEndpoint,
  executeCopyShareViewEndpoint,
  executeFormSubmitShareViewEndpoint,
} from '@teable/v2-contract-http-implementation/handlers';
import { v2CoreTokens } from '@teable/v2-core';
import type { ICommandBus, IQueryBus } from '@teable/v2-core' with { 'resolution-mode': 'import' };
import { AggregationOpenApiService } from '../aggregation/open-api/aggregation-open-api.service';
import { Public } from '../auth/decorators/public.decorator';
import { CommentOpenApiService } from '../comment/comment-open-api.service';
import { OrganizationService } from '../organization/organization.service';
import { SettingOpenApiService } from '../setting/open-api/setting-open-api.service';
import { ShareAuthService } from '../share/share-auth.service';
import { ShareService } from '../share/share.service';
import { TemplateOpenApiService } from '../template/template-open-api.service';
import { TemplatePermalinkService } from '../template/template-permalink.service';
import { UndoRedoService } from '../undo-redo/open-api/undo-redo.service';
import { WorkflowCapabilityService } from '../workflow/workflow-capability.service';
import { WorkflowRunnerService } from '../workflow/workflow-runner.service';
import { WorkflowService } from '../workflow/workflow.service';
import { V2ContainerService } from './v2-container.service';
import { V2ExecutionContextFactory } from './v2-execution-context.factory';
import { V2PublishedAppService } from './v2-published-app.service';

const throwOrpcErrorByStatus = (status: number, message: string): never => {
  if (status === 400) {
    throw new ORPCError('BAD_REQUEST', { message });
  }

  if (status === 401) {
    throw new ORPCError('UNAUTHORIZED', { message });
  }

  if (status === 403) {
    throw new ORPCError('FORBIDDEN', { message });
  }

  if (status === 404) {
    throw new ORPCError('NOT_FOUND', { message });
  }

  throw new ORPCError('INTERNAL_SERVER_ERROR', { message });
};

const getErrorMessage = (error: { message?: string } | string) => {
  return typeof error === 'string' ? error : error.message ?? 'Unexpected error';
};

type IRuntimeTarget = 'desktop-web' | 'tablet-web' | 'mobile-web' | 'embed' | 'pwa';
type IShareContractField = ICopyShareViewResponseDataDto['copy']['header'][number];

const normalizeContractField = <T extends { description?: string | null }>(
  field: T
): IShareContractField =>
  ({
    ...field,
    description: field.description ?? undefined,
  }) as unknown as IShareContractField;

const normalizeRuntimeTargets = (targets: readonly string[]): IRuntimeTarget[] =>
  targets as IRuntimeTarget[];

const normalizeCopyVo = (copy: ICopyVo): ICopyShareViewResponseDataDto['copy'] => ({
  ...copy,
  header: copy.header.map((field) => normalizeContractField(field)),
});

const normalizeShareView = (
  shareView: ShareViewGetVo
): IGetShareViewResponseDataDto['shareView'] => ({
  ...shareView,
  fields: shareView.fields.map((field) => normalizeContractField(field)),
});

/* eslint-disable sonarjs/cognitive-complexity */
const normalizeTemplateVo = (
  template: Awaited<ReturnType<TemplateOpenApiService['getTemplateDetailById']>>
): ITemplateVo => ({
  ...template,
  name: template.name ?? undefined,
  categoryId: template.categoryId ?? undefined,
  isSystem: template.isSystem ?? undefined,
  featured: template.featured ?? undefined,
  isPublished: template.isPublished ?? undefined,
  description: template.description ?? undefined,
  baseId: template.baseId ?? undefined,
  snapshot: template.snapshot,
  cover: template.cover,
  markdownDescription: template.markdownDescription ?? undefined,
  publishInfo:
    template.publishInfo &&
    typeof template.publishInfo === 'object' &&
    !Array.isArray(template.publishInfo)
      ? {
          nodes: Array.isArray(template.publishInfo.nodes)
            ? template.publishInfo.nodes.filter((node): node is string => typeof node === 'string')
            : undefined,
          includeData:
            typeof template.publishInfo.includeData === 'boolean'
              ? template.publishInfo.includeData
              : undefined,
          defaultActiveNodeId:
            template.publishInfo.defaultActiveNodeId == null ||
            typeof template.publishInfo.defaultActiveNodeId === 'string'
              ? template.publishInfo.defaultActiveNodeId ?? null
              : undefined,
          defaultUrl:
            typeof template.publishInfo.defaultUrl === 'string'
              ? template.publishInfo.defaultUrl
              : undefined,
        }
      : undefined,
  createdBy: template.createdBy ?? null,
});
/* eslint-enable sonarjs/cognitive-complexity */

const normalizeWorkflowRun = (run: IWorkflowRunVo): IWorkflowRunVo => ({
  ...run,
  input: run.input ?? undefined,
  output: run.output ?? undefined,
  error: run.error ?? undefined,
  finishedTime: run.finishedTime ?? undefined,
  durationMs: run.durationMs ?? undefined,
});

const normalizeWorkflowRunDetail = (run: IWorkflowRunDetailVo): IWorkflowRunDetailVo => ({
  ...normalizeWorkflowRun(run),
  steps: (run.steps ?? []).map((step) => ({
    ...step,
    input: step.input ?? undefined,
    output: step.output ?? undefined,
    error: step.error ?? undefined,
    finishedTime: step.finishedTime ?? undefined,
    durationMs: step.durationMs ?? undefined,
  })),
});

@Controller('api/v2')
export class V2Controller {
  constructor(
    private readonly v2Container: V2ContainerService,
    private readonly v2ContextFactory: V2ExecutionContextFactory,
    private readonly aggregationOpenApiService: AggregationOpenApiService,
    private readonly commentOpenApiService: CommentOpenApiService,
    private readonly organizationService: OrganizationService,
    private readonly v2PublishedAppService: V2PublishedAppService,
    private readonly shareService: ShareService,
    private readonly shareAuthService: ShareAuthService,
    private readonly settingOpenApiService: SettingOpenApiService,
    private readonly templateOpenApiService: TemplateOpenApiService,
    private readonly templatePermalinkService: TemplatePermalinkService,
    private readonly undoRedoService: UndoRedoService,
    private readonly workflowService: WorkflowService,
    private readonly workflowRunnerService: WorkflowRunnerService,
    private readonly workflowCapabilityService: WorkflowCapabilityService
  ) {}

  @Implement({
    create: v2Contract.tables.create,
    getById: v2Contract.tables.getById,
    getRowCount: v2Contract.tables.getRowCount,
    getRecordIndex: v2Contract.tables.getRecordIndex,
    getSearchCount: v2Contract.tables.getSearchCount,
    getSearchIndex: v2Contract.tables.getSearchIndex,
    getAggregation: v2Contract.tables.getAggregation,
    getGroupPoints: v2Contract.tables.getGroupPoints,
    getCalendarDailyCollection: v2Contract.tables.getCalendarDailyCollection,
    getTaskStatusCollection: v2Contract.tables.getTaskStatusCollection,
    deleteRecords: v2Contract.tables.deleteRecords,
    undo: v2Contract.tables.undo,
    redo: v2Contract.tables.redo,
    updateRecords: v2Contract.tables.updateRecords,
    reorderRecords: v2Contract.tables.reorderRecords,
  })
  tables() {
    return {
      create: implement(v2Contract.tables.create).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeCreateTableEndpoint(context, input, commandBus);

        if (result.status === 201) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getById: implement(v2Contract.tables.getById).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const queryBus = container.resolve<IQueryBus>(v2CoreTokens.queryBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeGetTableByIdEndpoint(context, input, queryBus);
        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getRowCount: implement(v2Contract.tables.getRowCount).handler(async ({ input }) => {
        const result = await executeGetRowCountEndpoint(
          input,
          this.aggregationOpenApiService.getRowCount.bind(this.aggregationOpenApiService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getRecordIndex: implement(v2Contract.tables.getRecordIndex).handler(async ({ input }) => {
        const result = await executeGetRecordIndexEndpoint(
          input,
          this.aggregationOpenApiService.getRecordIndex.bind(this.aggregationOpenApiService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getSearchCount: implement(v2Contract.tables.getSearchCount).handler(async ({ input }) => {
        const result = await executeGetSearchCountEndpoint(
          input,
          this.aggregationOpenApiService.getSearchCount.bind(this.aggregationOpenApiService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getSearchIndex: implement(v2Contract.tables.getSearchIndex).handler(async ({ input }) => {
        const result = await executeGetSearchIndexEndpoint(
          input,
          this.aggregationOpenApiService.getRecordIndexBySearchOrder.bind(
            this.aggregationOpenApiService
          )
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getAggregation: implement(v2Contract.tables.getAggregation).handler(async ({ input }) => {
        const result = await executeGetAggregationEndpoint(
          input,
          this.aggregationOpenApiService.getAggregation.bind(this.aggregationOpenApiService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getGroupPoints: implement(v2Contract.tables.getGroupPoints).handler(async ({ input }) => {
        const result = await executeGetGroupPointsEndpoint(
          input,
          this.aggregationOpenApiService.getGroupPoints.bind(this.aggregationOpenApiService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getCalendarDailyCollection: implement(v2Contract.tables.getCalendarDailyCollection).handler(
        async ({ input }) => {
          const result = await executeGetCalendarDailyCollectionEndpoint(
            input,
            this.aggregationOpenApiService.getCalendarDailyCollection.bind(
              this.aggregationOpenApiService
            )
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      getTaskStatusCollection: implement(v2Contract.tables.getTaskStatusCollection).handler(
        async ({ input }) => {
          const result = await executeGetTaskStatusCollectionEndpoint(
            input,
            async (tableId) => await this.aggregationOpenApiService.getTaskStatusCollection(tableId)
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      deleteRecords: implement(v2Contract.tables.deleteRecords).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeDeleteRecordsEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      undo: implement(v2Contract.tables.undo).handler(async ({ input }) => {
        const result = await executeUndoEndpoint(
          input,
          async (tableId, windowId) => (await this.undoRedoService.undo(tableId, windowId)).body
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      redo: implement(v2Contract.tables.redo).handler(async ({ input }) => {
        const result = await executeRedoEndpoint(
          input,
          async (tableId, windowId) => (await this.undoRedoService.redo(tableId, windowId)).body
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      updateRecords: implement(v2Contract.tables.updateRecords).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeUpdateRecordsEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      reorderRecords: implement(v2Contract.tables.reorderRecords).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeReorderRecordsEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
    };
  }

  @Implement({
    list: v2Contract.views.list,
    getById: v2Contract.views.getById,
    updateName: v2Contract.views.updateName,
    updateDescription: v2Contract.views.updateDescription,
    updateLocked: v2Contract.views.updateLocked,
    updateShareMeta: v2Contract.views.updateShareMeta,
    updateOptions: v2Contract.views.updateOptions,
    updateOrder: v2Contract.views.updateOrder,
    updateFilter: v2Contract.views.updateFilter,
    updateSort: v2Contract.views.updateSort,
    updateGroup: v2Contract.views.updateGroup,
    updateColumnMeta: v2Contract.views.updateColumnMeta,
    reorderRecords: v2Contract.views.reorderRecords,
  })
  views() {
    return {
      list: implement(v2Contract.views.list).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const queryBus = container.resolve<IQueryBus>(v2CoreTokens.queryBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeListViewsEndpoint(context, input, queryBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getById: implement(v2Contract.views.getById).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const queryBus = container.resolve<IQueryBus>(v2CoreTokens.queryBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeGetViewByIdEndpoint(context, input, queryBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      updateName: implement(v2Contract.views.updateName).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeUpdateViewNameCommandEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      updateDescription: implement(v2Contract.views.updateDescription).handler(
        async ({ input }) => {
          const container = await this.v2Container.getContainer();
          const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
          const context = await this.v2ContextFactory.createContext();

          const result = await executeUpdateViewDescriptionCommandEndpoint(
            context,
            input,
            commandBus
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      updateLocked: implement(v2Contract.views.updateLocked).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeUpdateViewLockedCommandEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      updateShareMeta: implement(v2Contract.views.updateShareMeta).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeUpdateViewShareMetaCommandEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      updateOptions: implement(v2Contract.views.updateOptions).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeUpdateViewOptionsCommandEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      updateOrder: implement(v2Contract.views.updateOrder).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeUpdateViewOrderCommandEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      updateFilter: implement(v2Contract.views.updateFilter).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeUpdateViewFilterCommandEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      updateSort: implement(v2Contract.views.updateSort).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeUpdateViewSortCommandEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      updateGroup: implement(v2Contract.views.updateGroup).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeUpdateViewGroupCommandEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      updateColumnMeta: implement(v2Contract.views.updateColumnMeta).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeUpdateViewColumnMetaCommandEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      reorderRecords: implement(v2Contract.views.reorderRecords).handler(async ({ input }) => {
        const container = await this.v2Container.getContainer();
        const commandBus = container.resolve<ICommandBus>(v2CoreTokens.commandBus);
        const context = await this.v2ContextFactory.createContext();

        const result = await executeReorderRecordsEndpoint(context, input, commandBus);

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
    };
  }

  @Implement({
    getMe: v2Contract.organization.getMe,
    getDepartmentUsers: v2Contract.organization.getDepartmentUsers,
    getDepartmentList: v2Contract.organization.getDepartmentList,
  })
  organization() {
    return {
      getMe: implement(v2Contract.organization.getMe).handler(async ({ input }) => {
        const result = await executeGetOrganizationMeEndpoint(input, () =>
          this.organizationService.getOrganizationMe()
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getDepartmentUsers: implement(v2Contract.organization.getDepartmentUsers).handler(
        async ({ input }) => {
          const result = await executeGetDepartmentUsersEndpoint(input, (query) =>
            this.organizationService.getDepartmentUsers(query)
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      getDepartmentList: implement(v2Contract.organization.getDepartmentList).handler(
        async ({ input }) => {
          const result = await executeGetDepartmentListEndpoint(input, (query) =>
            this.organizationService.getDepartmentList(query)
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
    };
  }

  @Implement({
    getSubscribeDetail: v2Contract.comments.getSubscribeDetail,
    subscribe: v2Contract.comments.subscribe,
    unsubscribe: v2Contract.comments.unsubscribe,
    getRecordCount: v2Contract.comments.getRecordCount,
    getTableCount: v2Contract.comments.getTableCount,
    list: v2Contract.comments.list,
    getById: v2Contract.comments.getById,
  })
  comments() {
    return {
      getSubscribeDetail: implement(v2Contract.comments.getSubscribeDetail).handler(
        async ({ input }) => {
          const result = await executeGetCommentSubscribeEndpoint(
            input,
            this.commentOpenApiService.getSubscribeDetail.bind(this.commentOpenApiService)
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      subscribe: implement(v2Contract.comments.subscribe).handler(async ({ input }) => {
        const result = await executeCommentSubscribeEndpoint(
          input,
          this.commentOpenApiService.subscribeComment.bind(this.commentOpenApiService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      unsubscribe: implement(v2Contract.comments.unsubscribe).handler(async ({ input }) => {
        const result = await executeCommentUnsubscribeEndpoint(
          input,
          this.commentOpenApiService.unsubscribeComment.bind(this.commentOpenApiService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getRecordCount: implement(v2Contract.comments.getRecordCount).handler(async ({ input }) => {
        const result = await executeGetCommentRecordCountEndpoint(
          input,
          this.commentOpenApiService.getRecordCommentCount.bind(this.commentOpenApiService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getTableCount: implement(v2Contract.comments.getTableCount).handler(async ({ input }) => {
        const result = await executeGetCommentTableCountEndpoint(
          input,
          this.commentOpenApiService.getTableCommentCount.bind(this.commentOpenApiService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      list: implement(v2Contract.comments.list).handler(async ({ input }) => {
        const result = await executeListCommentsEndpoint(
          input,
          this.commentOpenApiService.getCommentList.bind(this.commentOpenApiService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getById: implement(v2Contract.comments.getById).handler(async ({ input }) => {
        const result = await executeGetCommentByIdEndpoint(
          input,
          this.commentOpenApiService.getCommentDetail.bind(this.commentOpenApiService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
    };
  }

  @Implement({
    getNavigationModel: v2Contract.publishedApps.getNavigationModel,
    getNodeRuntime: v2Contract.publishedApps.getNodeRuntime,
    getRuntimeManifest: v2Contract.publishedApps.getRuntimeManifest,
  })
  @Public()
  publishedApps() {
    return {
      getNavigationModel: implement(v2Contract.publishedApps.getNavigationModel).handler(
        async ({ input }) => {
          const result = await executeGetPublishedAppNavigationModelEndpoint(
            input,
            this.v2PublishedAppService.getNavigationModel.bind(this.v2PublishedAppService)
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      getNodeRuntime: implement(v2Contract.publishedApps.getNodeRuntime).handler(
        async ({ input }) => {
          const result = await executeGetPublishedAppNodeRuntimeEndpoint(
            input,
            this.v2PublishedAppService.getNodeRuntime.bind(this.v2PublishedAppService)
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      getRuntimeManifest: implement(v2Contract.publishedApps.getRuntimeManifest).handler(
        async ({ input }) => {
          const result = await executeGetPublishedAppRuntimeManifestEndpoint(
            input,
            async (shareId) => {
              const manifest = await this.v2PublishedAppService.getRuntimeManifest(shareId);
              return {
                ...manifest,
                runtimeTargets: normalizeRuntimeTargets(manifest.runtimeTargets),
              };
            }
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
    };
  }

  @Implement({
    buttonClickView: v2Contract.share.buttonClickView,
    copyView: v2Contract.share.copyView,
    formSubmitView: v2Contract.share.formSubmitView,
    getViewAggregations: v2Contract.share.getViewAggregations,
    getView: v2Contract.share.getView,
    getViewGroupPoints: v2Contract.share.getViewGroupPoints,
    getViewCalendarDailyCollection: v2Contract.share.getViewCalendarDailyCollection,
    getViewLinkRecords: v2Contract.share.getViewLinkRecords,
    getViewCollaborators: v2Contract.share.getViewCollaborators,
    getViewRowCount: v2Contract.share.getViewRowCount,
    getViewRecords: v2Contract.share.getViewRecords,
    getViewSearchCount: v2Contract.share.getViewSearchCount,
    getViewSearchIndex: v2Contract.share.getViewSearchIndex,
  })
  share() {
    return {
      buttonClickView: implement(v2Contract.share.buttonClickView).handler(async ({ input }) => {
        const result = await executeButtonClickShareViewEndpoint(
          input,
          async (shareId, recordId, fieldId) => {
            const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
            const buttonResult = await this.shareService.buttonClick(shareInfo, recordId, fieldId);
            return { ...buttonResult, runId: '' };
          }
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      copyView: implement(v2Contract.share.copyView).handler(async ({ input }) => {
        const result = await executeCopyShareViewEndpoint(input, async (shareId, query) => {
          const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
          return normalizeCopyVo(await this.shareService.copy(shareInfo, query as never));
        });

        if (result.status === 200) return result.body as ICopyShareViewOkResponseDto;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      formSubmitView: implement(v2Contract.share.formSubmitView).handler(async ({ input }) => {
        const result = await executeFormSubmitShareViewEndpoint(
          input,
          async (shareId, submitRo) => {
            const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
            return this.shareService.formSubmit(shareInfo, submitRo as never);
          }
        );

        if (result.status === 201) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getViewAggregations: implement(v2Contract.share.getViewAggregations).handler(
        async ({ input }) => {
          const result = await executeGetShareViewAggregationsEndpoint(
            input,
            async (shareId, query) => {
              const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
              return this.shareService.getViewAggregations(shareInfo, query);
            }
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      getView: implement(v2Contract.share.getView).handler(async ({ input }) => {
        const result = await executeGetShareViewEndpoint(input, async (shareId) => {
          const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
          return normalizeShareView(await this.shareService.getShareView(shareInfo));
        });

        if (result.status === 200) return result.body as IGetShareViewOkResponseDto;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getViewGroupPoints: implement(v2Contract.share.getViewGroupPoints).handler(
        async ({ input }) => {
          const result = await executeGetShareViewGroupPointsEndpoint(
            input,
            async (shareId, query) => {
              const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
              return this.shareService.getViewGroupPoints(shareInfo, query);
            }
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      getViewCalendarDailyCollection: implement(
        v2Contract.share.getViewCalendarDailyCollection
      ).handler(async ({ input }) => {
        const result = await executeGetShareViewCalendarDailyCollectionEndpoint(
          input,
          async (shareId, query) => {
            const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
            return this.shareService.getViewCalendarDailyCollection(shareInfo, query);
          }
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getViewLinkRecords: implement(v2Contract.share.getViewLinkRecords).handler(
        async ({ input }) => {
          const result = await executeGetShareViewLinkRecordsEndpoint(
            input,
            async (shareId, query) => {
              const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
              return this.shareService.getViewLinkRecords(shareInfo, query);
            }
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      getViewCollaborators: implement(v2Contract.share.getViewCollaborators).handler(
        async ({ input }) => {
          const result = await executeGetShareViewCollaboratorsEndpoint(
            input,
            async (shareId, query) => {
              const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
              return this.shareService.getViewCollaborators(shareInfo, query ?? {});
            }
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      getViewRowCount: implement(v2Contract.share.getViewRowCount).handler(async ({ input }) => {
        const result = await executeGetShareViewRowCountEndpoint(input, async (shareId, query) => {
          const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
          return this.shareService.getViewRowCount(shareInfo, query);
        });

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getViewRecords: implement(v2Contract.share.getViewRecords).handler(async ({ input }) => {
        const result = await executeGetShareViewRecordsEndpoint(input, async (shareId, query) => {
          const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
          return this.shareService.getViewRecords(shareInfo, query);
        });

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getViewSearchCount: implement(v2Contract.share.getViewSearchCount).handler(
        async ({ input }) => {
          const result = await executeGetShareViewSearchCountEndpoint(
            input,
            async (shareId, query) => {
              const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
              return this.shareService.getShareSearchCount(shareInfo.tableId, {
                ...query,
                viewId: shareInfo.view?.id,
              });
            }
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      getViewSearchIndex: implement(v2Contract.share.getViewSearchIndex).handler(
        async ({ input }) => {
          const result = await executeGetShareViewSearchIndexEndpoint(
            input,
            async (shareId, query) => {
              const shareInfo = await this.shareAuthService.getShareViewInfo(shareId);
              return this.shareService.getShareSearchIndex(shareInfo.tableId, {
                take: query?.take ?? 100,
                ...query,
                viewId: shareInfo.view?.id,
              });
            }
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
    };
  }

  @Implement({
    get: v2Contract.settings.get,
    getPublic: v2Contract.settings.getPublic,
  })
  settings() {
    return {
      get: implement(v2Contract.settings.get).handler(async ({ input }) => {
        const result = await executeGetSettingEndpoint(input, () =>
          this.settingOpenApiService.getSetting()
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getPublic: implement(v2Contract.settings.getPublic).handler(async ({ input }) => {
        const result = await executeGetPublicSettingEndpoint(input, () =>
          this.settingOpenApiService.getPublicSetting()
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
    };
  }

  @Implement({
    getById: v2Contract.templates.getById,
    getPermalink: v2Contract.templates.getPermalink,
    incrementVisit: v2Contract.templates.incrementVisit,
    listPublished: v2Contract.templates.listPublished,
  })
  templates() {
    return {
      getById: implement(v2Contract.templates.getById).handler(async ({ input }) => {
        const result = await executeGetTemplateByIdEndpoint(input, (templateId) =>
          this.templateOpenApiService
            .getTemplateDetailById(templateId)
            .then((template) => normalizeTemplateVo(template))
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getPermalink: implement(v2Contract.templates.getPermalink).handler(async ({ input }) => {
        const result = await executeGetTemplatePermalinkEndpoint(input, (identifier) =>
          this.templatePermalinkService.resolvePermalink(identifier)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      incrementVisit: implement(v2Contract.templates.incrementVisit).handler(async ({ input }) => {
        const result = await executeIncrementTemplateVisitEndpoint(input, (templateId) =>
          this.templateOpenApiService.incrementTemplateVisitCount(templateId)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      listPublished: implement(v2Contract.templates.listPublished).handler(async ({ input }) => {
        const result = await executeListPublishedTemplatesEndpoint(input, (query) =>
          this.templateOpenApiService
            .getPublishedTemplateList(query)
            .then((templates) => templates.map((template) => normalizeTemplateVo(template)))
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
    };
  }

  @Implement({
    aiCreateDraft: v2Contract.workflows.aiCreateDraft,
    applyUpdate: v2Contract.workflows.applyUpdate,
    activate: v2Contract.workflows.activate,
    create: v2Contract.workflows.create,
    deactivate: v2Contract.workflows.deactivate,
    list: v2Contract.workflows.list,
    update: v2Contract.workflows.update,
    delete: v2Contract.workflows.delete,
    duplicate: v2Contract.workflows.duplicate,
    getById: v2Contract.workflows.getById,
    getCapabilities: v2Contract.workflows.getCapabilities,
    listRuns: v2Contract.workflows.listRuns,
    getRun: v2Contract.workflows.getRun,
    testNode: v2Contract.workflows.testNode,
    triggerWebhook: v2Contract.workflows.triggerWebhook,
    triggerSchedule: v2Contract.workflows.triggerSchedule,
    triggerFormSubmitted: v2Contract.workflows.triggerFormSubmitted,
    triggerEmailReceived: v2Contract.workflows.triggerEmailReceived,
    testRun: v2Contract.workflows.testRun,
  })
  workflows() {
    return {
      aiCreateDraft: implement(v2Contract.workflows.aiCreateDraft).handler(async ({ input }) => {
        const result = await executeAiCreateDraftWorkflowEndpoint(
          input,
          this.workflowService.aiCreateWorkflowDraft.bind(this.workflowService)
        );

        if (result.status === 201) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      applyUpdate: implement(v2Contract.workflows.applyUpdate).handler(async ({ input }) => {
        const result = await executeApplyUpdateWorkflowEndpoint(
          input,
          this.workflowService.applyUpdateWorkflow.bind(this.workflowService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      activate: implement(v2Contract.workflows.activate).handler(async ({ input }) => {
        const result = await executeActivateWorkflowEndpoint(
          input,
          this.workflowService.activateWorkflow.bind(this.workflowService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      create: implement(v2Contract.workflows.create).handler(async ({ input }) => {
        const result = await executeCreateWorkflowEndpoint(
          input,
          this.workflowService.createWorkflow.bind(this.workflowService)
        );

        if (result.status === 201) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      deactivate: implement(v2Contract.workflows.deactivate).handler(async ({ input }) => {
        const result = await executeDeactivateWorkflowEndpoint(
          input,
          this.workflowService.deactivateWorkflow.bind(this.workflowService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      list: implement(v2Contract.workflows.list).handler(async ({ input }) => {
        const result = await executeListWorkflowsEndpoint(
          input,
          this.workflowService.getWorkflowList.bind(this.workflowService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      update: implement(v2Contract.workflows.update).handler(async ({ input }) => {
        const result = await executeUpdateWorkflowEndpoint(
          input,
          this.workflowService.updateWorkflow.bind(this.workflowService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      delete: implement(v2Contract.workflows.delete).handler(async ({ input }) => {
        const result = await executeDeleteWorkflowEndpoint(
          input,
          this.workflowService.deleteWorkflow.bind(this.workflowService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      duplicate: implement(v2Contract.workflows.duplicate).handler(async ({ input }) => {
        const result = await executeDuplicateWorkflowEndpoint(
          input,
          this.workflowService.duplicateWorkflow.bind(this.workflowService)
        );

        if (result.status === 201) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getById: implement(v2Contract.workflows.getById).handler(async ({ input }) => {
        const result = await executeGetWorkflowByIdEndpoint(
          input,
          this.workflowService.getWorkflow.bind(this.workflowService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getCapabilities: implement(v2Contract.workflows.getCapabilities).handler(
        async ({ input }) => {
          const result = await executeGetWorkflowCapabilitiesEndpoint(
            input,
            this.workflowCapabilityService.getCapabilities.bind(this.workflowCapabilityService)
          );

          if (result.status === 200) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      listRuns: implement(v2Contract.workflows.listRuns).handler(async ({ input }) => {
        const result = await executeListWorkflowRunsEndpoint(input, async (baseId, workflowId) => {
          const runs = await this.workflowService.getWorkflowRunList(baseId, workflowId);
          return runs.map((run) => normalizeWorkflowRun(run));
        });

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      getRun: implement(v2Contract.workflows.getRun).handler(async ({ input }) => {
        const result = await executeGetWorkflowRunEndpoint(
          input,
          this.workflowService.getWorkflowRun.bind(this.workflowService)
        );

        if (result.status === 200) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      testNode: implement(v2Contract.workflows.testNode).handler(async ({ input }) => {
        const result = await executeTestNodeWorkflowEndpoint(
          input,
          async (baseId, workflowId, nodeId, runInput) => {
            const run = await this.workflowService.createTestNodeRun(
              baseId,
              workflowId,
              nodeId,
              runInput
            );
            await this.workflowRunnerService.executeWorkflowRun(run.id);
            return normalizeWorkflowRunDetail(
              await this.workflowService.getWorkflowRun(baseId, workflowId, run.id)
            );
          }
        );

        if (result.status === 201) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      triggerWebhook: implement(v2Contract.workflows.triggerWebhook).handler(async ({ input }) => {
        const result = await executeTriggerWebhookWorkflowEndpoint(
          input,
          async (baseId, workflowId, body, webhookSecret) => {
            const run = await this.workflowService.createWebhookRun(workflowId, body, {
              secret: webhookSecret,
            });
            await this.workflowRunnerService.executeWorkflowRun(run.runId);
            return normalizeWorkflowRunDetail(
              await this.workflowService.getWorkflowRun(baseId, workflowId, run.runId)
            );
          }
        );

        if (result.status === 201) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
      triggerSchedule: implement(v2Contract.workflows.triggerSchedule).handler(
        async ({ input }) => {
          const result = await executeTriggerScheduleWorkflowEndpoint(
            input,
            async (baseId, workflowId, body) => {
              const run = await this.workflowService.createScheduleRun(workflowId, body);
              await this.workflowRunnerService.executeWorkflowRun(run.runId);
              return normalizeWorkflowRunDetail(
                await this.workflowService.getWorkflowRun(baseId, workflowId, run.runId)
              );
            }
          );

          if (result.status === 201) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      triggerFormSubmitted: implement(v2Contract.workflows.triggerFormSubmitted).handler(
        async ({ input }) => {
          const result = await executeTriggerFormSubmittedWorkflowEndpoint(
            input,
            async (baseId, workflowId, body) => {
              const run = await this.workflowService.createFormSubmittedRun(workflowId, body);
              await this.workflowRunnerService.executeWorkflowRun(run.runId);
              return normalizeWorkflowRunDetail(
                await this.workflowService.getWorkflowRun(baseId, workflowId, run.runId)
              );
            }
          );

          if (result.status === 201) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      triggerEmailReceived: implement(v2Contract.workflows.triggerEmailReceived).handler(
        async ({ input }) => {
          const result = await executeTriggerEmailReceivedWorkflowEndpoint(
            input,
            async (baseId, workflowId, body) => {
              const run = await this.workflowService.createEmailReceivedRun(workflowId, body);
              await this.workflowRunnerService.executeWorkflowRun(run.runId);
              return normalizeWorkflowRunDetail(
                await this.workflowService.getWorkflowRun(baseId, workflowId, run.runId)
              );
            }
          );

          if (result.status === 201) return result.body;

          return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
        }
      ),
      testRun: implement(v2Contract.workflows.testRun).handler(async ({ input }) => {
        const result = await executeTestRunWorkflowEndpoint(
          input,
          async (baseId, workflowId, runInput) => {
            const run = await this.workflowService.createTestRun(baseId, workflowId, runInput);
            await this.workflowRunnerService.executeWorkflowRun(run.id);
            return normalizeWorkflowRunDetail(
              await this.workflowService.getWorkflowRun(baseId, workflowId, run.id)
            );
          }
        );

        if (result.status === 201) return result.body;

        return throwOrpcErrorByStatus(result.status, getErrorMessage(result.body.error));
      }),
    };
  }
}
