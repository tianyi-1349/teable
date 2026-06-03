import { createHmac } from 'crypto';

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

export const createWorkflowWebhookSignatureHeaders = (input: {
  secret: string;
  rawBody: string;
  timestamp?: string;
  signatureHeader?: string;
  timestampHeader?: string;
}) => {
  const timestamp = input.timestamp ?? `${Math.floor(Date.now() / 1000)}`;
  const signatureHeader = input.signatureHeader?.trim() || 'x-webhook-signature';
  const timestampHeader = input.timestampHeader?.trim() || 'x-webhook-timestamp';
  return {
    [signatureHeader]: `sha256=${createWorkflowWebhookSignature({
      secret: input.secret,
      rawBody: input.rawBody,
      timestamp,
    })}`,
    [timestampHeader]: timestamp,
  };
};
