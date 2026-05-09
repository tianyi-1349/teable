import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { AiChatPanel } from './AiChatPanel';

export interface IAiChatProps {
  baseId: string;
  tableId?: string;
  viewId?: string;
  selectedRecords?: Array<Record<string, unknown>>;
  viewContext?: {
    name: string;
    filter?: unknown;
    sort?: unknown;
    group?: unknown;
  };
  defaultSessionId?: string;
  onClose?: () => void;
}

export const AiChatContainer = (props: IAiChatProps) => {
  const { t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    props.onClose?.();
  }, [props.onClose]);

  if (!isOpen) return null;

  return (
    <AiChatPanel
      baseId={props.baseId}
      tableId={props.tableId}
      viewId={props.viewId}
      selectedRecords={props.selectedRecords}
      viewContext={props.viewContext}
      defaultSessionId={props.defaultSessionId}
      onClose={handleClose}
    />
  );
};
