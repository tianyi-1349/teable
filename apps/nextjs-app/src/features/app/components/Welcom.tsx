import { useTranslation } from 'next-i18next';

export const Welcome = () => {
  const { t } = useTranslation('common');
  return <div>{t('welcomeText')}</div>;
};
