import type { EChartsOption } from 'echarts';
import type {
  IBoxplotConfig,
  ICandlestickConfig,
  IFunnelConfig,
  IGaugeConfig,
  IGraphConfig,
  IHeatmapConfig,
  IMapConfig,
  IParallelConfig,
  IPictorialBarConfig,
  IProgressConfig,
  ISankeyConfig,
  ISunburstConfig,
  IThemeRiverConfig,
  ITreemapConfig,
  IWordCloudConfig,
} from '../../../../types';

type Row = Record<string, unknown>;

const toNum = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

const makeSeriesName = (fallback: string, explicit?: string) => explicit || fallback;

export const buildFunnelOption = (config: IFunnelConfig, rows: Row[]): EChartsOption => {
  const dimension = config.dimension;
  const value = config.value;
  const data =
    dimension && value
      ? rows
          .filter((row) => row[dimension] != null)
          .map((row) => ({ name: String(row[dimension]), value: toNum(row[value]) }))
      : [];

  return {
    tooltip: { trigger: 'item' },
    grid: config.padding
      ? {
          top: config.padding.top ?? 20,
          right: config.padding.right ?? 20,
          bottom: config.padding.bottom ?? 20,
          left: config.padding.left ?? 20,
        }
      : undefined,
    series: [
      {
        type: 'funnel',
        data,
        label: { show: config.showLabel ?? true },
      },
    ],
  };
};

export const buildProgressOption = (config: IProgressConfig, rows: Row[]): EChartsOption => {
  const valueKey = config.value;
  const value = valueKey ? toNum(rows[0]?.[valueKey]) : 0;
  const target = config.target ?? 100;
  const ratio = target > 0 ? Math.min(100, Math.max(0, (value / target) * 100)) : 0;

  const grid = config.padding
    ? {
        top: config.padding.top ?? 20,
        right: config.padding.right ?? 20,
        bottom: config.padding.bottom ?? 20,
        left: config.padding.left ?? 20,
      }
    : undefined;

  if (config.mode === 'bar') {
    return {
      grid,
      xAxis: { type: 'value', max: 100 },
      yAxis: { type: 'category', data: [makeSeriesName('Progress', valueKey)] },
      series: [{ type: 'bar', data: [ratio] }],
    };
  }

  return {
    grid,
    series: [
      {
        type: 'gauge',
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}%' },
        data: [{ value: ratio, name: makeSeriesName('Progress', valueKey) }],
        min: 0,
        max: 100,
      },
    ],
  };
};

export const buildRoseOption = (
  dimension?: string,
  value?: string,
  rows: Row[] = [],
  showLegend?: boolean,
  showLabel?: boolean,
  padding?: { top?: number; right?: number; bottom?: number; left?: number }
): EChartsOption => {
  const data =
    dimension && value
      ? rows
          .filter((row) => row[dimension] != null)
          .map((row) => ({ name: String(row[dimension]), value: toNum(row[value]) }))
      : [];

  return {
    tooltip: { trigger: 'item' },
    legend: showLegend !== false ? { left: 'center' } : undefined,
    grid: padding
      ? {
          top: padding.top ?? 20,
          right: padding.right ?? 20,
          bottom: padding.bottom ?? 20,
          left: padding.left ?? 20,
        }
      : undefined,
    series: [
      {
        type: 'pie',
        roseType: 'radius',
        data,
        label: { show: showLabel ?? true },
      },
    ],
  };
};

export const buildGaugeOption = (config: IGaugeConfig, rows: Row[]): EChartsOption => {
  const value = config.value ? toNum(rows[0]?.[config.value]) : 0;
  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 20,
          right: config.padding.right ?? 20,
          bottom: config.padding.bottom ?? 20,
          left: config.padding.left ?? 20,
        }
      : undefined,
    series: [
      {
        type: 'gauge',
        min: config.min ?? 0,
        max: config.max ?? 100,
        data: [{ value, name: makeSeriesName('Gauge', config.value) }],
      },
    ],
  };
};

