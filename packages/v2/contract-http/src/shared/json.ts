import { z } from 'zod';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue | undefined };

export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
);

export const toJsonValue = (value: unknown): JsonValue | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => toJsonValue(item) ?? null);
  }

  if (typeof value === 'object') {
    const serialized: Record<string, JsonValue> = {};
    for (const [key, nested] of Object.entries(value)) {
      const serializedNested = toJsonValue(nested);
      if (serializedNested !== undefined) {
        serialized[key] = serializedNested;
      }
    }
    return serialized;
  }

  return String(value);
};
