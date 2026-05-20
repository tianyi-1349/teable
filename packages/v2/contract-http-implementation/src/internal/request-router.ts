export type V2CapabilityRoute = 'full' | 'partial' | 'v1';

export interface IFeatureFlags {
  isEnabled(flag: string): boolean;
}

export type V2RouteExecutor<TInput = unknown, TResult = unknown> = (
  input: TInput
) => Promise<TResult>;

export type V1RouteExecutor<TInput = unknown, TResult = unknown> = (
  input: TInput
) => Promise<TResult>;

export interface IRequestRouterOptions {
  capability: Record<string, Record<string, V2CapabilityRoute>>;
  featureFlags?: IFeatureFlags;
}

export class RequestRouter {
  private readonly capability: Record<string, Record<string, V2CapabilityRoute>>;
  private readonly featureFlags?: IFeatureFlags;

  constructor(options: IRequestRouterOptions) {
    this.capability = options.capability;
    this.featureFlags = options.featureFlags;
  }

  route<TInput = unknown, TResult = unknown>(
    domain: string,
    operation: string,
    v2Executor: V2RouteExecutor<TInput, TResult>,
    v1Executor?: V1RouteExecutor<TInput, TResult>
  ): V2RouteExecutor<TInput, TResult> {
    return async (input: TInput) => {
      const capability = this.capability[domain]?.[operation] ?? 'v1';
      if (capability === 'full') {
        return v2Executor(input);
      }
      if (capability === 'partial' && this.featureFlags?.isEnabled(`v2-${domain}`)) {
        return v2Executor(input);
      }
      if (v1Executor) {
        return v1Executor(input);
      }
      return v2Executor(input);
    };
  }
}
