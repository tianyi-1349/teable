import { useBaseQueryData } from '../../../../hooks/useBaseQueryData';
import { useFilterNumberColumns } from '../../../../hooks/useFilterNumberColumns';
import { ColumnSelector } from '../common/ColumnSelector';
import { ConfigItem } from '../common/ConfigItem';

export const BasicColumnChartForm = (props: {
  dimensionLabel: string;
  valueLabel: string;
  dimensionValue?: string;
  valueValue?: string;
  onDimensionChange: (value: string) => void;
  onValueChange: (value: string) => void;
}) => {
  const {
    dimensionLabel,
    valueLabel,
    dimensionValue,
    valueValue,
    onDimensionChange,
    onValueChange,
  } = props;
  const queryData = useBaseQueryData();
  const dimensions = queryData?.columns ?? [];
  const values = useFilterNumberColumns(queryData?.columns);

  return (
    <div className="space-y-4">
      <ConfigItem label={dimensionLabel}>
        <ColumnSelector columns={dimensions} value={dimensionValue} onChange={onDimensionChange} />
      </ConfigItem>
      <ConfigItem label={valueLabel}>
        <ColumnSelector columns={values} value={valueValue} onChange={onValueChange} />
      </ConfigItem>
    </div>
  );
};
