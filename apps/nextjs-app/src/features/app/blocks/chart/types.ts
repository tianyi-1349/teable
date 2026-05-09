import type { IBaseQuery, PluginPosition } from '@teable/openapi';
import { z } from 'zod';

export const chartBaseAxisSchema = z.object({
  column: z.string(),
});

export const chartBaseAxisDisplayLineSchema = z.object({
  type: z.union([z.literal('line'), z.literal('area')]),
  position: z.union([z.literal('auto'), z.literal('left'), z.literal('right')]),
  lineStyle: z.union([z.literal('normal'), z.literal('linear'), z.literal('step')]),
});

export type IChartBaseAxisDisplayLine = z.infer<typeof chartBaseAxisDisplayLineSchema>;

export const chartBaseAxisDisplaySchema = z.union([
  z.object({
    type: z.literal('bar'),
    position: z.union([z.literal('auto'), z.literal('left'), z.literal('right')]),
  }),
  chartBaseAxisDisplayLineSchema,
]);

export type IChartBaseAxisDisplay = z.infer<typeof chartBaseAxisDisplaySchema>;

export const chartXAxisDisplaySchema = z.object({
  label: z.string().optional(),
});

export type IChartXAxisDisplay = z.infer<typeof chartXAxisDisplaySchema>;

export const chartYAxisDisplaySchema = z.object({
  label: z.string().optional(),
  range: z
    .object({
      max: z.number().optional(),
      min: z.number().optional(),
    })
    .optional(),
});

export type IChartYAxisDisplay = z.infer<typeof chartYAxisDisplaySchema>;

export const goalLineSchema = z.object({
  enabled: z.boolean().optional(),
  value: z.number().optional(),
  label: z.string().optional(),
});

export const chartPaddingSchema = z.object({
  top: z.number().optional(),
  right: z.number().optional(),
  bottom: z.number().optional(),
  left: z.number().optional(),
});

export type IChartPadding = z.infer<typeof chartPaddingSchema>;

export type IGoalLine = z.infer<typeof goalLineSchema>;

