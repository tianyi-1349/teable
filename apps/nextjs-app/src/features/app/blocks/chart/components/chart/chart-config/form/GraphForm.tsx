import { useTranslation } from 'next-i18next';
import type { IGraphConfig } from '../../../../types';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const GraphForm = (props: {
  config: IGraphConfig;
  onChange: (config: IGraphConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <BasicColumnChartForm
      dimensionLabel={t('form.graph.nodeId', 'Node')}
      valueLabel={t('form.graph.value', 'Value')}
      dimensionValue={config.nodeId}
      valueValue={config.value}
      onDimensionChange={(nodeId) => onChange({ ...config, nodeId })}
      onValueChange={(value) => onChange({ ...config, value })}
    />
  );
};
