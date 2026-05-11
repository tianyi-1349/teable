export interface IExtraResult {
  [key: string]: unknown;
  searchHitIndex?: Array<{ recordId: string; fieldId: string }> | null;
}
