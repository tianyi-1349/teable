import { Slider } from '@teable/ui-lib';
import { useTranslation } from 'next-i18next';
import type { IScatterConfig } from '../../../../types';
import { ConfigItem } from '../common/ConfigItem';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const ScatterForm = (props: {
  config: IScatterConfig;
  onChange: (config: IScatterConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <>
      <BasicColumnChartForm
        dimensionLabel={t('form.scatter.x', 'X')}
        valueLabel={t('form.scatter.y', 'Y')}
        dimensionValue={config.x}
        valueValue={config.y}
        onDimensionChange={(x) => onChange({ ...config, x })}
        onValueChange={(y) => onChange({ ...config, y })}
      />
      <ConfigItem label={t('form.scatter.pointSize', 'Point Size')}>
        <Slider
          min={2}
          max={30}
          step={1}
          value={[config.pointSize ?? 10]}
          onValueChange={([pointSize]) => onChange({ ...config, pointSize })}
        />
      </ConfigItem>
    </>
  );
};
