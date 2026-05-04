import { z } from '../../zod';

export const appModePageSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['list', 'detail', 'dashboard', 'form']),
  sourceId: z.string().optional(),
});

export const appModeGovernanceSchema = z.object({
  roleMatrixVersion: z.number().int().min(1).default(1),
  auditPolicy: z.enum(['strict', 'standard']).default('standard'),
  permissionMode: z.enum(['inherited', 'isolated']).default('inherited'),
});

const defaultAppModeGovernance = () =>
  appModeGovernanceSchema.parse({
    roleMatrixVersion: 1,
    auditPolicy: 'standard',
    permissionMode: 'inherited',
  });

export const appModeConfigSchema = z
  .object({
    version: z.number().int().min(1).default(1),
    pages: z.array(appModePageSchema).default([]),
    linkedBaseIds: z.array(z.string()).default([]),
    dashboardIds: z.array(z.string()).default([]),
    workflowEnabled: z.boolean().default(false),
    governance: appModeGovernanceSchema.default(defaultAppModeGovernance),
  })
  .superRefine((config, ctx) => {
    const pageIds = new Set<string>();
    config.pages.forEach((page, index) => {
      if (pageIds.has(page.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['pages', index, 'id'],
          message: `Duplicate page id: ${page.id}`,
        });
      }
      pageIds.add(page.id);
    });

    if (new Set(config.linkedBaseIds).size !== config.linkedBaseIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['linkedBaseIds'],
        message: 'Duplicate linkedBaseIds are not allowed',
      });
    }

    if (new Set(config.dashboardIds).size !== config.dashboardIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dashboardIds'],
        message: 'Duplicate dashboardIds are not allowed',
      });
    }
  });

export type IAppModePage = z.infer<typeof appModePageSchema>;
export type IAppModeConfig = z.infer<typeof appModeConfigSchema>;
