import type { EChartsOption, LineSeriesOption } from 'echarts';
import { Base } from './base';
import { ChartType } from './type';

export class Line extends Base {
  type = ChartType.Line;

  getOptions(): EChartsOption {
    const seriesArr = this.getSeries();
    const xAxisData: string[] = [];
    const series: LineSeriesOption[] = [];
    let first = true;
    seriesArr.forEach((seriesDataMap) => {
      const seriesData: number[] = [];
      Object.keys(seriesDataMap).forEach((key) => {
        first && xAxisData.push(key);
        seriesData.push(seriesDataMap[key]);
      });
      series.push({
        type: ChartType.Line,
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
