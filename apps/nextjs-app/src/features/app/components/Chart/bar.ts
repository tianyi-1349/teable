import type { BarSeriesOption, EChartsOption } from 'echarts';
import { Base } from './base';
import { ChartType } from './type';

export class Bar extends Base {
  type = ChartType.Bar;

  getOptions(): EChartsOption {
    const _series = this.getSeries();
    const xAxisData: string[] = [];
    const series: BarSeriesOption[] = [];
    let first = true;
    _series.forEach((seriesDataMap) => {
      const seriesData: number[] = [];
      Object.keys(seriesDataMap).forEach((key) => {
        first && xAxisData.push(key);
        seriesData.push(seriesDataMap[key]);
      });
      series.push({
        type: ChartType.Bar,
        data: seriesData,
      });
      first = false;
    });
    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove|click',
      },
      grid: {
        left: 16,
        right: 16,
        top: 24,
        bottom: 24,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          hideOverlap: true,
          interval: 'auto',
        },
      },
      yAxis: {
        type: 'value',
      },
      series,
    };
  }
}
