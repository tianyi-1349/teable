/* eslint-disable @typescript-eslint/no-explicit-any */

import type { CellValueType } from './CellValueType';
import type { FormulaFieldReference } from './FormulaFieldReference';

export class TypedValue<T = unknown> {
  constructor(
    public value: T,
    public type: CellValueType,
    public isMultiple?: boolean,
    public field?: FormulaFieldReference,
    public isBlank?: boolean
  ) {}

  toPlain(): T | null {
    return this.value === false ? null : this.value;
  }
}
