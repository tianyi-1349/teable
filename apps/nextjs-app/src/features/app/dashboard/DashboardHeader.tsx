import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Plus } from '@teable/icons';
import { BaseNodeResourceType, getDashboard, renameDashboard } from '@teable/openapi';
import { ReactQueryKeys } from '@teable/sdk/config';
import { useBaseId, useBasePermission } from '@teable/sdk/hooks';
import { Button, Input } from '@teable/ui-lib/shadcn';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import { dashboardConfig } from '@/features/i18n/dashboard.config';
import { BaseNodeMore } from '../blocks/base/base-side-bar/BaseNodeMore';
import { useBrand } from '../hooks/useBrand';
import { AddPluginDialog } from './components/AddPluginDialog';

export const DashboardHeader = (props: { dashboardId: string }) => {
  const { dashboardId } = props;
  const baseId = useBaseId()!;
  const queryClient = useQueryClient();
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState<string>('');
  const renameRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation(dashboardConfig.i18nNamespaces);
  const basePermissions = useBasePermission();
  const canManage = basePermissions?.['base|update'];
  const { brandName } = useBrand();

  const { data: dashboard } = useQuery({
    queryKey: ReactQueryKeys.getDashboard(dashboardId),
    queryFn: () => getDashboard(baseId, dashboardId).then((res) => res.data),
  });

  const { mutate: renameDashboardMutate } = useMutation({
    mutationFn: ({ name }: { name: string }) => renameDashboard(baseId, dashboardId, name),
    onSuccess: () => {
      setIsRenaming(false);
      queryClient.invalidateQueries({ queryKey: ReactQueryKeys.getDashboard(dashboardId) });
    },
  });

  const dashboardName = dashboard?.name ?? t('common:noun.dashboard');

  const startRename = () => {
    setIsRenaming(true);
    setEditName(dashboardName);
  };

  const cancelRename = () => {
    setIsRenaming(false);
    setEditName(dashboardName);
  };

  const submitRename = () => {
    const newName = editName.trim();
    if (dashboardName === newName) {
      setIsRenaming(false);
      return;
    }
    setIsRenaming(false);
    renameDashboardMutate({ name: newName });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitRename();
    } else if (e.key === 'Escape') {
      cancelRename();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRenaming) {
      timer = setTimeout(() => {
        renameRef.current?.focus();
        renameRef.current?.select();
      }, 200);
    }
    return () => clearTimeout(timer);
  }, [isRenaming]);

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 backdrop-blur-sm">
      <Head>
        <title>{dashboardName ? `${dashboardName} - ${brandName}` : brandName}</title>
      </Head>
      {isRenaming ? (
        <Input
          ref={renameRef}
          className="max-w-60 border-slate-700 bg-slate-950/80 text-slate-100 placeholder:text-slate-500 focus-visible:border-emerald-500/70 focus-visible:ring-emerald-500/30"
          value={editName ?? ''}
          onBlur={submitRename}
          onKeyDown={handleKeyDown}
          onChange={(e) => setEditName(e.target.value)}
        />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="justify-start rounded-md border border-transparent px-3 text-sm text-slate-100 transition-colors hover:border-emerald-500/30 hover:bg-slate-900 hover:text-emerald-300"
          disabled={!canManage}
          onClick={startRename}
        >
          <span className="truncate"> {dashboardName}</span>
        </Button>
      )}

      <div className="flex items-center gap-2">
        {canManage && (
          <AddPluginDialog dashboardId={dashboardId}>
            <Button
              variant={'outline'}
              size={'xs'}
              className="border-slate-700 bg-slate-950/70 text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.08)_inset] transition-colors hover:border-emerald-500/40 hover:bg-slate-900 hover:text-emerald-200"
            >
              <Plus className="size-4 shrink-0" />
              {t('dashboard:addPlugin')}
            </Button>
          </AddPluginDialog>
        )}
        {canManage && (
          <BaseNodeMore
            resourceType={BaseNodeResourceType.Dashboard}
            resourceId={dashboardId}
            onRename={startRename}
          >
            <Button
              size="icon-xs"
              variant="outline"
              className="border-slate-700 bg-slate-950/70 text-slate-200 transition-colors hover:border-emerald-500/40 hover:bg-slate-900 hover:text-emerald-200"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </BaseNodeMore>
        )}
      </div>
    </div>
  );
};
