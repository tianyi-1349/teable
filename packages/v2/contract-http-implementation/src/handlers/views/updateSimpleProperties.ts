import {
  mapDomainErrorToHttpError,
  type IUpdateViewPropertyEndpointResult,
  updateViewDescriptionInputSchema,
  updateViewLockedInputSchema,
  updateViewNameInputSchema,
  updateViewOptionsInputSchema,
  updateViewOrderInputSchema,
  updateViewShareMetaInputSchema,
} from '@teable/v2-contract-http';
import { domainError } from '@teable/v2-core';

const okBody = {
  ok: true as const,
  data: {
    success: true as const,
  },
};

const invalid = (message: string): IUpdateViewPropertyEndpointResult => {
  const error = domainError.validation({ message });
  return { status: 400, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
};

const unexpected = (message: string): IUpdateViewPropertyEndpointResult => {
  const error = domainError.unexpected({ message });
  return { status: 500, body: { ok: false, error: mapDomainErrorToHttpError(error) } };
};

export const executeUpdateViewNameEndpoint = async (
  rawInput: unknown,
  updateViewName: (tableId: string, viewId: string, name: string) => Promise<void>
): Promise<IUpdateViewPropertyEndpointResult> => {
  const parsed = updateViewNameInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalid('Invalid UpdateViewName input');
  try {
    await updateViewName(parsed.data.tableId, parsed.data.viewId, parsed.data.name);
    return { status: 200, body: okBody };
  } catch (error) {
    return unexpected(error instanceof Error ? error.message : 'Failed to update view name');
  }
};

export const executeUpdateViewDescriptionEndpoint = async (
  rawInput: unknown,
  updateViewDescription: (tableId: string, viewId: string, description: string) => Promise<void>
): Promise<IUpdateViewPropertyEndpointResult> => {
  const parsed = updateViewDescriptionInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalid('Invalid UpdateViewDescription input');
  try {
    await updateViewDescription(parsed.data.tableId, parsed.data.viewId, parsed.data.description);
    return { status: 200, body: okBody };
  } catch (error) {
    return unexpected(error instanceof Error ? error.message : 'Failed to update view description');
  }
};

export const executeUpdateViewLockedEndpoint = async (
  rawInput: unknown,
  updateViewLocked: (
    tableId: string,
    viewId: string,
    isLocked: boolean | undefined
  ) => Promise<void>
): Promise<IUpdateViewPropertyEndpointResult> => {
  const parsed = updateViewLockedInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalid('Invalid UpdateViewLocked input');
  try {
    await updateViewLocked(parsed.data.tableId, parsed.data.viewId, parsed.data.isLocked);
    return { status: 200, body: okBody };
  } catch (error) {
    return unexpected(error instanceof Error ? error.message : 'Failed to update view locked');
  }
};

export const executeUpdateViewShareMetaEndpoint = async (
  rawInput: unknown,
  updateViewShareMeta: (tableId: string, viewId: string, shareMeta: unknown) => Promise<void>
): Promise<IUpdateViewPropertyEndpointResult> => {
  const parsed = updateViewShareMetaInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalid('Invalid UpdateViewShareMeta input');
  try {
    await updateViewShareMeta(parsed.data.tableId, parsed.data.viewId, parsed.data.shareMeta);
    return { status: 200, body: okBody };
  } catch (error) {
    return unexpected(error instanceof Error ? error.message : 'Failed to update view share meta');
  }
};

export const executeUpdateViewOptionsEndpoint = async (
  rawInput: unknown,
  updateViewOptions: (tableId: string, viewId: string, options: unknown) => Promise<void>
): Promise<IUpdateViewPropertyEndpointResult> => {
  const parsed = updateViewOptionsInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalid('Invalid UpdateViewOptions input');
  try {
    await updateViewOptions(parsed.data.tableId, parsed.data.viewId, parsed.data.options);
    return { status: 200, body: okBody };
  } catch (error) {
    return unexpected(error instanceof Error ? error.message : 'Failed to update view options');
  }
};

export const executeUpdateViewOrderEndpoint = async (
  rawInput: unknown,
  updateViewOrder: (
    tableId: string,
    viewId: string,
    order: { anchorId: string; position: 'before' | 'after' }
  ) => Promise<void>
): Promise<IUpdateViewPropertyEndpointResult> => {
  const parsed = updateViewOrderInputSchema.safeParse(rawInput);
  if (!parsed.success) return invalid('Invalid UpdateViewOrder input');
  try {
    await updateViewOrder(parsed.data.tableId, parsed.data.viewId, {
      anchorId: parsed.data.anchorId,
      position: parsed.data.position,
    });
    return { status: 200, body: okBody };
  } catch (error) {
    return unexpected(error instanceof Error ? error.message : 'Failed to update view order');
  }
};
