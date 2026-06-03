import { createHmac, timingSafeEqual } from 'crypto';

export const DEFAULT_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 300;

export interface IWorkflowWebhookSignatureInput {
  secret: string;
  rawBody: string;
  timestamp: string;
}

export const buildWorkflowWebhookSignaturePayload = (input: {
  rawBody: string;
  timestamp: string;
}) => [input.timestamp, input.rawBody].join('.');

export const createWorkflowWebhookSignature = (input: IWorkflowWebhookSignatureInput) =>
  createHmac('sha256', input.secret)
    .update(
      buildWorkflowWebhookSignaturePayload({ rawBody: input.rawBody, timestamp: input.timestamp })
    )
    .digest('hex');

export const normalizeWorkflowWebhookSignature = (signature: string) =>
  signature.replace(/^sha256=/i, '');

export const isWorkflowWebhookSignatureMatch = (
  input: IWorkflowWebhookSignatureInput & {
    signature: string;
  }
) => {
  const actual = Buffer.from(normalizeWorkflowWebhookSignature(input.signature), 'hex');
  const expected = Buffer.from(createWorkflowWebhookSignature(input), 'hex');

  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

export const assertWorkflowWebhookTimestamp = (input: {
  timestamp: string;
  toleranceSeconds?: number;
  nowSeconds?: number;
}) => {
  const value = Number(input.timestamp);
  if (!Number.isFinite(value)) {
    return false;
  }

  const toleranceSeconds = input.toleranceSeconds ?? DEFAULT_WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS;
  if (toleranceSeconds <= 0) {
    return true;
  }

  const nowSeconds = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  return Math.abs(nowSeconds - value) <= toleranceSeconds;
};
