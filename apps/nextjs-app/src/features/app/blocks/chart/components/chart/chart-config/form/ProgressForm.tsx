import { Label, RadioGroup, RadioGroupItem } from '@teable/ui-lib';
import { useTranslation } from 'next-i18next';
import type { IProgressConfig } from '../../../../types';
import { ConfigItem } from '../common/ConfigItem';
import { BasicColumnChartForm } from './BasicColumnChartForm';

export const ProgressForm = (props: {
  config: IProgressConfig;
  onChange: (config: IProgressConfig) => void;
}) => {
  const { config, onChange } = props;
  const { t } = useTranslation('chart');

  return (
    <>
      <BasicColumnChartForm
        dimensionLabel={t('form.progress.dimension', 'Dimension')}
        valueLabel={t('form.progress.value', 'Value')}
        dimensionValue={config.value}
        valueValue={config.value}
        onDimensionChange={(value) => onChange({ ...config, value })}
        onValueChange={(value) => onChange({ ...config, value })}
      />
      <ConfigItem label={t('form.progress.mode', 'Mode')}>
        <RadioGroup
          value={config.mode ?? 'circle'}
          onValueChange={(mode) => onChange({ ...config, mode: mode as 'circle' | 'bar' })}
          className="flex gap-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="circle" id="circle" />
            <Label htmlFor="circle">{t('form.progress.mode.circle', 'Circle')}</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="bar" id="bar" />
            <Label htmlFor="bar">{t('form.progress.mode.bar', 'Bar')}</Label>
          </div>
        </RadioGroup>
      </ConfigItem>
    </>
  );
};
