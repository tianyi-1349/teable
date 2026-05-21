import type { IGetBasePermissionVo } from '@teable/openapi';
import { useBaseId, useBasePermission, usePermissionActionsStatic } from '@teable/sdk/hooks';
import { Button } from '@teable/ui-lib/shadcn';
import { Alert, AlertDescription, AlertTitle } from '@teable/ui-lib/shadcn/ui/alert';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

export function AuthorityMatrixPage() {
  const { t } = useTranslation('common');
  const baseId = useBaseId() as string;
  const basePermission = useBasePermission() as IGetBasePermissionVo | undefined;
  const { actionPrefixDisplayOrder, actionPrefixStaticMap, actionStaticMap } =
    usePermissionActionsStatic();

  const permissionStats = useMemo(() => {
    const entries = Object.values(basePermission ?? {});
    const granted = entries.filter(Boolean).length;

    return {
      total: entries.length,
      granted,
      denied: entries.length - granted,
    };
  }, [basePermission]);

  const permissionGroups = useMemo(() => {
    const keys = Object.keys(basePermission ?? {}) as (keyof IGetBasePermissionVo)[];

    return actionPrefixDisplayOrder
      .map((prefix) => {
        const prefixKeys = keys.filter((key) => key.startsWith(`${prefix}|`));

        return {
          prefix,
          title: actionPrefixStaticMap[prefix].title,
          entries: prefixKeys.map((action) => ({
            action,
            description: actionStaticMap[action as keyof typeof actionStaticMap].description,
            enabled: Boolean(basePermission?.[action]),
          })),
        };
      })
      .filter((group) => group.entries.length > 0);
  }, [actionPrefixDisplayOrder, actionPrefixStaticMap, actionStaticMap, basePermission]);

  return (
    <div className="h-full flex-col bg-gradient-to-b from-background via-background to-muted/20 md:flex">
      <Head>
        <title>{t('noun.authorityMatrix')}</title>
      </Head>
      <div className="flex flex-col gap-4 px-8 pb-4 pt-6 lg:gap-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">{t('noun.authorityMatrix')}</h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {t('authorityMatrixPage.subtitle')}
            </p>
          </div>
          <Button className="w-fit" variant="outline" asChild size="sm">
            <Link href={`/base/${baseId}/design`}>{t('authorityMatrixPage.openBaseDesign')}</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('authorityMatrixPage.total')}
            </div>
            <div className="mt-2 text-3xl font-semibold">{permissionStats.total}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('authorityMatrixPage.totalHint')}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('authorityMatrixPage.granted')}
            </div>
            <div className="mt-2 text-3xl font-semibold text-emerald-600">
              {permissionStats.granted}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('authorityMatrixPage.grantedHint')}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {t('authorityMatrixPage.denied')}
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-500">
              {permissionStats.denied}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('authorityMatrixPage.deniedHint')}
            </p>
          </div>
        </div>

        <Alert className="border-dashed">
          <AlertTitle>{t('authorityMatrixPage.permissionSource')}</AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">
            {t('authorityMatrixPage.permissionSourceDescription')}
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 xl:grid-cols-2">
          {permissionGroups.map((group) => (
            <section key={group.prefix} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b pb-3">
                <div>
                  <h3 className="text-base font-semibold">{group.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('authorityMatrixPage.actionsCount', { count: group.entries.length })}
                  </p>
                </div>
                <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {group.prefix}
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {group.entries.map((entry) => (
                  <div key={entry.action} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-muted-foreground">
                          {entry.action}
                        </div>
                        <div className="mt-1 text-sm leading-5">{entry.description}</div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                          entry.enabled
                            ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20'
                            : 'bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/20'
                        }`}
                      >
                        {entry.enabled
                          ? t('authorityMatrixPage.granted')
                          : t('authorityMatrixPage.denied')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
