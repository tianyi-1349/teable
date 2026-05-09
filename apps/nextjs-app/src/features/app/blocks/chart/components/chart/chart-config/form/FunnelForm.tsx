import { Checkbox } from '@teable/ui-lib';
import { useTranslation } from 'next-i18next';
import type { IFunnelConfig } from '../../../../types';
import { ConfigItem } from '../common/ConfigItem';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const FunnelForm = (props: {
  config: IFunnelConfig;
  onChange: (config: IFunnelConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <>
      <BasicColumnChartForm
        dimensionLabel={t('form.funnel.dimension', 'Dimension')}
        valueLabel={t('form.funnel.value', 'Value')}
        dimensionValue={config.dimension}
        valueValue={config.value}
        onDimensionChange={(dimension) => onChange({ ...config, dimension })}
        onValueChange={(value) => onChange({ ...config, value })}
      />
      <ConfigItem label={t('form.funnel.showLabel', 'Show Label')}>
        <Checkbox
          checked={config.showLabel ?? true}
          onCheckedChange={(checked) => onChange({ ...config, showLabel: checked === true })}
        />
      </ConfigItem>
    </>
  );
};
