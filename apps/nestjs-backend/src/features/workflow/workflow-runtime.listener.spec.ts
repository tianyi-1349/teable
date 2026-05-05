import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkflowRuntimeListener } from './workflow-runtime.listener';

vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');

  return {
    ...actual,
    default: {
      ...actual.default,
      request: vi.fn(),
    },
  };
});

describe('WorkflowRuntimeListener', () => {
  const workflowService = {
    getWorkflowRuntimeById: vi.fn(),
    getTableBaseId: vi.fn(),
  };

  const workflowExecutionService = {
    createExecution: vi.fn(),
    updateExecutionSteps: vi.fn(),
    markExecutionSucceeded: vi.fn(),
    markExecutionFailed: vi.fn(),
  };

  const recordOpenApiService = {
    multipleCreateRecords: vi.fn(),
    updateRecord: vi.fn(),
  };

  const aiService = {
    previewExtractAndWrite: vi.fn(),
    applyExtractAndWrite: vi.fn(),
  };

  let listener: WorkflowRuntimeListener;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.request).mockResolvedValue({ status: 200 } as never);
    workflowService.getTableBaseId.mockResolvedValue({ baseId: 'bse123' });
    listener = new WorkflowRuntimeListener(
      workflowService as never,
      workflowExecutionService as never,
      recordOpenApiService as never,
      aiService as never
    );
  });

  it('should execute createRecord and updateRecord actions before completing execution', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      trigger: { type: 'buttonClick' },
      actions: [
        {
          type: 'createRecord',
          config: {
            tableId: 'tblTarget',
            fields: { Status: 'Queued' },
          },
        },
        {
          type: 'updateRecord',
          config: {
            tableId: 'tbl123',
            fields: { Status: 'Done' },
          },
        },
      ],
    });
    workflowExecutionService.createExecution.mockResolvedValue({ id: 'exe123' });

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: { id: 'rec123', fields: {} },
    });

    expect(workflowExecutionService.createExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        workflowId: 'wfl123',
        baseId: 'bse123',
        triggerType: 'buttonClick',
        actionCount: 2,
        eventPayload: {
          tableId: 'tbl123',
          fieldId: 'fld123',
          recordId: 'rec123',
        },
      })
    );
    expect(recordOpenApiService.multipleCreateRecords).toHaveBeenCalledWith(
      'tblTarget',
      {
        fieldKeyType: 'id',
        records: [{ fields: { Status: 'Queued' } }],
      },
      false,
      'true'
    );
    expect(recordOpenApiService.updateRecord).toHaveBeenCalledWith(
      'tbl123',
      'rec123',
      {
        fieldKeyType: 'id',
        record: { fields: { Status: 'Done' } },
      },
      undefined,
      'true'
    );
    expect(workflowExecutionService.updateExecutionSteps).toHaveBeenCalledTimes(4);
    expect(workflowExecutionService.updateExecutionSteps).toHaveBeenNthCalledWith(1, 'exe123', [
      expect.objectContaining({
        actionType: 'createRecord',
        status: 'running',
      }),
    ]);
    expect(workflowExecutionService.updateExecutionSteps).toHaveBeenNthCalledWith(2, 'exe123', [
      expect.objectContaining({
        actionType: 'createRecord',
        status: 'succeeded',
      }),
    ]);
    expect(workflowExecutionService.markExecutionSucceeded).toHaveBeenCalledWith('exe123');
  });

  it('should mark execution failed when updateRecord cannot resolve a target record', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      trigger: { type: 'buttonClick' },
      actions: [
        {
          type: 'updateRecord',
          config: {
            tableId: 'tblOther',
            fields: { Status: 'Done' },
          },
        },
      ],
    });
    workflowExecutionService.createExecution.mockResolvedValue({ id: 'exe123' });

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: { id: 'rec123', fields: {} },
    });

    expect(workflowExecutionService.markExecutionFailed).toHaveBeenCalledWith(
      'exe123',
      expect.stringContaining('requires recordId or same-table target')
    );
    expect(workflowExecutionService.updateExecutionSteps).toHaveBeenLastCalledWith('exe123', [
      expect.objectContaining({
        actionType: 'updateRecord',
        status: 'failed',
      }),
    ]);
  });

  it('should skip missing or inactive workflow', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue(null);

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: { id: 'rec123', fields: {} },
    });

    expect(workflowExecutionService.createExecution).not.toHaveBeenCalled();
  });

  it('should skip actions when workflow conditions do not match', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      trigger: { type: 'buttonClick' },
      conditions: [
        {
          field: 'Status',
          operator: 'eq',
          value: 'Approved',
        },
      ],
      actions: [
        {
          type: 'createRecord',
          config: {
            tableId: 'tblTarget',
            fields: { Status: 'Queued' },
          },
        },
      ],
    });
    workflowExecutionService.createExecution.mockResolvedValue({ id: 'exe123' });

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: { id: 'rec123', fields: { Status: 'Pending' } },
    });

    expect(recordOpenApiService.multipleCreateRecords).not.toHaveBeenCalled();
    expect(recordOpenApiService.updateRecord).not.toHaveBeenCalled();
    expect(workflowExecutionService.updateExecutionSteps).not.toHaveBeenCalled();
    expect(workflowExecutionService.markExecutionSucceeded).toHaveBeenCalledWith('exe123');
  });

  it('should execute httpRequest with SSRF-safe agents when conditions match', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      trigger: { type: 'buttonClick' },
      conditions: [
        {
          field: 'Tags',
          operator: 'doesNotContain',
          value: 'blocked',
        },
        {
          field: 'Owner',
          operator: 'isNotEmpty',
        },
      ],
      actions: [
        {
          type: 'httpRequest',
          config: {
            method: 'post',
            url: 'https://example.com/hooks/run',
            headers: { 'X-Test': 'yes' },
            body: { hello: 'world' },
          },
        },
      ],
    });
    workflowExecutionService.createExecution.mockResolvedValue({ id: 'exe123' });

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: { id: 'rec123', fields: { Tags: ['ok'], Owner: 'usr123' } },
    });

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://example.com/hooks/run',
        method: 'POST',
        data: { hello: 'world' },
        headers: { 'X-Test': 'yes' },
        timeout: 10000,
        httpAgent: expect.anything(),
        httpsAgent: expect.anything(),
      })
    );
    expect(workflowExecutionService.updateExecutionSteps).toHaveBeenLastCalledWith('exe123', [
      expect.objectContaining({
        actionType: 'httpRequest',
        status: 'succeeded',
      }),
    ]);
    expect(workflowExecutionService.markExecutionSucceeded).toHaveBeenCalledWith('exe123');
  });

  it('should execute legacy ai action against the trigger record', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      trigger: { type: 'buttonClick' },
      actions: [
        {
          type: 'ai',
          config: {
            prompt: 'Summarize the current record into one sentence',
            targetFieldId: 'fldSummary',
          },
        },
      ],
    });
    workflowExecutionService.createExecution.mockResolvedValue({ id: 'exe123' });
    aiService.previewExtractAndWrite.mockResolvedValue({
      action: 'update',
      tableId: 'tbl123',
      recordId: 'rec123',
      fields: [
        {
          fieldId: 'fldSummary',
          name: 'Summary',
          type: 'singleLineText',
          status: 'filled',
          value: 'Queued summary',
        },
      ],
      warnings: [],
    });
    aiService.applyExtractAndWrite.mockResolvedValue({
      operation: { action: 'update', tableId: 'tbl123', records: [] },
      appliedFieldIds: ['fldSummary'],
    });

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: {
        id: 'rec123',
        fields: {
          Title: 'Acme Contract',
          Status: 'Pending',
        },
      },
    });

    expect(aiService.previewExtractAndWrite).toHaveBeenCalledWith(
      'bse123',
      expect.objectContaining({
        tableId: 'tbl123',
        recordId: 'rec123',
        fieldIds: ['fldSummary'],
        instructions: 'Summarize the current record into one sentence',
      })
    );
    expect(aiService.previewExtractAndWrite.mock.calls[0]?.[1]?.sourceText).toContain(
      'Title: Acme Contract'
    );
    expect(aiService.previewExtractAndWrite.mock.calls[0]?.[1]?.sourceText).toContain(
      'Status: Pending'
    );
    expect(aiService.applyExtractAndWrite).toHaveBeenCalledWith('bse123', {
      tableId: 'tbl123',
      recordId: 'rec123',
      fields: [
        {
          fieldId: 'fldSummary',
          name: 'Summary',
          type: 'singleLineText',
          status: 'filled',
          value: 'Queued summary',
        },
      ],
    });
  });

  it('should execute structured ai action and create a new record when no target record is resolved', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      trigger: { type: 'buttonClick' },
      actions: [
        {
          type: 'ai',
          config: {
            tableId: 'tblTarget',
            sourceFieldId: 'fldAttachmentText',
            instructions: 'Extract contract metadata',
            fieldIds: ['fldVendor', 'fldAmount'],
          },
        },
      ],
    });
    workflowExecutionService.createExecution.mockResolvedValue({ id: 'exe123' });
    aiService.previewExtractAndWrite.mockResolvedValue({
      action: 'create',
      tableId: 'tblTarget',
      fields: [
        {
          fieldId: 'fldVendor',
          name: 'Vendor',
          type: 'singleLineText',
          status: 'filled',
          value: 'Acme',
        },
      ],
      warnings: [],
    });
    aiService.applyExtractAndWrite.mockResolvedValue({
      operation: { action: 'create', tableId: 'tblTarget', records: [] },
      appliedFieldIds: ['fldVendor'],
    });

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: {
        id: 'rec123',
        fields: {
          fldAttachmentText: 'Vendor: Acme\nAmount: 2000',
        },
      },
    });

    expect(aiService.previewExtractAndWrite).toHaveBeenCalledWith('bse123', {
      tableId: 'tblTarget',
      recordId: undefined,
      sourceText: 'Vendor: Acme\nAmount: 2000',
      instructions: 'Extract contract metadata',
      fieldIds: ['fldVendor', 'fldAmount'],
      modelKey: undefined,
    });
    expect(aiService.applyExtractAndWrite).toHaveBeenCalledWith('bse123', {
      tableId: 'tblTarget',
      recordId: undefined,
      fields: [
        {
          fieldId: 'fldVendor',
          name: 'Vendor',
          type: 'singleLineText',
          status: 'filled',
          value: 'Acme',
        },
      ],
    });
  });

  it('should mark execution failed when ai apply has no valid fields to write', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      trigger: { type: 'buttonClick' },
      actions: [
        {
          type: 'ai',
          config: {
            sourceFieldId: 'fldSource',
            fieldIds: ['fldSummary'],
            instructions: 'Summarize the source field',
          },
        },
      ],
    });
    workflowExecutionService.createExecution.mockResolvedValue({ id: 'exe123' });
    aiService.previewExtractAndWrite.mockResolvedValue({
      action: 'update',
      tableId: 'tbl123',
      recordId: 'rec123',
      fields: [
        {
          fieldId: 'fldSummary',
          name: 'Summary',
          type: 'singleLineText',
          status: 'invalid',
          value: null,
          reason: 'AI returned a value that does not match the field type.',
        },
      ],
      warnings: ['AI did not return any valid writable values for the selected fields.'],
    });
    aiService.applyExtractAndWrite.mockRejectedValue(new Error('No valid fields to apply'));

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: {
        id: 'rec123',
        fields: {
          fldSource: 'Bad source text',
        },
      },
    });

    expect(aiService.previewExtractAndWrite).toHaveBeenCalledWith('bse123', {
      tableId: 'tbl123',
      recordId: 'rec123',
      sourceText: 'Bad source text',
      instructions: 'Summarize the source field',
      fieldIds: ['fldSummary'],
      modelKey: undefined,
    });
    expect(workflowExecutionService.updateExecutionSteps).toHaveBeenLastCalledWith('exe123', [
      expect.objectContaining({
        actionType: 'ai',
        status: 'failed',
        errorMessage: 'No valid fields to apply',
      }),
    ]);
    expect(workflowExecutionService.markExecutionFailed).toHaveBeenCalledWith(
      'exe123',
      'No valid fields to apply'
    );
  });

  it('should mark execution failed when ai action is missing target fields', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      trigger: { type: 'buttonClick' },
      actions: [
        {
          type: 'ai',
          config: {
            prompt: 'Summarize the record',
          },
        },
      ],
    });
    workflowExecutionService.createExecution.mockResolvedValue({ id: 'exe123' });

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: { id: 'rec123', fields: { Title: 'Contract' } },
    });

    expect(aiService.previewExtractAndWrite).not.toHaveBeenCalled();
    expect(workflowExecutionService.updateExecutionSteps).toHaveBeenLastCalledWith('exe123', [
      expect.objectContaining({
        actionType: 'ai',
        status: 'failed',
        errorMessage: 'Workflow action ai requires fieldIds or targetFieldId',
      }),
    ]);
    expect(workflowExecutionService.markExecutionFailed).toHaveBeenCalledWith(
      'exe123',
      'Workflow action ai requires fieldIds or targetFieldId'
    );
  });

  it('should execute structured ai action for attachment update using target record field', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      trigger: { type: 'buttonClick' },
      actions: [
        {
          type: 'ai',
          config: {
            tableId: 'tblTarget',
            sourceFieldId: 'fldSourceText',
            instructions: 'Extract updated screenshots and keep matching originals',
            fieldIds: ['fldAttachment'],
            targetFieldId: 'fldTargetRecord',
            modelKey: 'openai@gpt-4o@teable',
          },
        },
      ],
    });
    workflowExecutionService.createExecution.mockResolvedValue({ id: 'exe123' });
    aiService.previewExtractAndWrite.mockResolvedValue({
      action: 'update',
      tableId: 'tblTarget',
      recordId: 'recTarget1',
      fields: [
        {
          fieldId: 'fldAttachment',
          name: 'Screenshots',
          type: 'attachment',
          status: 'filled',
          value: ['https://cdn.example.com/new-proof.png'],
          existingAttachments: [
            {
              id: 'actExisting1',
              name: 'old-proof.png',
              url: 'https://cdn.example.com/old-proof.png',
            },
          ],
          keepExistingAttachmentIds: ['actExisting1'],
        },
      ],
      warnings: [],
    });
    aiService.applyExtractAndWrite.mockResolvedValue({
      operation: { action: 'update', tableId: 'tblTarget', records: [] },
      appliedFieldIds: ['fldAttachment'],
    });

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: {
        id: 'rec123',
        fields: {
          fldSourceText: 'Keep the previous proof and add the latest screenshot',
          fldTargetRecord: { id: 'recTarget1' },
        },
      },
    });

    expect(aiService.previewExtractAndWrite).toHaveBeenCalledWith('bse123', {
      tableId: 'tblTarget',
      recordId: 'recTarget1',
      sourceText: 'Keep the previous proof and add the latest screenshot',
      instructions: 'Extract updated screenshots and keep matching originals',
      fieldIds: ['fldAttachment'],
      modelKey: 'openai@gpt-4o@teable',
    });
    expect(aiService.applyExtractAndWrite).toHaveBeenCalledWith('bse123', {
      tableId: 'tblTarget',
      recordId: 'recTarget1',
      fields: [
        {
          fieldId: 'fldAttachment',
          name: 'Screenshots',
          type: 'attachment',
          status: 'filled',
          value: ['https://cdn.example.com/new-proof.png'],
          existingAttachments: [
            {
              id: 'actExisting1',
              name: 'old-proof.png',
              url: 'https://cdn.example.com/old-proof.png',
            },
          ],
          keepExistingAttachmentIds: ['actExisting1'],
        },
      ],
    });
    expect(workflowExecutionService.markExecutionSucceeded).toHaveBeenCalledWith('exe123');
  });

  it('should mark execution failed when httpRequest uses an unsupported protocol', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      trigger: { type: 'buttonClick' },
      actions: [
        {
          type: 'httpRequest',
          config: {
            method: 'POST',
            url: 'ftp://example.com/hooks/run',
          },
        },
      ],
    });
    workflowExecutionService.createExecution.mockResolvedValue({ id: 'exe123' });

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: { id: 'rec123', fields: {} },
    });

    expect(axios.request).not.toHaveBeenCalled();
    expect(workflowExecutionService.updateExecutionSteps).toHaveBeenLastCalledWith('exe123', [
      expect.objectContaining({
        actionType: 'httpRequest',
        status: 'failed',
      }),
    ]);
    expect(workflowExecutionService.markExecutionFailed).toHaveBeenCalledWith(
      'exe123',
      expect.stringContaining('only supports HTTP or HTTPS URLs')
    );
  });

  it('should mark execution failed when httpRequest action config is missing url', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      trigger: { type: 'buttonClick' },
      actions: [
        {
          type: 'httpRequest',
          config: {
            method: 'POST',
          },
        },
      ],
    });
    workflowExecutionService.createExecution.mockResolvedValue({ id: 'exe123' });

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: { id: 'rec123', fields: {} },
    });

    expect(axios.request).not.toHaveBeenCalled();
    expect(workflowExecutionService.markExecutionFailed).toHaveBeenCalledWith(
      'exe123',
      expect.stringContaining('config validation failed')
    );
  });

  it('should mark execution failed when createRecord action config is missing tableId', async () => {
    workflowService.getWorkflowRuntimeById.mockResolvedValue({
      id: 'wfl123',
      baseId: 'bse123',
      isActive: true,
      trigger: { type: 'buttonClick' },
      actions: [
        {
          type: 'createRecord',
          config: {
            fields: { Status: 'Queued' },
          },
        },
      ],
    });
    workflowExecutionService.createExecution.mockResolvedValue({ id: 'exe123' });

    await listener.handleButtonClick({
      tableId: 'tbl123',
      fieldId: 'fld123',
      workflowId: 'wfl123',
      record: { id: 'rec123', fields: {} },
    });

    expect(recordOpenApiService.multipleCreateRecords).not.toHaveBeenCalled();
    expect(workflowExecutionService.markExecutionFailed).toHaveBeenCalledWith(
      'exe123',
      expect.stringContaining('config validation failed')
    );
  });
});
