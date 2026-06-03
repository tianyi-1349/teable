import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@teable/sdk/context';
import type { GetServerSideProps } from 'next';
import { useState } from 'react';
import { BaseShareAuthPage } from '@/features/app/blocks/share/base/BaseShareAuthPage';
import { shareConfig } from '@/features/i18n/share.config';
import { getTranslationsProps } from '@/lib/i18n';

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await getTranslationsProps(context, shareConfig.i18nNamespaces)),
    },
  };
};

export default function ShareAuthIsolationPage() {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <BaseShareAuthPage />
    </QueryClientProvider>
  );
}
