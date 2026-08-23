<div class="statistics-loading" role="status" aria-label="Laster statistikk" aria-live="polite">
  <div class="statistics-loading__metrics" aria-hidden="true">
    {#each Array(4) as _, index (index)}
      <span class="statistics-loading__metric"></span>
    {/each}
  </div>
  <div class="statistics-loading__chart" aria-hidden="true">
    <span class="statistics-loading__title"></span>
    <span class="statistics-loading__plot"></span>
  </div>
</div>
