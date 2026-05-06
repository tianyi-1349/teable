import type { IAppModeConfig, IAppModePage } from '@teable/openapi';
import { appModeConfigSchema } from '@teable/openapi';
import { useMemo, useState } from 'react';
import { useAppModeConfig } from './use-app-mode-config';

const cloneConfig = (config: IAppModeConfig): IAppModeConfig => ({
  ...config,
  pages: config.pages.map((page) => ({ ...page })),
  linkedBaseIds: [...config.linkedBaseIds],
  dashboardIds: [...config.dashboardIds],
  governance: { ...config.governance },
});

const dedupeStringList = (items: string[]) => {
  const deduped = new Set<string>();
  for (const item of items) {
    const normalized = item.trim();
    if (normalized) {
      deduped.add(normalized);
    }
  }
  return [...deduped];
};

export const validateAppModeDraft = (draft: IAppModeConfig) => {
  const parsed = appModeConfigSchema.safeParse(draft);
  if (!parsed.success) {
    return {
      ok: false as const,
      reason: parsed.error.issues[0]?.message ?? 'Invalid app mode config',
    };
  }

  if (
    draft.governance.auditPolicy === 'strict' &&
    (draft.governance.permissionMode !== 'isolated' || draft.governance.roleMatrixVersion < 2)
  ) {
    return {
      ok: false as const,
      reason:
        'Invalid governance policy: strict audit requires isolated permission mode and roleMatrixVersion >= 2',
    };
  }

  return { ok: true as const };
};

export const useAppModeConfigEditor = (customBaseId?: string) => {
  const appMode = useAppModeConfig(customBaseId);
  const [draft, setDraft] = useState<IAppModeConfig>();

  const effectiveDraft = draft ?? appMode.config;
  const isDirty = Boolean(
    appMode.config &&
      effectiveDraft &&
      JSON.stringify(appMode.config) !== JSON.stringify(effectiveDraft)
  );

  const canEdit = Boolean(appMode.baseId && appMode.config);

  const resetDraft = () => {
    if (!appMode.config) {
      return;
    }
    setDraft(cloneConfig(appMode.config));
  };

  const patchDraft = (updater: (config: IAppModeConfig) => IAppModeConfig) => {
    if (!appMode.config && !draft) {
      return;
    }

    const source = draft ?? cloneConfig(appMode.config as IAppModeConfig);
    setDraft(updater(cloneConfig(source)));
  };

  const addPage = (page: IAppModePage) => {
    patchDraft((config) => ({
      ...config,
      pages: [...config.pages, page],
    }));
  };

  const updatePageByIndex = (index: number, updater: (page: IAppModePage) => IAppModePage) => {
    patchDraft((config) => {
      if (index < 0 || index >= config.pages.length) {
        return config;
      }

      const pages = [...config.pages];
      pages[index] = updater(pages[index]);
      return {
        ...config,
        pages,
      };
    });
  };

  const removePageByIndex = (index: number) => {
    patchDraft((config) => {
      if (index < 0 || index >= config.pages.length) {
        return config;
      }

      const pages = [...config.pages];
      pages.splice(index, 1);
      return {
        ...config,
        pages,
      };
    });
  };

  const movePageByIndex = (index: number, direction: -1 | 1) => {
    patchDraft((config) => {
      const targetIndex = index + direction;
      if (
        index < 0 ||
        index >= config.pages.length ||
        targetIndex < 0 ||
        targetIndex >= config.pages.length
      ) {
        return config;
      }

      const pages = [...config.pages];
      const current = pages[index];
      pages[index] = pages[targetIndex];
      pages[targetIndex] = current;
      return {
        ...config,
        pages,
      };
    });
  };

  const updatePage = (pageId: string, updater: (page: IAppModePage) => IAppModePage) => {
    patchDraft((config) => {
      const index = config.pages.findIndex((page) => page.id === pageId);
      if (index < 0) {
        return config;
      }

      const pages = [...config.pages];
      pages[index] = updater(pages[index]);
      return {
        ...config,
        pages,
      };
    });
  };

  const removePage = (pageId: string) => {
    patchDraft((config) => {
      const index = config.pages.findIndex((page) => page.id === pageId);
      if (index < 0) {
        return config;
      }

      const pages = [...config.pages];
      pages.splice(index, 1);
      return {
        ...config,
        pages,
      };
    });
  };

  const setWorkflowEnabled = (enabled: boolean) => {
    patchDraft((config) => ({
      ...config,
      workflowEnabled: enabled,
    }));
  };

  const setLinkedBaseIds = (items: string[]) => {
    patchDraft((config) => ({
      ...config,
      linkedBaseIds: dedupeStringList(items),
    }));
  };

  const setDashboardIds = (items: string[]) => {
    patchDraft((config) => ({
      ...config,
      dashboardIds: dedupeStringList(items),
    }));
  };

  const setGovernance = (patch: Partial<IAppModeConfig['governance']>) => {
    patchDraft((config) => ({
      ...config,
      governance: {
        ...config.governance,
        ...patch,
      },
    }));
  };

  const saveDraft = async () => {
    if (!effectiveDraft) {
      throw new Error('No draft available to save');
    }

    const validation = validateAppModeDraft(effectiveDraft);
    if (!validation.ok) {
      throw new Error(validation.reason);
    }

    const saved = await appMode.updateConfig(effectiveDraft);
    setDraft(cloneConfig(saved));
    return saved;
  };

  const draftValidation = useMemo(() => {
    if (!effectiveDraft) {
      return { ok: false as const, reason: 'No config loaded' };
    }
    return validateAppModeDraft(effectiveDraft);
  }, [effectiveDraft]);

  return {
    ...appMode,
    canEdit,
    draft: effectiveDraft,
    isDirty,
    draftValidation,
    resetDraft,
    patchDraft,
    addPage,
    updatePage,
    removePage,
    updatePageByIndex,
    removePageByIndex,
    movePageByIndex,
    setWorkflowEnabled,
    setLinkedBaseIds,
    setDashboardIds,
    setGovernance,
    saveDraft,
  };
};
