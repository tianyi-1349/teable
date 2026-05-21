import { useRouter } from 'next/router';
import { useMemo } from 'react';

export const usePageSearchParams = () => {
  const router = useRouter();

  return useMemo(() => {
    const queryString = router.asPath.split('?')[1]?.split('#')[0] ?? '';
    return new URLSearchParams(queryString);
  }, [router.asPath]);
};
