/* eslint-disable @typescript-eslint/naming-convention */
import type {
  RequestFilteringHttpAgent,
  RequestFilteringHttpsAgent,
} from 'request-filtering-agent';
import { globalHttpAgent, globalHttpsAgent } from 'request-filtering-agent';

const SAFE_AGENTS = { httpAgent: globalHttpAgent, httpsAgent: globalHttpsAgent };

/**
 * Returns SSRF-safe HTTP agents for use with axios.
 * SSRF protection is always enabled and cannot be fully disabled.
 *
 * Usage: `axios.get(url, { ...getSsrfSafeAgents() })`
 */
export function getSsrfSafeAgents(): {
  httpAgent: RequestFilteringHttpAgent;
  httpsAgent: RequestFilteringHttpsAgent;
} {
  return SAFE_AGENTS;
}
