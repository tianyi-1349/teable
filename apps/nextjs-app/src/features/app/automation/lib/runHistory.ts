export const getStatusTone = (status: string) => {
  if (status === 'completed') return 'text-emerald-600';
  if (status === 'failed') return 'text-destructive';
  if (status === 'running') return 'text-blue-600';
  return 'text-muted-foreground';
};

export const formatJson = (value: unknown): string => {
  if (value == null) {
    return 'None';
  }
  try {
    return JSON.stringify(value, null, 2) ?? 'None';
  } catch {
    return String(value);
  }
};
