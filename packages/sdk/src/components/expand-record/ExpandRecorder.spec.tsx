import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExpandRecorder } from './ExpandRecorder';
import { ExpandRecordNavigationContext } from './ExpandRecordNavigationContext';

vi.mock('../../context/app/i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../hooks', () => ({
  useBaseId: () => 'base-1',
  useRecordOperations: () => ({ duplicateRecord: vi.fn() }),
  useTableId: () => 'table-current',
  useTablePermission: () => ({ 'record|read': true, 'record|update': true, 'record|delete': true }),
  useTables: () => [
    { id: 'table-current', name: 'Current Table' },
    { id: 'table-linked', name: 'Linked Table' },
  ],
}));

vi.mock('../../context', () => ({
  StandaloneViewProvider: ({ children }: { children: React.ReactNode }) => children,
  ViewProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('react-use', () => ({
  useLocalStorage: () => [false, vi.fn()],
}));

vi.mock('@teable/openapi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    deleteRecord: vi.fn(),
  };
});

vi.mock('./ExpandRecord', () => ({
  ExpandRecord: () => <div>ExpandRecord</div>,
}));

describe('ExpandRecorder linked navigation', () => {
  it('pushes and pops linked record navigation entries', () => {
    const pushLinkedRecordNav = vi.fn();
    const popLinkedRecordNav = vi.fn();

    const { unmount } = render(
      <ExpandRecordNavigationContext.Provider
        value={{
          onHighlightTable: vi.fn(),
          navigateToTable: vi.fn(),
          pushLinkedRecordNav,
          popLinkedRecordNav,
        }}
      >
        <ExpandRecorder
          tableId="table-linked"
          recordId="rec-1"
          isLinkedRecord
          sourceTableId="table-current"
        />
      </ExpandRecordNavigationContext.Provider>
    );

    expect(pushLinkedRecordNav).toHaveBeenCalledWith(
      expect.objectContaining({
        entryId: 'table-linked-rec-1',
        tableId: 'table-linked',
        recordId: 'rec-1',
        sourceTableId: 'table-current',
        targetAnchorId: 'linked-record-target-table-linked-rec-1',
      })
    );

    unmount();

    expect(popLinkedRecordNav).toHaveBeenCalledWith('table-linked-rec-1');
  });
});
