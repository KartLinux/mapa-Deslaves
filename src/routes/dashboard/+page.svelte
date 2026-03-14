<script lang="ts">
  import type { PageData } from './$types';
  import DashboardPanel from '$lib/components/organisms/DashboardPanel.svelte';

  export let data: PageData;
  $: eventos = data.eventos ?? [];

  let selectedYear = '';
  $: años = [...new Set(eventos.map(e => e.año).filter(Boolean))].sort();
  $: filteredEventos = selectedYear ? eventos.filter(e => String(e.año) === selectedYear) : eventos;
</script>

<svelte:head>
  <title>Dashboard - SNGR Ecuador</title>
</svelte:head>

<div class="page-container">
  <div class="dashboard-header">
    <h1>📊 Dashboard de Eventos Adversos</h1>
    <div class="year-filter">
      <label for="year-select">Filtrar por año:</label>
      <select id="year-select" bind:value={selectedYear}>
        <option value="">Todos los años</option>
        {#each años as año}
          <option value={String(año)}>{año}</option>
        {/each}
      </select>
    </div>
  </div>
  <DashboardPanel eventos={filteredEventos} />
</div>

<style>
.dashboard-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 24px; flex-wrap: wrap; gap: 12px;
}
h1 { margin: 0; font-size: 1.5rem; }
.year-filter { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
select {
  background: var(--color--surface); color: var(--color--text);
  border: 1px solid var(--color--border); border-radius: 8px;
  padding: 6px 10px; font-size: 0.9rem;
}
</style>