export const buildHeatmapOption = (config: IHeatmapConfig, rows: Row[]): EChartsOption => {
  const xKey = config.x;
  const yKey = config.y;
  const valueKey = config.value;
  if (!xKey || !yKey || !valueKey) return {};

  const xVals = [...new Set(rows.map((r) => String(r[xKey] ?? '')))].filter(Boolean);
  const yVals = [...new Set(rows.map((r) => String(r[yKey] ?? '')))].filter(Boolean);
  const data = rows.map((r) => [
    xVals.indexOf(String(r[xKey] ?? '')),
    yVals.indexOf(String(r[yKey] ?? '')),
    toNum(r[valueKey]),
  ]);

  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 40,
          right: config.padding.right ?? 40,
          bottom: config.padding.bottom ?? 40,
          left: config.padding.left ?? 40,
        }
      : undefined,
    tooltip: { position: 'top' },
    xAxis: { type: 'category', data: xVals },
    yAxis: { type: 'category', data: yVals },
    visualMap: {
      min: 0,
      max: Math.max(1, ...data.map((d) => Number(d[2] ?? 0))),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
    },
    series: [{ type: 'heatmap', data }],
  };
};

export const buildSunburstOption = (config: ISunburstConfig, rows: Row[]): EChartsOption => {
  const path = config.path?.[0];
  const valueKey = config.value;
  if (!path || !valueKey) return {};
  const data = rows
    .filter((r) => r[path] != null)
    .map((r) => ({ name: String(r[path]), value: toNum(r[valueKey]) }));

  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 20,
          right: config.padding.right ?? 20,
          bottom: config.padding.bottom ?? 20,
          left: config.padding.left ?? 20,
        }
      : undefined,
    series: [{ type: 'sunburst', data }],
  };
};

export const buildCandlestickOption = (config: ICandlestickConfig, rows: Row[]): EChartsOption => {
  if (!config.time || !config.open || !config.high || !config.low || !config.close) return {};
  const xAxis = rows.map((r) => String(r[config.time!] ?? ''));
  const values = rows.map((r) => [
    toNum(r[config.open!]),
    toNum(r[config.close!]),
    toNum(r[config.low!]),
    toNum(r[config.high!]),
  ]);
  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 20,
          right: config.padding.right ?? 20,
          bottom: config.padding.bottom ?? 20,
          left: config.padding.left ?? 20,
        }
      : undefined,
    xAxis: { type: 'category', data: xAxis },
    yAxis: { type: 'value' },
    series: [{ type: 'candlestick', data: values }],
  };
};

export const buildBoxplotOption = (config: IBoxplotConfig, rows: Row[]): EChartsOption => {
  if (!config.group || !config.min || !config.q1 || !config.median || !config.q3 || !config.max)
    return {};
  const groups = rows.map((r) => String(r[config.group!] ?? ''));
  const values = rows.map((r) => [
    toNum(r[config.min!]),
    toNum(r[config.q1!]),
    toNum(r[config.median!]),
    toNum(r[config.q3!]),
    toNum(r[config.max!]),
  ]);
  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 20,
          right: config.padding.right ?? 20,
          bottom: config.padding.bottom ?? 20,
          left: config.padding.left ?? 20,
        }
      : undefined,
    xAxis: { type: 'category', data: groups },
    yAxis: { type: 'value' },
    series: [{ type: 'boxplot', data: values }],
  };
};

export const buildParallelOption = (config: IParallelConfig, rows: Row[]): EChartsOption => {
  const dims = config.dimensions ?? [];
  if (dims.length < 2) return {};
  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 40,
          right: config.padding.right ?? 40,
          bottom: config.padding.bottom ?? 40,
          left: config.padding.left ?? 40,
        }
      : undefined,
    parallelAxis: dims.map((d, i) => ({ dim: i, name: d })),
    parallel: {},
    series: [{ type: 'parallel', data: rows.map((r) => dims.map((d) => toNum(r[d]))) }],
  };
};

export const buildPictorialBarOption = (
  config: IPictorialBarConfig,
  rows: Row[]
): EChartsOption => {
  if (!config.dimension || !config.value) return {};
  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 20,
          right: config.padding.right ?? 20,
          bottom: config.padding.bottom ?? 20,
          left: config.padding.left ?? 20,
        }
      : undefined,
    xAxis: { type: 'category', data: rows.map((r) => String(r[config.dimension!] ?? '')) },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'pictorialBar',
        symbol: config.symbol || 'rect',
        data: rows.map((r) => toNum(r[config.value!])),
      },
    ],
  };
};

