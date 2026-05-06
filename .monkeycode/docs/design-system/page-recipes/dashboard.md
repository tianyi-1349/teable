# Dashboard Recipe

## Scope

Use this recipe for dashboard pages, dashboard blocks, chart containers, metric summaries, and surrounding filter or explanation areas in `apps/nextjs-app`.

## Goals

- Help users understand the state of data quickly.
- Keep comparisons easy across cards and widgets.
- Make filters, metrics, and chart context readable without visual clutter.

## Layout Rules

- Put high-value summary information near the top of each card.
- Keep title, metric, trend, and filter context visually grouped.
- Do not let chart chrome dominate the card.
- Align cards to make scanning across a dashboard easy.
- Use consistent header and body spacing across different dashboard blocks.

## Chart Rules

- A chart should support a question, not merely decorate the screen.
- Prefer concise titles and short supporting descriptions.
- Keep legends, labels, and controls compact.
- When space is limited, prioritize the chart and the key metric over secondary metadata.
- Use `updateMode="replace"` unless the task explicitly requires incremental merge behavior.

## Metric Card Rules

- Lead with the core number.
- Put change indicators and time context close to the number.
- Keep supporting text short and scannable.
- Avoid overly large typography that breaks comparison across cards.

## Filter and Empty State Rules

- Filters should feel connected to the widgets they affect.
- Empty states should explain what is missing and what the user can do next.
- Loading states should preserve card shape to reduce layout jump.

## Anti-patterns

- Do not turn every card into a visually loud hero block.
- Do not bury filter context far from the affected chart.
- Do not add extra containers that reduce usable chart area.
- Do not introduce decorative color usage that weakens metric readability.

## Verification

- Compare at least two cards side by side for visual rhythm.
- Check that the key metric is visible before the chart details.
- Check that the layout still works on narrow screens.
- Check that chart usage still follows the shared `Chart` component constraint.
