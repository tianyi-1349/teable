import { useTranslation } from 'next-i18next';
import type { ITreemapConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const TreemapForm = (props: {
  config: ITreemapConfig;
  onChange: (config: ITreemapConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.treemap.path', 'Path')}
      valueLabel={t('form.treemap.value', 'Value')}
      dimensionValue={config.path?.[0]}
      valueValue={config.value}
      onDimensionChange={(path) => onChange({ ...config, path: [path] })}
      onValueChange={(value) => onChange({ ...config, value })}
    />
  );
};
