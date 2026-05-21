import { Progress } from '@teable/ui-lib/shadcn';
import { useTranslation } from 'next-i18next';
import React, { useState, useEffect } from 'react';

export function ProgressBar({ duration, cellCount }: { duration: number; cellCount: number }) {
  const { t } = useTranslation('common');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!duration) {
      return;
    }
    const interval = 100;
    const step = (interval / duration) * 100;

    const intervalId = setInterval(() => {
      setProgress((prevProgress) => {
        const nextProgress = prevProgress + step;
        if (nextProgress >= 100) {
          clearInterval(intervalId);
          return 100;
        }
        return nextProgress;
      });
    }, interval);

    return () => clearInterval(intervalId);
  }, [duration]);

  const format = (count: number) => {
    return Intl.NumberFormat().format(Math.floor(count));
  };

  return (
    <div className="flex flex-col gap-2 text-sm">
      <p>
        {t('progressBar.progress', {
          current: format((progress / 100) * cellCount),
          total: format(cellCount),
        })}
      </p>
      {progress === 100 && <p>{t('progressBar.processingHint')}</p>}
      <Progress value={progress} />
    </div>
  );
}
