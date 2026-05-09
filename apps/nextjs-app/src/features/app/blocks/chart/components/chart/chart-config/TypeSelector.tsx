/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { ChevronsUpDown, Table2 } from '@teable/icons';
import { Button, cn, Popover, PopoverContent, PopoverTrigger } from '@teable/ui-lib';
import {
  AreaChart,
  BarChart,
  CircleDashed,
  Diamond,
  Gauge,
  GitBranch,
  Grid3X3,
  LineChart,
  Network,
  PieChart,
  Radar,
  Rows,
  Square,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import type { IChartConfig } from '../../../types';

export const TypeSelector = (props: {
  className?: string;
  type?: IChartConfig['type'];
  onChange: (type: IChartConfig['type']) => void;
}) => {
  const { className, type, onChange } = props;
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('chart');

  const options = useMemo(() => {
    return [
      {
        label: t('chart.bar'),
        value: 'bar',
        Icon: BarChart,
      },
      {
        label: t('chart.line'),
        value: 'line',
        Icon: LineChart,
      },
      {
        label: t('chart.pie'),
        value: 'pie',
        Icon: PieChart,
      },
      {
        label: t('chart.area'),
        value: 'area',
        Icon: AreaChart,
      },
      {
        label: t('chart.table'),
        value: 'table',
        Icon: Table2,
      },
      {
        label: t('chart.scatter', 'Scatter'),
        value: 'scatter',
        Icon: CircleDashed,
      },
      {
        label: t('chart.funnel', 'Funnel'),
        value: 'funnel',
        Icon: Rows,
      },
      {
        label: t('chart.progress', 'Progress'),
        value: 'progress',
        Icon: TrendingUp,
      },
      {
        label: t('chart.rose', 'Rose'),
        value: 'rose',
        Icon: PieChart,
      },
      {
        label: t('chart.radar', 'Radar'),
        value: 'radar',
        Icon: Radar,
      },
      {
        label: t('chart.gauge', 'Gauge'),
        value: 'gauge',
        Icon: Gauge,
      },
      {
        label: t('chart.heatmap', 'Heatmap'),
        value: 'heatmap',
        Icon: Grid3X3,
      },
      {
        label: t('chart.sunburst', 'Sunburst'),
        value: 'sunburst',
        Icon: Sun,
      },
      {
        label: t('chart.candlestick', 'Candlestick'),
        value: 'candlestick',
        Icon: BarChart,
      },
      {
        label: t('chart.boxplot', 'Boxplot'),
        value: 'boxplot',
        Icon: Square,
      },
      {
        label: t('chart.parallel', 'Parallel'),
        value: 'parallel',
        Icon: LineChart,
      },
      {
        label: t('chart.pictorialBar', 'Pictorial Bar'),
        value: 'pictorialBar',
        Icon: Diamond,
      },
      {
        label: t('chart.treemap', 'Treemap'),
        value: 'treemap',
        Icon: Grid3X3,
      },
      {
        label: t('chart.sankey', 'Sankey'),
        value: 'sankey',
        Icon: GitBranch,
      },
      {
        label: t('chart.graph', 'Graph'),
        value: 'graph',
        Icon: Network,
      },
      {
        label: t('chart.themeRiver', 'ThemeRiver'),
        value: 'themeRiver',
        Icon: AreaChart,
      },
      {
        label: t('chart.wordCloud', 'WordCloud'),
        value: 'wordCloud',
        Icon: CircleDashed,
      },
    ] as Array<{ label: string; value: IChartConfig['type']; Icon: ElementType }>;
  }, [t]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between h-8 font-normal', className)}
        >
          {options.find((o) => o.value === type)?.label ?? (
            <span className="text-muted-foreground">{t('form.chartType.placeholder')}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-wrap gap-4">
          {options.map(({ label, Icon, value }) => (
            <div
              key={value}
              onClick={() => {
                onChange(value);
                setOpen(false);
              }}
            >
              <div
                className={cn('hover:border-primary cursor-pointer rounded-full border p-3', {
                  'border-primary': type === value,
                })}
              >
                <Icon />
              </div>
              <div className="text-center text-sm">{label}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
