import { Clock4, Home, User } from '@teable/icons';
import type { AuthorizedVo } from '@teable/openapi';
import { useLanDayjs } from '@teable/sdk/hooks';
import { Button, Separator } from '@teable/ui-lib/shadcn';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { OAuthLogo } from '../../../oauth/OAuthLogo';
import { OAuthScope } from '../../../oauth/OAuthScope';
import { RevokeButton } from './RevokeButton';

export const Detail = (props: { detail?: AuthorizedVo; onBack: () => void }) => {
  const { detail, onBack } = props;
  const { logo, name, lastUsedTime, createdUser, homepage, description, scopes, clientId } =
    detail || {};
  const dayjs = useLanDayjs();
  const { t } = useTranslation('common');
  return (
    <div className="space-y-6 px-5 py-1">
      <div className="ui-panel-surface p-4">
        <div className="flex items-start gap-4">
          <OAuthLogo logo={logo || ''} name={name || ''} />
          <div className="min-w-0 space-y-2">
            <p className="truncate text-base font-medium text-foreground">{name}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2">
                <Clock4 />
                {t('settings.integration.thirdPartyIntegrations.lastUsed', {
                  date: dayjs(lastUsedTime).fromNow(),
                })}
              </p>
              <p className="flex items-center gap-2">
                <User />
                {t('settings.integration.thirdPartyIntegrations.owner', {
                  user: createdUser?.name || '',
                })}
              </p>
              <p className="flex items-center gap-2">
                <Home />
                <Button className="h-5 p-0 text-xs text-sky-700" size="xs" variant={'link'}>
                  <Link target="_blank" href={homepage || ''}>
                    {homepage}
                  </Link>
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Separator className="bg-border/80" />
        <div className="text-sm leading-6 text-muted-foreground">{description}</div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium text-foreground">
          {t('settings.integration.thirdPartyIntegrations.scopeTitle')}
        </div>
        <RevokeButton clientId={clientId || ''} name={name || ''} onSuccess={onBack} />
      </div>
      <div className="ui-muted-surface p-4">
        <OAuthScope
          className="p-0"
          scopes={scopes}
          description={
            <div className="text-sm leading-6 text-muted-foreground">
              {t('settings.integration.thirdPartyIntegrations.scopeDesc')}
            </div>
          }
        />
      </div>
    </div>
  );
};
