import { describe, expect, it } from 'vitest';
import { Events } from '../event.enum';
import { WorkflowEventFactory } from './workflow.event';

describe('WorkflowEventFactory', () => {
  const context = { user: { id: 'usr123' }, headers: {} } as never;
  const payload = {
    baseId: 'bse123',
    workflow: {
      id: 'wfl123',
      name: 'Deploy',
    },
  };

  it('creates workflow activate event', () => {
    const event = WorkflowEventFactory.create(Events.WORKFLOW_ACTIVATE, payload, context);

    expect(event?.name).toBe(Events.WORKFLOW_ACTIVATE);
    expect(event?.payload).toEqual(payload);
  });

  it('creates workflow deactivate event', () => {
    const event = WorkflowEventFactory.create(Events.WORKFLOW_DEACTIVATE, payload, context);

    expect(event?.name).toBe(Events.WORKFLOW_DEACTIVATE);
    expect(event?.payload).toEqual(payload);
  });

  it('creates workflow apply update event', () => {
    const event = WorkflowEventFactory.create(Events.WORKFLOW_APPLY_UPDATE, payload, context);

    expect(event?.name).toBe(Events.WORKFLOW_APPLY_UPDATE);
    expect(event?.payload).toEqual(payload);
  });
});
