import { useMutation } from '@tanstack/react-query';
import { HttpError, sharePasswordSchema } from '@teable/core';
import { shareViewAuth } from '@teable/openapi';
import { Button, Input, Label } from '@teable/ui-lib';
import { Spin } from '@teable/ui-lib/base';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { shareConfig } from '@/features/i18n/share.config';
import { getFriendlyErrorMessage } from '@/lib/get-friendly-error-message';

export const AuthPage = () => {
  const [error, setError] = useState('');
  const router = useRouter();
  const shareId = router.query.shareId as string;
  const { mutateAsync: authShareView, isPending: isLoading } = useMutation({
    mutationFn: shareViewAuth,
  });
  const { t } = useTranslation(shareConfig.i18nNamespaces);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = (event.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    const validatePassword = sharePasswordSchema.safeParse(password);
    if (!validatePassword.success) {
      setError(t('share:auth.passwordTooShort'));
      return;
    }
    try {
      await authShareView({ shareId, password });
      router.push({
        pathname: '/share/[shareId]/view',
        query: { shareId },
      });
    } catch (error) {
      if (error instanceof HttpError) {
        const localization = (error.data as { localization?: { i18nKey?: string } })?.localization;
        if (localization?.i18nKey) {
          setError(t(`sdk:${localization.i18nKey}` as never));
        } else {
          setError(getFriendlyErrorMessage(error, t));
        }
      } else {
        setError(getFriendlyErrorMessage(error, t));
      }
    }
  };

  return (
    <main
      data-testid="share-auth-view-page"
      className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
    >
      <span data-testid="share-id-state" className="sr-only">
        {String(router.query.shareId ?? 'missing')}
      </span>
      <div className="w-full max-w-md space-y-8">
        <h2 className="text-center text-3xl font-extrabold">{t('share:auth.title')}</h2>
        <form className="relative space-y-6" onSubmit={onSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <Label className="sr-only" htmlFor="password">
                {t('share:auth.password')}
              </Label>
              <Input
                id="password"
                name="password"
                placeholder={t('share:auth.password')}
                required
                type="password"
                readOnly={isLoading}
                autoComplete={`${shareId}-password`}
              />
            </div>
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading && <Spin />}
            {t('share:auth.submit')}
          </Button>
          {error && (
            <div
              data-testid="submit-error"
              className="absolute -bottom-1 w-full translate-y-full text-center text-sm text-destructive"
            >
              {error}
            </div>
          )}
        </form>
      </div>
    </main>
  );
};
