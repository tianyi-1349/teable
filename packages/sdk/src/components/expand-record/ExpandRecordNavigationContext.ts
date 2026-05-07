import { createContext, useContext } from 'react';

export interface ILinkedRecordNavEntry {
  entryId: string;
  tableId: string;
  recordId: string;
  sourceTableId?: string;
  targetAnchorId: string;
}

interface IExpandRecordNavigationContext {
  onHighlightTable?: (tableId: string | null) => void;
  navigateToTable?: (tableId: string) => void;
  pushLinkedRecordNav?: (entry: ILinkedRecordNavEntry) => void;
  popLinkedRecordNav?: (entryId: string) => void;
}

export const ExpandRecordNavigationContext = createContext<IExpandRecordNavigationContext>({});

export const useExpandRecordNavigation = () => useContext(ExpandRecordNavigationContext);
