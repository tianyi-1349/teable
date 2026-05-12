import { useEffect, useState } from 'react';

const isStandaloneDisplayMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.matchMedia?.('(display-mode: minimal-ui)').matches ||
    // Safari exposes installed web apps through navigator.standalone.
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
};

export const useIsPwaStandalone = () => {
  const [isPwaStandalone, setIsPwaStandalone] = useState(false);

  useEffect(() => {
    setIsPwaStandalone(isStandaloneDisplayMode());
  }, []);

  return isPwaStandalone;
};