export const comboConfigSchema = z.object({
  xAxis: z
    .array(
      chartBaseAxisSchema.extend({
        display: chartBaseAxisDisplaySchema,
      })
    )
    .optional(),
  xAxisDisplay: chartXAxisDisplaySchema.optional(),
  yAxis: z
    .array(
      chartBaseAxisSchema
        .extend({
          label: z.string().optional(),
          prefix: z.string().optional(),
          suffix: z.string().optional(),
          decimal: z.number().max(10).min(0).optional(),
        })
        .extend({ display: chartBaseAxisDisplaySchema })
    )
    .optional(),
  yAxisDisplay: chartYAxisDisplaySchema.optional(),
  goalLine: goalLineSchema.optional(),
  showLabel: z.boolean().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IComboConfig = z.infer<typeof comboConfigSchema>;

export const comboTypeSchema = z.union([z.literal('bar'), z.literal('line'), z.literal('area')]);

export type IComboType = z.infer<typeof comboTypeSchema>;

export const barConfigSchema = comboConfigSchema.extend({
  type: z.literal('bar'),
  stack: z.boolean().optional(),
});

export type IBarConfig = z.infer<typeof barConfigSchema>;

export const lineConfigSchema = comboConfigSchema.extend({
  type: z.literal('line'),
});

export type ILineConfig = z.infer<typeof lineConfigSchema>;

export const areaConfigSchema = comboConfigSchema.extend({
  type: z.literal('area'),
  stack: z.boolean().optional(),
});

export type IAreaConfig = z.infer<typeof areaConfigSchema>;

export const pieConfigSchema = z.object({
  type: z.literal('pie'),
  dimension: z.string().optional(),
  measure: z
    .object({
      column: z.string(),
      decimal: z.number().max(10).min(0).optional(),
      prefix: z.string().optional(),
      suffix: z.string().optional(),
    })
    .optional(),
  showLabel: z.boolean().optional(),
  showTotal: z.boolean().optional(),
  showLegend: z.boolean().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IPieConfig = z.infer<typeof pieConfigSchema>;

export const tableConfigColumn = z.object({
  column: z.string(),
  width: z.number().optional(),
  label: z.string().optional(),
  hidden: z.boolean().optional(),
});
export type ITableConfigColumn = z.infer<typeof tableConfigColumn>;
export const tableConfigSchema = z.object({
  type: z.literal('table'),
  columns: z.array(tableConfigColumn).optional(),
});

export type ITableConfig = z.infer<typeof tableConfigSchema>;

export const scatterConfigSchema = z.object({
  type: z.literal('scatter'),
  x: z.string().optional(),
  y: z.string().optional(),
  series: z.string().optional(),
  pointSize: z.number().min(2).max(30).optional(),
  padding: chartPaddingSchema.optional(),
});

export type IScatterConfig = z.infer<typeof scatterConfigSchema>;

export const funnelConfigSchema = z.object({
  type: z.literal('funnel'),
  dimension: z.string().optional(),
  value: z.string().optional(),
  showLabel: z.boolean().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IFunnelConfig = z.infer<typeof funnelConfigSchema>;

export const progressConfigSchema = z.object({
  type: z.literal('progress'),
  value: z.string().optional(),
  target: z.number().optional(),
  mode: z.union([z.literal('circle'), z.literal('bar')]).optional(),
  padding: chartPaddingSchema.optional(),
});

export type IProgressConfig = z.infer<typeof progressConfigSchema>;

export const roseConfigSchema = z.object({
  type: z.literal('rose'),
  dimension: z.string().optional(),
  value: z.string().optional(),
  showLegend: z.boolean().optional(),
  showLabel: z.boolean().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IRoseConfig = z.infer<typeof roseConfigSchema>;

export const radarConfigSchema = z.object({
  type: z.literal('radar'),
  dimensions: z.array(z.string()).optional(),
  value: z.string().optional(),
  showLegend: z.boolean().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IRadarConfig = z.infer<typeof radarConfigSchema>;

export const gaugeConfigSchema = z.object({
  type: z.literal('gauge'),
  value: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IGaugeConfig = z.infer<typeof gaugeConfigSchema>;

export const heatmapConfigSchema = z.object({
  type: z.literal('heatmap'),
  x: z.string().optional(),
  y: z.string().optional(),
  value: z.string().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IHeatmapConfig = z.infer<typeof heatmapConfigSchema>;

export const sunburstConfigSchema = z.object({
  type: z.literal('sunburst'),
  path: z.array(z.string()).optional(),
  value: z.string().optional(),
  padding: chartPaddingSchema.optional(),
});

export type ISunburstConfig = z.infer<typeof sunburstConfigSchema>;

export const candlestickConfigSchema = z.object({
  type: z.literal('candlestick'),
  time: z.string().optional(),
  open: z.string().optional(),
  high: z.string().optional(),
  low: z.string().optional(),
  close: z.string().optional(),
  padding: chartPaddingSchema.optional(),
});

export type ICandlestickConfig = z.infer<typeof candlestickConfigSchema>;

export const boxplotConfigSchema = z.object({
  type: z.literal('boxplot'),
  group: z.string().optional(),
  min: z.string().optional(),
  q1: z.string().optional(),
  median: z.string().optional(),
  q3: z.string().optional(),
  max: z.string().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IBoxplotConfig = z.infer<typeof boxplotConfigSchema>;

export const parallelConfigSchema = z.object({
  type: z.literal('parallel'),
  dimensions: z.array(z.string()).optional(),
  padding: chartPaddingSchema.optional(),
});

export type IParallelConfig = z.infer<typeof parallelConfigSchema>;

export const pictorialBarConfigSchema = z.object({
  type: z.literal('pictorialBar'),
  dimension: z.string().optional(),
  value: z.string().optional(),
  symbol: z.string().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IPictorialBarConfig = z.infer<typeof pictorialBarConfigSchema>;

export const treemapConfigSchema = z.object({
  type: z.literal('treemap'),
  path: z.array(z.string()).optional(),
  value: z.string().optional(),
  padding: chartPaddingSchema.optional(),
});

export type ITreemapConfig = z.infer<typeof treemapConfigSchema>;

export const sankeyConfigSchema = z.object({
  type: z.literal('sankey'),
  source: z.string().optional(),
  target: z.string().optional(),
  value: z.string().optional(),
  padding: chartPaddingSchema.optional(),
});

export type ISankeyConfig = z.infer<typeof sankeyConfigSchema>;

export const graphConfigSchema = z.object({
  type: z.literal('graph'),
  nodeId: z.string().optional(),
  source: z.string().optional(),
  target: z.string().optional(),
  value: z.string().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IGraphConfig = z.infer<typeof graphConfigSchema>;

export const mapConfigSchema = z.object({
  type: z.literal('map'),
  region: z.string().optional(),
  value: z.string().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IMapConfig = z.infer<typeof mapConfigSchema>;

export const themeRiverConfigSchema = z.object({
  type: z.literal('themeRiver'),
  time: z.string().optional(),
  category: z.string().optional(),
  value: z.string().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IThemeRiverConfig = z.infer<typeof themeRiverConfigSchema>;

export const wordCloudConfigSchema = z.object({
  type: z.literal('wordCloud'),
  word: z.string().optional(),
  value: z.string().optional(),
  padding: chartPaddingSchema.optional(),
});

export type IWordCloudConfig = z.infer<typeof wordCloudConfigSchema>;

export const chartConfigSchema = z.union([
  barConfigSchema,
  lineConfigSchema,
  areaConfigSchema,
  pieConfigSchema,
  tableConfigSchema,
  scatterConfigSchema,
  funnelConfigSchema,
  progressConfigSchema,
  roseConfigSchema,
  radarConfigSchema,
  gaugeConfigSchema,
  heatmapConfigSchema,
  sunburstConfigSchema,
  candlestickConfigSchema,
  boxplotConfigSchema,
  parallelConfigSchema,
  pictorialBarConfigSchema,
  treemapConfigSchema,
  sankeyConfigSchema,
  graphConfigSchema,
  mapConfigSchema,
  themeRiverConfigSchema,
  wordCloudConfigSchema,
]);

export type IChartConfig = z.infer<typeof chartConfigSchema>;

export interface IChartInteractionFilter {
  source:
    | 'combo'
    | 'pie'
    | 'table'
    | 'scatter'
    | 'funnel'
    | 'progress'
    | 'rose'
    | 'radar'
    | 'gauge'
    | 'heatmap'
    | 'sunburst'
    | 'candlestick'
    | 'boxplot'
    | 'parallel'
    | 'pictorialBar'
    | 'treemap'
    | 'sankey'
    | 'graph'
    | 'map'
    | 'themeRiver'
    | 'wordCloud';
  dimensionColumn: string;
  dimensionValues: (string | number)[];
}

export type IChartInteractionMode = 'single' | 'multi';

export type IChartInteractionClearBehavior = 'toggle-empty' | 'explicit-only';

export interface IChartInteractionConfig {
  mode?: IChartInteractionMode;
  clearBehavior?: IChartInteractionClearBehavior;
}

export interface IChartInteractionState {
  filter?: IChartInteractionFilter;
  config?: IChartInteractionConfig;
}

export interface IChartStorage {
  config?: IChartConfig;
  query: IBaseQuery;
  interaction?: IChartInteractionState;
}

export interface IPageParams {
  baseId: string;
  pluginInstallId: string;
  positionId: string;
  positionType: PluginPosition;
  pluginId: string;
  tableId?: string;
}
