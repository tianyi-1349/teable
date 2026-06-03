import { describe, expect, it } from 'vitest';
import {
  buildScheduleTriggerConfig,
  filterWorkflowRuns,
  getScheduleNextRunAt,
  getScheduleNextRunPreview,
  getScheduleNextRunList,
  getScheduleRunPreviewList,
  getWebhookAuditSummaryItems,
  getWorkflowWebhookAuditItemSummaryItems,
  getWorkflowRunSummaryItems,
  parseScheduleCron,
} from './Pages';

const scheduleCron = '30 8 * * *';
const scheduleTimezone = 'Asia/Shanghai';
const scheduleRunAtDraft = '2026-05-31T08:30';
const scheduleNow = new Date('2026-05-31T00:00:00.000Z');
const scheduleIntervalSeconds = '60';
const previewIntervalSeconds = '120';
const scheduleRunAtIso = '2026-05-31T08:30:00.000Z';
const juneSecondRunAtIso = '2026-06-02T08:30:00.000Z';
const automationPageYes = 'automation.page.yes';
const runId2 = 'run-2';
const runId3 = 'run-3';

describe('Automation Pages schedule config', () => {
  it('keeps cron timezone in trigger config', () => {
    expect(
      buildScheduleTriggerConfig('cron', scheduleIntervalSeconds, scheduleCron, scheduleTimezone)
    ).toEqual({
      mode: 'cron',
      cron: scheduleCron,
      timezone: scheduleTimezone,
    });
  });

  it('keeps interval config numeric and schedule-only', () => {
    expect(
      buildScheduleTriggerConfig('interval', previewIntervalSeconds, scheduleCron, scheduleTimezone)
    ).toEqual({
      mode: 'interval',
      intervalSeconds: 120,
    });
  });

  it('normalizes one-time schedule runAt values', () => {
    expect(
      buildScheduleTriggerConfig(
        'oneTime',
        scheduleIntervalSeconds,
        scheduleCron,
        scheduleTimezone,
        scheduleRunAtDraft
      )
    ).toEqual({
      mode: 'oneTime',
      runAt: scheduleRunAtIso,
    });
  });

  it('shows next-run previews for interval and one-time schedules', () => {
    expect(
      getScheduleNextRunPreview(
        'interval',
        previewIntervalSeconds,
        scheduleCron,
        scheduleTimezone,
        '',
        scheduleNow
      )
    ).not.toBe('-');
    expect(
      getScheduleNextRunPreview(
        'oneTime',
        scheduleIntervalSeconds,
        scheduleCron,
        scheduleTimezone,
        scheduleRunAtDraft,
        scheduleNow
      )
    ).not.toBe('-');
  });

  it('shows bounded upcoming run previews for schedules', () => {
    expect(
      getScheduleRunPreviewList(
        'interval',
        previewIntervalSeconds,
        scheduleCron,
        scheduleTimezone,
        '',
        scheduleNow,
        3
      )
    ).toHaveLength(3);

    expect(
      getScheduleRunPreviewList(
        'oneTime',
        scheduleIntervalSeconds,
        scheduleCron,
        scheduleTimezone,
        scheduleRunAtDraft,
        scheduleNow
      )
    ).toHaveLength(1);

    expect(
      getScheduleRunPreviewList(
        'cron',
        scheduleIntervalSeconds,
        scheduleCron,
        'UTC',
        scheduleRunAtDraft,
        scheduleNow,
        3
      )
    ).toHaveLength(3);
  });

  it('calculates cron next runs with the same five-part cron rules as the scheduler', () => {
    expect(parseScheduleCron('*/15 8-9 * * 1-5')).toBeDefined();
    expect(parseScheduleCron('* * *')).toBeUndefined();

    const config = buildScheduleTriggerConfig('cron', scheduleIntervalSeconds, scheduleCron, 'UTC');

    expect(getScheduleNextRunAt(config, new Date('2026-05-31T08:29:00.000Z'))).toBe(
      scheduleRunAtIso
    );
    expect(getScheduleNextRunList(config, new Date('2026-05-31T08:29:00.000Z'), 3)).toEqual([
      scheduleRunAtIso,
      '2026-06-01T08:30:00.000Z',
      juneSecondRunAtIso,
    ]);
  });
});

