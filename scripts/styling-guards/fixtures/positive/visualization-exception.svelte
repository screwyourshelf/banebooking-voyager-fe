<script>
  let height = 42;
</script>

<div style={`--statistics-bar-height: ${height}%`} data-stat-role="chart-value"></div>
<svg viewBox="0 0 100 100" aria-label="Datapunkt">
  <circle cx={height} cy="50" r="4"></circle>
</svg>

<style>
  div {
    height: var(--statistics-bar-height);
  }
</style>
