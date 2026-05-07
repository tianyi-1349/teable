import { render, waitFor } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useGridSearchStore } from '../blocks/view/grid/useGridSearchStore';
import { LinkConnectorLine } from './LinkConnectorLine';

const entry = {
  entryId: 'table-linked-rec-1',
  tableId: 'table-linked',
  recordId: 'rec-1',
  sourceTableId: 'table-source',
  targetAnchorId: 'linked-record-target-table-linked-rec-1',
};

describe('LinkConnectorLine', () => {
  const originalRequestAnimationFrame = window.requestAnimationFrame;

  beforeEach(() => {
    useGridSearchStore.getState().setHighlightedTableId(null);
    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    }) as typeof window.requestAnimationFrame;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    window.requestAnimationFrame = originalRequestAnimationFrame;
  });

  it('renders connector and updates highlighted table id from active entry', async () => {
    const sourceEl = document.createElement('div');
    sourceEl.setAttribute('data-table-id', 'table-source');
    sourceEl.getBoundingClientRect = () =>
      ({
        left: 40,
        right: 140,
        top: 120,
        bottom: 160,
        width: 100,
        height: 40,
        x: 40,
        y: 120,
        toJSON: () => null,
      }) as DOMRect;

    const dialogEl = document.createElement('div');
    dialogEl.setAttribute('role', 'dialog');
    dialogEl.getBoundingClientRect = () =>
      ({
        left: 260,
        right: 620,
        top: 80,
        bottom: 420,
        width: 360,
        height: 340,
        x: 260,
        y: 80,
        toJSON: () => null,
      }) as DOMRect;

    const targetEl = document.createElement('div');
    targetEl.setAttribute('data-linked-record-target-anchor', entry.targetAnchorId);
    targetEl.getBoundingClientRect = () =>
      ({
        left: 280,
        right: 580,
        top: 100,
        bottom: 140,
        width: 300,
        height: 40,
        x: 280,
        y: 100,
        toJSON: () => null,
      }) as DOMRect;

    dialogEl.appendChild(targetEl);
    document.body.appendChild(sourceEl);
    document.body.appendChild(dialogEl);

    const { container } = render(<LinkConnectorLine entries={[entry]} />);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 120));
    });

    await waitFor(() => {
      expect(container.querySelector('svg')).not.toBeNull();
      expect(useGridSearchStore.getState().highlightedTableId).toBe('table-linked');
    });
  });
});