describe('Automation Pages webhook audit', () => {
  const t = (key: string) => key;

  it('surfaces custom webhook signature header metadata', () => {
    const items = getWebhookAuditSummaryItems(
      {
        __automationContext: {
          webhook: {
            bodySizeBytes: 128,
            signatureRequired: true,
            signatureVerified: true,
            timestampHeaderPresent: true,
            signatureHeader: 'x-custom-signature',
            timestampHeader: 'x-custom-timestamp',
            rateLimit: 60,
          },
        },
      },
      t
    );

    expect(items).toEqual([
      {
        label: 'automation.page.webhookSignatureHeader',
        value: 'x-custom-signature',
      },
      {
        label: 'automation.page.webhookTimestampHeader',
        value: 'x-custom-timestamp',
      },
      {
        label: 'automation.page.webhookSignatureRequired',
        value: automationPageYes,
      },
      {
        label: 'automation.page.webhookSignatureVerified',
        value: automationPageYes,
      },
      {
        label: 'automation.page.webhookTimestampHeaderPresent',
        value: automationPageYes,
      },
      {
        label: 'automation.page.webhookBodySizeBytes',
        value: '128',
      },
      {
        label: 'automation.page.webhookRateLimit',
        value: '60',
      },
    ]);
  });

  it('surfaces webhook audit summary counts', () => {
    const items = getWorkflowRunSummaryItems(
      {
        totalRuns: 3,
        webhookRuns: 2,
        signatureRequiredRuns: 2,
        signatureVerifiedRuns: 1,
        signatureFailedRuns: 1,
        timestampHeaderPresentRuns: 1,
        timestampHeaderMissingRuns: 1,
        rateLimitedRuns: 1,
        averageBodySizeBytes: 80,
        maxBodySizeBytes: 128,
        latestWebhookRunAt: juneSecondRunAtIso,
      },
      t
    );

    expect(items.map((item) => item.label)).toEqual([
      'automation.page.webhookAuditTotalRuns',
      'automation.page.webhookAuditWebhookRuns',
      'automation.page.webhookAuditSignatureRequiredRuns',
      'automation.page.webhookAuditSignatureVerifiedRuns',
      'automation.page.webhookAuditSignatureFailedRuns',
      'automation.page.webhookAuditTimestampHeaderRuns',
      'automation.page.webhookAuditTimestampHeaderMissingRuns',
      'automation.page.webhookAuditRateLimitedRuns',
      'automation.page.webhookAuditAverageBodySizeBytes',
      'automation.page.webhookAuditMaxBodySizeBytes',
      'automation.page.webhookAuditLatestWebhookRun',
    ]);
    expect(items.map((item) => item.value)).toEqual([
      '3',
      '2',
      '2',
      '1',
      '1',
      '1',
      '1',
      '1',
      '80',
      '128',
      expect.any(String),
    ]);
  });

  it('surfaces webhook audit detail item fields', () => {
    const items = getWorkflowWebhookAuditItemSummaryItems(
      {
        runId: 'run-webhook-1',
        status: 'succeeded',
        startedTime: juneSecondRunAtIso,
        signatureRequired: true,
        signatureVerified: false,
        timestampHeaderPresent: true,
        bodySizeBytes: 128,
        rateLimit: 60,
      },
      t
    );

    expect(items).toEqual([
      {
        label: 'automation.page.webhookSignatureRequired',
        value: automationPageYes,
      },
      {
        label: 'automation.page.webhookSignatureVerified',
        value: 'automation.page.no',
      },
      {
        label: 'automation.page.webhookTimestampHeaderPresent',
        value: automationPageYes,
      },
      {
        label: 'automation.page.webhookBodySizeBytes',
        value: '128',
      },
      {
        label: 'automation.page.webhookRateLimit',
        value: '60',
      },
    ]);
  });
});

describe('Automation Pages run history filters', () => {
  const runs = [
    { id: 'run-1', triggerType: 'schedule', status: 'succeeded', input: {} },
    {
      id: runId2,
      triggerType: 'webhook',
      status: 'failed',
      input: {
        __automationContext: {
          webhook: {
            signatureRequired: true,
            signatureVerified: false,
            timestampHeaderPresent: true,
            rateLimit: 60,
          },
        },
      },
    },
    {
      id: runId3,
      triggerType: 'webhook',
      status: 'succeeded',
      input: {
        __automationContext: {
          webhook: {
            signatureRequired: true,
            signatureVerified: true,
            timestampHeaderPresent: true,
          },
        },
      },
    },
  ];

  it('filters runs by trigger type', () => {
    expect(filterWorkflowRuns(runs, 'webhook', 'all').map((run) => run.id)).toEqual([
      runId2,
      runId3,
    ]);
  });

  it('filters runs by trigger type and status', () => {
    expect(filterWorkflowRuns(runs, 'webhook', 'failed').map((run) => run.id)).toEqual([runId2]);
  });

  it('returns an empty list when filters have no matching runs', () => {
    expect(filterWorkflowRuns(runs, 'schedule', 'failed')).toEqual([]);
  });

  it('filters webhook runs by audit metadata', () => {
    expect(
      filterWorkflowRuns(runs, 'webhook', 'all', 'signatureVerified').map((run) => run.id)
    ).toEqual([runId3]);
    expect(filterWorkflowRuns(runs, 'webhook', 'all', 'rateLimited').map((run) => run.id)).toEqual([
      runId2,
    ]);
  });
});
