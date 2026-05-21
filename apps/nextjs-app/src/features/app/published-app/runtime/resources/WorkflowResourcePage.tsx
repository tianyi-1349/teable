import type { ReactNode } from 'react';
import { PublishedResourcePageFrame } from './PublishedResourcePageFrame';

export const WorkflowResourcePage = ({ children }: { children: ReactNode }) => {
  return (
    <PublishedResourcePageFrame
      title="Published workflow"
      description="Workflow pages stay available in published runtime with the same shell, navigation, and permission summary model."
    >
      {children}
    </PublishedResourcePageFrame>
  );
};
