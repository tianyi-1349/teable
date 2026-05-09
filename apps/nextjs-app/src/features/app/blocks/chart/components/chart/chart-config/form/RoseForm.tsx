import { Checkbox } from '@teable/ui-lib';
import { useTranslation } from 'next-i18next';
import type { IRoseConfig } from '../../../../types';
import { ConfigItem } from '../common/ConfigItem';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const RoseForm = (props: {
  config: IRoseConfig;
  onChange: (config: IRoseConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <>
      <BasicColumnChartForm
        dimensionLabel={t('form.rose.dimension', 'Dimension')}
        valueLabel={t('form.rose.value', 'Value')}
        dimensionValue={config.dimension}
        valueValue={config.value}
        onDimensionChange={(dimension) => onChange({ ...config, dimension })}
        onValueChange={(value) => onChange({ ...config, value })}
      />
      <ConfigItem label={t('form.rose.showLegend', 'Show Legend')}>
        <Checkbox
          checked={config.showLegend ?? true}
          onCheckedChange={(checked) => onChange({ ...config, showLegend: checked === true })}
        />
      </ConfigItem>
      <ConfigItem label={t('form.rose.showLabel', 'Show Label')}>
        <Checkbox
          checked={config.showLabel ?? true}
          onCheckedChange={(checked) => onChange({ ...config, showLabel: checked === true })}
        />
      </ConfigItem>
    </>
  );
};
