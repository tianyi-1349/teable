import { z } from '../zod';

export enum AiStreamErrorCode {
  StreamReadError = 'stream_read_error',
  StreamProxyError = 'stream_proxy_error',
  ProxyRequestError = 'proxy_request_error',
  ProxyResponseError = 'proxy_response_error',
}

export const nativeAICapabilitySchema = z.object({
  action: z.string(),
  enabled: z.boolean(),
  reason: z.string().optional(),
});

export type INativeAICapability = z.infer<typeof nativeAICapabilitySchema>;

export const getNativeAICapabilitiesQuerySchema = z.object({
  actions: z.array(z.string()).optional(),
  enabled: z.boolean().optional(),
});

export type IGetNativeAICapabilitiesQuery = z.infer<typeof getNativeAICapabilitiesQuerySchema>;

export const queryNativeAICapabilitiesRoSchema = z.object({
  actions: z.array(z.string()).optional(),
});

export type IQueryNativeAICapabilitiesRo = z.infer<typeof queryNativeAICapabilitiesRoSchema>;

export const nativeAICapabilitiesVoSchema = z.object({
  capabilities: z.array(nativeAICapabilitySchema),
});

export type INativeAICapabilitiesVo = z.infer<typeof nativeAICapabilitiesVoSchema>;
