<script>
  let chartWidth = 420;
</script>

<div data-visualization="line-plot" style={`--statistics-line-chart-width: ${chartWidth}px`}>
  <svg data-visualization="svg" width={chartWidth} height="100" viewBox={`0 0 ${chartWidth} 100`}>
    <circle data-visualization="point" data-series="current" cx={chartWidth / 2} cy="50" r="4">
      <title>Datapunkt</title>
    </circle>
  </svg>
</div>

<style>
  [data-visualization="line-plot"] {
    width: var(--statistics-line-chart-width);
  }
</style>
