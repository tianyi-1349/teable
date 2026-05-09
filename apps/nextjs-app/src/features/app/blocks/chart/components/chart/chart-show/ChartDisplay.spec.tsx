import { render, screen } from '@/test-utils';
import { ChartDisplay } from './ChartDisplay';

const mockBaseQueryData = vi.fn();
const mockChartContext = vi.fn();

vi.mock('../../../hooks/useBaseQueryData', () => ({
  useBaseQueryData: () => mockBaseQueryData(),
}));

vi.mock('../../ChartProvider', () => ({
  ChartContext: {
    get Provider() {
      return ({ children }: { children: React.ReactNode }) => children;
    },
    get _currentValue() {
      return mockChartContext();
    },
  },
}));

vi.mock('./scatter/Scatter', () => ({
  ChartScatter: () => <div data-testid="chart-scatter" />,
}));

vi.mock('./funnel/Funnel', () => ({
  ChartFunnel: () => <div data-testid="chart-funnel" />,
}));

vi.mock('./progress/Progress', () => ({
  ChartProgress: () => <div data-testid="chart-progress" />,
}));

vi.mock('./rose/Rose', () => ({
  ChartRose: () => <div data-testid="chart-rose" />,
}));

vi.mock('./radar/Radar', () => ({
  ChartRadar: () => <div data-testid="chart-radar" />,
}));

vi.mock('./echarts/EChartsAdvanced', () => ({
  ChartGauge: () => <div data-testid="chart-gauge" />,
  ChartHeatmap: () => <div data-testid="chart-heatmap" />,
  ChartSunburst: () => <div data-testid="chart-sunburst" />,
  ChartCandlestick: () => <div data-testid="chart-candlestick" />,
  ChartBoxplot: () => <div data-testid="chart-boxplot" />,
  ChartParallel: () => <div data-testid="chart-parallel" />,
  ChartPictorialBar: () => <div data-testid="chart-pictorial" />,
  ChartTreemap: () => <div data-testid="chart-treemap" />,
  ChartSankey: () => <div data-testid="chart-sankey" />,
  ChartGraph: () => <div data-testid="chart-graph" />,
  ChartMap: () => <div data-testid="chart-map" />,
  ChartThemeRiver: () => <div data-testid="chart-themeRiver" />,
  ChartWordCloud: () => <div data-testid="chart-wordCloud" />,
}));

vi.mock('./combo/Combo', () => ({
  ChartCombo: () => <div data-testid="chart-combo" />,
}));

vi.mock('./pie/Pie', () => ({
  ChartPie: () => <div data-testid="chart-pie" />,
}));

vi.mock('./table/ChartTable', () => ({
  ChartTable: () => <div data-testid="chart-table" />,
}));

describe('ChartDisplay', () => {
  beforeEach(() => {
    mockBaseQueryData.mockReturnValue({ rows: [], columns: [] });
    mockChartContext.mockReturnValue({
      storage: { config: { type: 'scatter' } },
      queryError: undefined,
    });
  });

  const setupChart = (type: string) => {
    mockChartContext.mockReturnValue({
      storage: { config: { type } },
      queryError: undefined,
    });
  };

  describe('routes combo chart types', () => {
    it('routes bar type to ChartCombo', () => {
      setupChart('bar');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-combo')).toBeInTheDocument();
    });

    it('routes line type to ChartCombo', () => {
      setupChart('line');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-combo')).toBeInTheDocument();
    });

    it('routes area type to ChartCombo', () => {
      setupChart('area');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-combo')).toBeInTheDocument();
    });
  });

  describe('routes pie and table', () => {
    it('routes pie type', () => {
      setupChart('pie');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-pie')).toBeInTheDocument();
    });

    it('routes table type', () => {
      setupChart('table');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-table')).toBeInTheDocument();
    });
  });

  describe('routes new chart types', () => {
    it('routes scatter type', () => {
      setupChart('scatter');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-scatter')).toBeInTheDocument();
    });

    it('routes funnel type', () => {
      setupChart('funnel');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-funnel')).toBeInTheDocument();
    });

    it('routes progress type', () => {
      setupChart('progress');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-progress')).toBeInTheDocument();
    });

    it('routes rose type', () => {
      setupChart('rose');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-rose')).toBeInTheDocument();
    });

    it('routes radar type', () => {
      setupChart('radar');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-radar')).toBeInTheDocument();
    });

    it('routes gauge type', () => {
      setupChart('gauge');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-gauge')).toBeInTheDocument();
    });

    it('routes heatmap type', () => {
      setupChart('heatmap');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-heatmap')).toBeInTheDocument();
    });

    it('routes sunburst type', () => {
      setupChart('sunburst');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-sunburst')).toBeInTheDocument();
    });

    it('routes candlestick type', () => {
      setupChart('candlestick');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-candlestick')).toBeInTheDocument();
    });

    it('routes boxplot type', () => {
      setupChart('boxplot');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-boxplot')).toBeInTheDocument();
    });

    it('routes parallel type', () => {
      setupChart('parallel');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-parallel')).toBeInTheDocument();
    });

    it('routes pictorialBar type', () => {
      setupChart('pictorialBar');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-pictorial')).toBeInTheDocument();
    });

    it('routes treemap type', () => {
      setupChart('treemap');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-treemap')).toBeInTheDocument();
    });

    it('routes sankey type', () => {
      setupChart('sankey');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-sankey')).toBeInTheDocument();
    });

    it('routes graph type', () => {
      setupChart('graph');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-graph')).toBeInTheDocument();
    });

    it('routes map type to not supported', () => {
      setupChart('map');
      render(<ChartDisplay />);
      expect(screen.getByText(/notSupport/)).toBeInTheDocument();
    });

    it('routes themeRiver type', () => {
      setupChart('themeRiver');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-themeRiver')).toBeInTheDocument();
    });

    it('routes wordCloud type', () => {
      setupChart('wordCloud');
      render(<ChartDisplay />);
      expect(screen.getByTestId('chart-wordCloud')).toBeInTheDocument();
    });
  });

  describe('handles edge cases', () => {
    it('shows error message when queryError exists', () => {
      mockChartContext.mockReturnValue({
        storage: { config: { type: 'bar' } },
        queryError: 'Test error',
      });
      render(<ChartDisplay />);
      expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();
    });

    it('shows loading spinner when queryData is null', () => {
      mockBaseQueryData.mockReturnValue(null);
      const { container } = render(<ChartDisplay />);
      // Spin component renders a spinner div
      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('shows table when previewTable is true', () => {
      setupChart('bar');
      render(<ChartDisplay previewTable />);
      expect(screen.getByTestId('chart-table')).toBeInTheDocument();
    });

    it('returns nothing when config type is missing', () => {
      mockChartContext.mockReturnValue({
        storage: { config: {} },
        queryError: undefined,
      });
      const { container } = render(<ChartDisplay />);
      expect(container.firstChild).toBeNull();
    });
  });
});
