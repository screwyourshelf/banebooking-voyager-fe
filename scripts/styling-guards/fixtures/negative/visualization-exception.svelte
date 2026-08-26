<script>
  let chartWidth = 420;
  let color = "#4c911f";
</script>

<div
  data-visualization="identity"
  style={`--statistics-line-chart-width: ${chartWidth}px; color: ${color}`}
></div>
<strong data-stat-role="brand-heading">42</strong>
<svg data-visualization="svg" viewBox="0 0 100 100" fill={color} aria-label="Datapunkt">
  <rect rx="4" filter="url(#identity-shadow)"></rect>
  <text data-visualization="label" text-anchor="middle">42</text>
</svg>

<style>
  [data-visualization="line-plot"] {
    width: var(--statistics-line-chart-width);
    color: var(--statistics-series-color);
  }

  [data-visualization="svg"] {
    width: 20rem;
  }
</style>
