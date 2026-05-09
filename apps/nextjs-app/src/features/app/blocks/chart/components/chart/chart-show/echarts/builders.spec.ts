import { describe, expect, it } from 'vitest';
import {
  buildBoxplotOption,
  buildCandlestickOption,
  buildFunnelOption,
  buildGaugeOption,
  buildGraphOption,
  buildHeatmapOption,
  buildMapOption,
  buildParallelOption,
  buildPictorialBarOption,
  buildProgressOption,
  buildRoseOption,
  buildSankeyOption,
  buildSunburstOption,
  buildThemeRiverOption,
  buildTreemapOption,
  buildWordCloudOption,
} from './builders';

describe('echarts builders', () => {
  describe('buildFunnelOption', () => {
    it('returns empty data when missing columns', () => {
      const option = buildFunnelOption({ type: 'funnel' }, [{ a: 1 }]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('funnel');
      expect(Array.isArray(series.data)).toBe(true);
      expect((series.data as unknown[]).length).toBe(0);
    });

    it('builds funnel with valid data', () => {
      const option = buildFunnelOption({ type: 'funnel', dimension: 'name', value: 'val' }, [
        { name: 'A', val: 100 },
        { name: 'B', val: 50 },
      ]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('funnel');
      expect((series.data as unknown[]).length).toBe(2);
    });

    it('applies padding when configured', () => {
      const option = buildFunnelOption(
        {
          type: 'funnel',
          dimension: 'name',
          value: 'val',
          padding: { top: 30, right: 40, bottom: 50, left: 60 },
        },
        [{ name: 'A', val: 100 }]
      );
      expect(option.grid).toEqual({ top: 30, right: 40, bottom: 50, left: 60 });
    });

    it('hides label when showLabel is false', () => {
      const option = buildFunnelOption(
        { type: 'funnel', dimension: 'name', value: 'val', showLabel: false },
        [{ name: 'A', val: 100 }]
      );
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.label).toEqual({ show: false });
    });
  });

  describe('buildProgressOption', () => {
    it('builds progress in gauge mode by default', () => {
      const option = buildProgressOption({ type: 'progress', value: 'v' }, [{ v: 50 }]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('gauge');
    });

    it('builds progress in bar mode when configured', () => {
      const option = buildProgressOption({ type: 'progress', value: 'v', mode: 'bar' }, [
        { v: 50 },
      ]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('bar');
    });

    it('applies padding when configured', () => {
      const option = buildProgressOption(
        { type: 'progress', value: 'v', padding: { top: 10, right: 20, bottom: 30, left: 40 } },
        [{ v: 50 }]
      );
      expect(option.grid).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
    });
  });

  describe('buildRoseOption', () => {
    it('builds rose pie with roseType radius', () => {
      const option = buildRoseOption('name', 'value', [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
      ]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('pie');
      expect(series.roseType).toBe('radius');
    });

    it('hides legend when showLegend is false', () => {
      const option = buildRoseOption('name', 'value', [{ name: 'A', value: 10 }], false);
      expect(option.legend).toBeUndefined();
    });

    it('hides label when showLabel is false', () => {
      const option = buildRoseOption('name', 'value', [{ name: 'A', value: 10 }], undefined, false);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.label).toEqual({ show: false });
    });

    it('applies padding when configured', () => {
      const option = buildRoseOption(
        'name',
        'value',
        [{ name: 'A', value: 10 }],
        undefined,
        undefined,
        { top: 15, right: 25, bottom: 35, left: 45 }
      );
      expect(option.grid).toEqual({ top: 15, right: 25, bottom: 35, left: 45 });
    });
  });

  describe('buildGaugeOption', () => {
    it('builds gauge with value', () => {
      const option = buildGaugeOption({ type: 'gauge', value: 'v' }, [{ v: 75 }]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('gauge');
      expect((series.data as Array<Record<string, unknown>>)[0].value).toBe(75);
    });

    it('uses min and max from config', () => {
      const option = buildGaugeOption({ type: 'gauge', value: 'v', min: -10, max: 200 }, [
        { v: 75 },
      ]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.min).toBe(-10);
      expect(series.max).toBe(200);
    });

    it('applies padding when configured', () => {
      const option = buildGaugeOption(
        { type: 'gauge', value: 'v', padding: { top: 10, right: 20, bottom: 30, left: 40 } },
        [{ v: 75 }]
      );
      expect(option.grid).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
    });
  });

  describe('buildHeatmapOption', () => {
    it('returns empty option for invalid heatmap columns', () => {
      const option = buildHeatmapOption({ type: 'heatmap', x: 'x' }, [{ x: 1 }]);
      expect(Object.keys(option).length).toBe(0);
    });

    it('builds heatmap with valid data', () => {
      const option = buildHeatmapOption({ type: 'heatmap', x: 'x', y: 'y', value: 'v' }, [
        { x: 'A', y: 'X', v: 10 },
        { x: 'B', y: 'Y', v: 20 },
      ]);
      expect(option.xAxis).toBeDefined();
      expect(option.yAxis).toBeDefined();
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('heatmap');
      expect((series.data as unknown[]).length).toBe(2);
    });

    it('applies padding when configured', () => {
      const option = buildHeatmapOption(
        {
          type: 'heatmap',
          x: 'x',
          y: 'y',
          value: 'v',
          padding: { top: 40, right: 50, bottom: 60, left: 70 },
        },
        [{ x: 'A', y: 'X', v: 10 }]
      );
      expect(option.grid).toEqual({ top: 40, right: 50, bottom: 60, left: 70 });
    });
  });

  describe('buildSunburstOption', () => {
    it('builds sunburst with valid data', () => {
      const option = buildSunburstOption({ type: 'sunburst', path: ['category'], value: 'val' }, [
        { category: 'A', val: 100 },
        { category: 'B', val: 200 },
      ]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('sunburst');
      expect((series.data as unknown[]).length).toBe(2);
    });

    it('returns empty option when path is missing', () => {
      const option = buildSunburstOption({ type: 'sunburst', value: 'val' }, [{ val: 100 }]);
      expect(Object.keys(option).length).toBe(0);
    });

    it('applies padding when configured', () => {
      const option = buildSunburstOption(
        {
          type: 'sunburst',
          path: ['category'],
          value: 'val',
          padding: { top: 10, right: 20, bottom: 30, left: 40 },
        },
        [{ category: 'A', val: 100 }]
      );
      expect(option.grid).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
    });
  });

  describe('buildCandlestickOption', () => {
    it('builds candlestick with valid data', () => {
      const option = buildCandlestickOption(
        { type: 'candlestick', time: 't', open: 'o', high: 'h', low: 'l', close: 'c' },
        [
          { t: '2024-01-01', o: 100, h: 110, l: 90, c: 105 },
          { t: '2024-01-02', o: 105, h: 115, l: 95, c: 110 },
        ]
      );
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('candlestick');
      expect((series.data as unknown[]).length).toBe(2);
    });

    it('returns empty option when columns are missing', () => {
      const option = buildCandlestickOption({ type: 'candlestick', time: 't', open: 'o' }, [
        { t: '2024-01-01', o: 100 },
      ]);
      expect(Object.keys(option).length).toBe(0);
    });

    it('applies padding when configured', () => {
      const option = buildCandlestickOption(
        {
          type: 'candlestick',
          time: 't',
          open: 'o',
          high: 'h',
          low: 'l',
          close: 'c',
          padding: { top: 15, right: 25, bottom: 35, left: 45 },
        },
        [{ t: '2024-01-01', o: 100, h: 110, l: 90, c: 105 }]
      );
      expect(option.grid).toEqual({ top: 15, right: 25, bottom: 35, left: 45 });
    });
  });

  describe('buildBoxplotOption', () => {
    it('builds boxplot with valid data', () => {
      const option = buildBoxplotOption(
        { type: 'boxplot', group: 'g', min: 'min', q1: 'q1', median: 'med', q3: 'q3', max: 'max' },
        [
          { g: 'A', min: 0, q1: 25, med: 50, q3: 75, max: 100 },
          { g: 'B', min: 10, q1: 30, med: 55, q3: 80, max: 110 },
        ]
      );
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('boxplot');
      expect((series.data as unknown[]).length).toBe(2);
    });

    it('returns empty option when columns are missing', () => {
      const option = buildBoxplotOption({ type: 'boxplot', group: 'g' }, [{ g: 'A' }]);
      expect(Object.keys(option).length).toBe(0);
    });

    it('applies padding when configured', () => {
      const option = buildBoxplotOption(
        {
          type: 'boxplot',
          group: 'g',
          min: 'min',
          q1: 'q1',
          median: 'med',
          q3: 'q3',
          max: 'max',
          padding: { top: 10, right: 20, bottom: 30, left: 40 },
        },
        [{ g: 'A', min: 0, q1: 25, med: 50, q3: 75, max: 100 }]
      );
      expect(option.grid).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
    });
  });

  describe('buildParallelOption', () => {
    it('builds parallel with valid data', () => {
      const option = buildParallelOption({ type: 'parallel', dimensions: ['a', 'b', 'c'] }, [
        { a: 1, b: 2, c: 3 },
        { a: 4, b: 5, c: 6 },
      ]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('parallel');
      expect((series.data as unknown[]).length).toBe(2);
    });

    it('returns empty option when less than 2 dimensions', () => {
      const option = buildParallelOption({ type: 'parallel', dimensions: ['a'] }, [{ a: 1 }]);
      expect(Object.keys(option).length).toBe(0);
    });

    it('applies padding when configured', () => {
      const option = buildParallelOption(
        {
          type: 'parallel',
          dimensions: ['a', 'b'],
          padding: { top: 40, right: 50, bottom: 60, left: 70 },
        },
        [{ a: 1, b: 2 }]
      );
      expect(option.grid).toEqual({ top: 40, right: 50, bottom: 60, left: 70 });
    });
  });

  describe('buildPictorialBarOption', () => {
    it('builds pictorial bar with valid data', () => {
      const option = buildPictorialBarOption(
        { type: 'pictorialBar', dimension: 'name', value: 'val' },
        [
          { name: 'A', val: 100 },
          { name: 'B', val: 200 },
        ]
      );
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('pictorialBar');
      expect((series.data as unknown[]).length).toBe(2);
    });

    it('returns empty option when columns are missing', () => {
      const option = buildPictorialBarOption({ type: 'pictorialBar', dimension: 'name' }, [
        { name: 'A' },
      ]);
      expect(Object.keys(option).length).toBe(0);
    });

    it('applies padding when configured', () => {
      const option = buildPictorialBarOption(
        {
          type: 'pictorialBar',
          dimension: 'name',
          value: 'val',
          padding: { top: 10, right: 20, bottom: 30, left: 40 },
        },
        [{ name: 'A', val: 100 }]
      );
      expect(option.grid).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
    });
  });

  describe('buildTreemapOption', () => {
    it('builds treemap with valid data', () => {
      const option = buildTreemapOption({ type: 'treemap', path: ['category'], value: 'val' }, [
        { category: 'A', val: 100 },
        { category: 'B', val: 200 },
      ]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('treemap');
      expect((series.data as unknown[]).length).toBe(2);
    });

    it('returns empty option when path is missing', () => {
      const option = buildTreemapOption({ type: 'treemap', value: 'val' }, [{ val: 100 }]);
      expect(Object.keys(option).length).toBe(0);
    });

    it('applies padding when configured', () => {
      const option = buildTreemapOption(
        {
          type: 'treemap',
          path: ['category'],
          value: 'val',
          padding: { top: 10, right: 20, bottom: 30, left: 40 },
        },
        [{ category: 'A', val: 100 }]
      );
      expect(option.grid).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
    });
  });

  describe('buildSankeyOption', () => {
    it('builds sankey with valid data', () => {
      const option = buildSankeyOption(
        { type: 'sankey', source: 'from', target: 'to', value: 'val' },
        [
          { from: 'A', to: 'B', val: 100 },
          { from: 'B', to: 'C', val: 50 },
        ]
      );
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('sankey');
      expect((series.links as unknown[]).length).toBe(2);
    });

    it('returns empty option when columns are missing', () => {
      const option = buildSankeyOption({ type: 'sankey', source: 'from' }, [{ from: 'A' }]);
      expect(Object.keys(option).length).toBe(0);
    });

    it('applies padding when configured', () => {
      const option = buildSankeyOption(
        {
          type: 'sankey',
          source: 'from',
          target: 'to',
          value: 'val',
          padding: { top: 10, right: 20, bottom: 30, left: 40 },
        },
        [{ from: 'A', to: 'B', val: 100 }]
      );
      expect(option.grid).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
    });
  });

  describe('buildGraphOption', () => {
    it('builds graph with valid data', () => {
      const option = buildGraphOption({ type: 'graph', source: 'from', target: 'to' }, [
        { from: 'A', to: 'B' },
        { from: 'B', to: 'C' },
      ]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('graph');
      expect((series.links as unknown[]).length).toBe(2);
    });

    it('includes nodeId in data when configured', () => {
      const option = buildGraphOption(
        { type: 'graph', source: 'from', target: 'to', nodeId: 'id' },
        [{ from: 'A', to: 'B' }]
      );
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      const data = (series.data as Array<Record<string, unknown>>) ?? [];
      expect(data[0].id).toBe('A');
    });

    it('applies padding when configured', () => {
      const option = buildGraphOption(
        {
          type: 'graph',
          source: 'from',
          target: 'to',
          padding: { top: 10, right: 20, bottom: 30, left: 40 },
        },
        [{ from: 'A', to: 'B' }]
      );
      expect(option.grid).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
    });
  });

  describe('buildMapOption', () => {
    it('builds map with valid data', () => {
      const option = buildMapOption({ type: 'map', region: 'country', value: 'val' }, [
        { country: 'USA', val: 100 },
        { country: 'China', val: 200 },
      ]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('map');
      expect((series.data as unknown[]).length).toBe(2);
    });

    it('returns empty option when columns are missing', () => {
      const option = buildMapOption({ type: 'map', region: 'country' }, [{ country: 'USA' }]);
      expect(Object.keys(option).length).toBe(0);
    });

    it('applies padding when configured', () => {
      const option = buildMapOption(
        {
          type: 'map',
          region: 'country',
          value: 'val',
          padding: { top: 10, right: 20, bottom: 30, left: 40 },
        },
        [{ country: 'USA', val: 100 }]
      );
      expect(option.grid).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
    });
  });

  describe('buildThemeRiverOption', () => {
    it('builds theme river with valid data', () => {
      const option = buildThemeRiverOption(
        { type: 'themeRiver', time: 't', category: 'cat', value: 'val' },
        [
          { t: '2024-01-01', cat: 'A', val: 100 },
          { t: '2024-01-02', cat: 'B', val: 200 },
        ]
      );
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('themeRiver');
      expect((series.data as unknown[]).length).toBe(2);
    });

    it('returns empty option when columns are missing', () => {
      const option = buildThemeRiverOption({ type: 'themeRiver', time: 't' }, [
        { t: '2024-01-01' },
      ]);
      expect(Object.keys(option).length).toBe(0);
    });

    it('applies padding when configured', () => {
      const option = buildThemeRiverOption(
        {
          type: 'themeRiver',
          time: 't',
          category: 'cat',
          value: 'val',
          padding: { top: 40, right: 50, bottom: 60, left: 70 },
        },
        [{ t: '2024-01-01', cat: 'A', val: 100 }]
      );
      expect(option.grid).toEqual({ top: 40, right: 50, bottom: 60, left: 70 });
    });
  });

  describe('buildWordCloudOption', () => {
    it('builds wordcloud option with data', () => {
      const option = buildWordCloudOption({ type: 'wordCloud', word: 'word', value: 'score' }, [
        { word: 'alpha', score: 3 },
        { word: 'beta', score: 8 },
      ]);
      const series = ((option.series as Array<Record<string, unknown>>) ?? [])[0] ?? {};
      expect(series.type).toBe('wordCloud');
      expect((series.data as unknown[]).length).toBe(2);
    });

    it('returns empty option when keys are missing', () => {
      const option = buildWordCloudOption({ type: 'wordCloud' }, [{ word: 'alpha', score: 3 }]);
      expect(Object.keys(option).length).toBe(0);
    });

    it('applies padding when configured', () => {
      const option = buildWordCloudOption(
        {
          type: 'wordCloud',
          word: 'word',
          value: 'score',
          padding: { top: 10, right: 20, bottom: 30, left: 40 },
        },
        [{ word: 'alpha', score: 3 }]
      );
      expect(option.grid).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
    });
  });
});
