import type { CallHandler, ExecutionContext } from '@nestjs/common';
import type * as OpenTelemetryApi from '@opentelemetry/api';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import {
  TEABLE_REQUEST_ATTRIBUTION,
  V2IndicatorInterceptor,
  X_TEABLE_V2_FEATURE_HEADER,
  X_TEABLE_V2_HEADER,
  X_TEABLE_V2_REASON_HEADER,
} from './v2-indicator.interceptor';

const teableV2EnabledAttribute = 'teable.v2.enabled';
const teableV2ReasonAttribute = 'teable.v2.reason';
const teableV2FeatureAttribute = 'teable.v2.feature';

const { getActiveSpan, sentryScope } = vi.hoisted(() => ({
  getActiveSpan: vi.fn(),
  sentryScope: { setTag: vi.fn() },
}));

vi.mock('@opentelemetry/api', async () => {
  const actual = await vi.importActual<typeof OpenTelemetryApi>('@opentelemetry/api');
  return {
    ...actual,
    trace: {
      ...actual.trace,
      getActiveSpan,
    },
  };
});

vi.mock('@sentry/nestjs', () => ({
  getCurrentScope: () => sentryScope,
  getIsolationScope: () => sentryScope,
  getCurrentHub: () => ({ getScope: () => sentryScope }),
}));

describe('V2IndicatorInterceptor', () => {
  it('records request attribution separately from v2 route tags', () => {
    const setAttributes = vi.fn();
    getActiveSpan.mockReturnValue({ setAttributes });
    sentryScope.setTag.mockReset();

    const cls = {
      get: vi.fn((key: string) => {
        const values: Record<string, unknown> = {
          useV2: true,
          v2Reason: 'canary',
          v2Feature: 'createRecord',
        };
        return values[key];
      }),
    };

    const response = { setHeader: vi.fn() };
    const request = {
      method: 'POST',
      path: '/api/table/tbl123/record',
      params: { tableId: 'tbl123' },
    };
    const context = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
    const next = { handle: () => of('ok') } as CallHandler;

    const interceptor = new V2IndicatorInterceptor(cls as never);
    interceptor.intercept(context, next).subscribe();

    expect(response.setHeader).toHaveBeenCalledWith(X_TEABLE_V2_HEADER, 'true');
    expect(response.setHeader).toHaveBeenCalledWith(X_TEABLE_V2_REASON_HEADER, 'canary');
    expect(response.setHeader).toHaveBeenCalledWith(X_TEABLE_V2_FEATURE_HEADER, 'createRecord');
    expect(setAttributes).toHaveBeenCalledWith({
      [TEABLE_REQUEST_ATTRIBUTION]: 'v2',
      [teableV2EnabledAttribute]: true,
      [teableV2ReasonAttribute]: 'canary',
      [teableV2FeatureAttribute]: 'createRecord',
    });
    expect(sentryScope.setTag).toHaveBeenCalledWith(TEABLE_REQUEST_ATTRIBUTION, 'v2');
  });
});