export const buildTreemapOption = (config: ITreemapConfig, rows: Row[]): EChartsOption => {
  const key = config.path?.[0];
  if (!key || !config.value) return {};
  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 20,
          right: config.padding.right ?? 20,
          bottom: config.padding.bottom ?? 20,
          left: config.padding.left ?? 20,
        }
      : undefined,
    series: [
      {
        type: 'treemap',
        data: rows.map((r) => ({ name: String(r[key] ?? ''), value: toNum(r[config.value!]) })),
      },
    ],
  };
};

export const buildSankeyOption = (config: ISankeyConfig, rows: Row[]): EChartsOption => {
  if (!config.source || !config.target || !config.value) return {};
  const links = rows.map((r) => ({
    source: String(r[config.source!] ?? ''),
    target: String(r[config.target!] ?? ''),
    value: toNum(r[config.value!]),
  }));
  const nodeNames = [...new Set(links.flatMap((l) => [l.source, l.target]))];
  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 20,
          right: config.padding.right ?? 20,
          bottom: config.padding.bottom ?? 20,
          left: config.padding.left ?? 20,
        }
      : undefined,
    series: [{ type: 'sankey', data: nodeNames.map((name) => ({ name })), links }],
  };
};

export const buildGraphOption = (config: IGraphConfig, rows: Row[]): EChartsOption => {
  if (!config.source || !config.target) return {};
  const links = rows.map((r) => ({
    source: String(r[config.source!] ?? ''),
    target: String(r[config.target!] ?? ''),
    value: toNum(config.value ? r[config.value] : 1),
  }));
  const names = [...new Set(links.flatMap((l) => [l.source, l.target]))];
  const nodes = config.nodeId
    ? names.map((name) => ({ id: name, name }))
    : names.map((name) => ({ name }));
  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 20,
          right: config.padding.right ?? 20,
          bottom: config.padding.bottom ?? 20,
          left: config.padding.left ?? 20,
        }
      : undefined,
    series: [{ type: 'graph', layout: 'force', data: nodes, links }],
  };
};

export const buildMapOption = (config: IMapConfig, rows: Row[]): EChartsOption => {
  if (!config.region || !config.value) return {};
  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 20,
          right: config.padding.right ?? 20,
          bottom: config.padding.bottom ?? 20,
          left: config.padding.left ?? 20,
        }
      : undefined,
    visualMap: {
      min: 0,
      max: Math.max(1, ...rows.map((r) => toNum(r[config.value!]))),
      left: 'left',
      top: 'bottom',
    },
    series: [
      {
        type: 'map',
        map: 'world',
        data: rows.map((r) => ({
          name: String(r[config.region!] ?? ''),
          value: toNum(r[config.value!]),
        })),
      },
    ],
  };
};

export const buildThemeRiverOption = (config: IThemeRiverConfig, rows: Row[]): EChartsOption => {
  if (!config.time || !config.category || !config.value) return {};
  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 40,
          right: config.padding.right ?? 40,
          bottom: config.padding.bottom ?? 40,
          left: config.padding.left ?? 40,
        }
      : undefined,
    singleAxis: { type: 'time' },
    series: [
      {
        type: 'themeRiver',
        data: rows.map((r) => [
          String(r[config.time!] ?? ''),
          toNum(r[config.value!]),
          String(r[config.category!] ?? ''),
        ]),
      },
    ],
  };
};

export const buildWordCloudOption = (config: IWordCloudConfig, rows: Row[]): EChartsOption => {
  if (!config.word || !config.value) return {};
  return {
    grid: config.padding
      ? {
          top: config.padding.top ?? 20,
          right: config.padding.right ?? 20,
          bottom: config.padding.bottom ?? 20,
          left: config.padding.left ?? 20,
        }
      : undefined,
    series: [
      {
        type: 'wordCloud',
        data: rows.map((r) => ({
          name: String(r[config.word!] ?? ''),
          value: toNum(r[config.value!]),
        })),
      } as never,
    ],
  };
};
