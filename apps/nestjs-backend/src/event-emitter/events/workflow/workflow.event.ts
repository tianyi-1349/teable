import { match } from 'ts-pattern';
import type { IEventContext } from '../core-event';
import { CoreEvent } from '../core-event';
import { Events } from '../event.enum';

interface IWorkflowVo {
  id: string;
  name: string;
}

type IWorkflowCreatePayload = { baseId: string; workflow: IWorkflowVo };
type IWorkflowDeletePayload = { baseId: string; workflowId: string; permanent?: boolean };
type IWorkflowUpdatePayload = IWorkflowCreatePayload;
type IWorkflowActivatePayload = IWorkflowCreatePayload;
type IWorkflowDeactivatePayload = IWorkflowCreatePayload;

export class WorkflowCreateEvent extends CoreEvent<IWorkflowCreatePayload> {
  public readonly name = Events.WORKFLOW_CREATE;

  constructor(payload: IWorkflowCreatePayload, context: IEventContext) {
    super(payload, context);
  }
}

export class WorkflowDeleteEvent extends CoreEvent<IWorkflowDeletePayload> {
  public readonly name = Events.WORKFLOW_DELETE;
  constructor(payload: IWorkflowDeletePayload, context: IEventContext) {
    super(payload, context);
  }
}

export class WorkflowUpdateEvent extends CoreEvent<IWorkflowUpdatePayload> {
  public readonly name = Events.WORKFLOW_UPDATE;

  constructor(payload: IWorkflowUpdatePayload, context: IEventContext) {
    super(payload, context);
  }
}

export class WorkflowActivateEvent extends CoreEvent<IWorkflowActivatePayload> {
  public readonly name = Events.WORKFLOW_ACTIVATE;

  constructor(payload: IWorkflowActivatePayload, context: IEventContext) {
    super(payload, context);
  }
}

export class WorkflowDeactivateEvent extends CoreEvent<IWorkflowDeactivatePayload> {
  public readonly name = Events.WORKFLOW_DEACTIVATE;

  constructor(payload: IWorkflowDeactivatePayload, context: IEventContext) {
    super(payload, context);
  }
}

export class WorkflowEventFactory {
  static create(
    name: string,
    payload:
      | IWorkflowCreatePayload
      | IWorkflowDeletePayload
      | IWorkflowUpdatePayload
      | IWorkflowActivatePayload
      | IWorkflowDeactivatePayload,
    context: IEventContext
  ) {
    return match(name)
      .with(Events.WORKFLOW_CREATE, () => {
        return new WorkflowCreateEvent(payload as IWorkflowCreatePayload, context);
      })
      .with(Events.WORKFLOW_DELETE, () => {
        return new WorkflowDeleteEvent(payload as IWorkflowDeletePayload, context);
      })
      .with(Events.WORKFLOW_UPDATE, () => {
        return new WorkflowUpdateEvent(payload as IWorkflowUpdatePayload, context);
      })
      .with(Events.WORKFLOW_ACTIVATE, () => {
        return new WorkflowActivateEvent(payload as IWorkflowActivatePayload, context);
      })
      .with(Events.WORKFLOW_DEACTIVATE, () => {
        return new WorkflowDeactivateEvent(payload as IWorkflowDeactivatePayload, context);
      })
      .otherwise(() => null);
  }
}
