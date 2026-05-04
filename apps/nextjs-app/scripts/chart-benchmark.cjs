/* eslint-disable no-console */

const { performance } = require('node:perf_hooks');

function makeRows(size) {
  const countries = ['US', 'CN', 'JP', 'DE', 'FR', 'IN', 'BR', 'GB'];
  const rows = [];
  for (let i = 0; i < size; i += 1) {
    rows.push({
      country: countries[i % countries.length],
      score: (i * 17) % 1000,
      category: `cat-${i % 50}`,
    });
  }
  return rows;
}

function applyInteractionFilter(rows, dimensionColumn, dimensionValues) {
  const valueSet = new Set(dimensionValues);
  return rows.filter((row) => valueSet.has(row[dimensionColumn]));
}

function summarize(latencies) {
  const sorted = [...latencies].sort((a, b) => a - b);
  const p50 = sorted[Math.floor(sorted.length * 0.5)] ?? 0;
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? 0;
  const max = sorted[sorted.length - 1] ?? 0;
  const avg = latencies.reduce((acc, cur) => acc + cur, 0) / latencies.length;
  return { p50, p95, max, avg };
}

function runDatasetBenchmark(size) {
  const rows = makeRows(size);
  const latencies = [];
  const frameDurations = [];

  const memoryBefore = process.memoryUsage().heapUsed;

  for (let i = 0; i < 120; i += 1) {
    const selected = i % 2 === 0 ? ['US', 'JP'] : ['CN'];
    const t0 = performance.now();
    applyInteractionFilter(rows, 'country', selected);
    const t1 = performance.now();
    latencies.push(t1 - t0);
  }

  for (let i = 0; i < 120; i += 1) {
    const frameStart = performance.now();
    applyInteractionFilter(rows, 'country', ['US', 'CN', 'JP']);
    const frameEnd = performance.now();
    frameDurations.push(frameEnd - frameStart);
  }

  const memoryAfter = process.memoryUsage().heapUsed;
  const longFrames = frameDurations.filter((d) => d > 16.7).length;
  const fpsEstimate =
    1000 / (frameDurations.reduce((a, b) => a + b, 0) / frameDurations.length || 1);

  return {
    size,
    clickLatencyMs: summarize(latencies),
    frameTimeMs: summarize(frameDurations),
    estimatedFps: fpsEstimate,
    longFrameRatio: longFrames / frameDurations.length,
    heapDeltaMB: (memoryAfter - memoryBefore) / (1024 * 1024),
  };
}

function main() {
  const results = [5000, 20000, 50000].map((size) => runDatasetBenchmark(size));
  console.log('\nChart Interaction Benchmark (simulated filter path)');
  console.table(
    results.map((item) => ({
      rows: item.size,
      clickP50Ms: item.clickLatencyMs.p50.toFixed(3),
      clickP95Ms: item.clickLatencyMs.p95.toFixed(3),
      estimatedFps: item.estimatedFps.toFixed(1),
      longFrameRatio: item.longFrameRatio.toFixed(3),
      heapDeltaMB: item.heapDeltaMB.toFixed(3),
    }))
  );
}

main();
