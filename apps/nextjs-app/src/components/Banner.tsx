import { useTranslation } from 'next-i18next';
import type { FC } from 'react';

type Props = {
  children?: never;
};

export const Banner: FC<Props> = () => {
  const { t } = useTranslation('common');
  return (
    <div className="bg-indigo-600">
      <div className="mx-auto max-w-7xl p-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex w-0 flex-1 items-center">
            <span className="flex rounded-lg bg-indigo-800 p-2"></span>
            <p className="ml-3 truncate font-medium text-white">
              <span className="md:hidden">{t('marketing.bannerMobile')}</span>
              <span className="hidden md:inline">{t('marketing.bannerDesktop')}</span>
            </p>
          </div>
          <div className="order-3 mt-2 w-full shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
            <a
              href="#"
              className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm hover:bg-indigo-50"
            >
              {t('marketing.learnMore')}
            </a>
          </div>
          <div className="order-2 shrink-0 sm:order-3 sm:ml-3">
            <button
              type="button"
              className="-mr-1 flex rounded-md p-2 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
            >
              <span className="sr-only">{t('marketing.dismiss')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
