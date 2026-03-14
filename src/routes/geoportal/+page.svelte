<script lang="ts">
  import type { PageData } from './$types';
  import { browser } from '$app/environment';
  import FilterPanel from '$lib/components/organisms/FilterPanel.svelte';
  import MapContainer from '$lib/components/organisms/MapContainer.svelte';
  import { filtros, eventosFiltrados, eventosStore } from '$lib/data/eventosStore';

  export let data: PageData;

  $: eventosStore.set(data.eventos ?? []);
</script>

<svelte:head>
  <title>Geoportal SNGR - Mapa Interactivo</title>
</svelte:head>

<div class="geoportal-layout">
  <div class="geoportal-header">
    <h1>🗺️ Geoportal Interactivo</h1>
    <span class="count">{$eventosFiltrados.length} eventos visibles</span>
  </div>
  <div class="geoportal-body">
    <FilterPanel eventos={data.eventos ?? []} {filtros} />
    {#if browser}
      <div class="map-wrapper">
        <MapContainer eventos={$eventosFiltrados} />
      </div>
    {:else}
      <div class="map-placeholder">Cargando mapa...</div>
    {/if}
  </div>
</div>

<style>
.geoportal-layout {
  height: calc(100vh - 60px); display: flex; flex-direction: column;
}
.geoportal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 20px; border-bottom: 1px solid var(--color--border);
  background: var(--color--surface); flex-shrink: 0;
}
h1 { margin: 0; font-size: 1.1rem; }
.count {
  font-size: 0.88rem; color: var(--color--text-muted);
  background: var(--color--surface-2); padding: 4px 12px; border-radius: 999px;
}
.geoportal-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }
.map-wrapper { flex: 1; min-height: 0; padding: 12px; }
.map-placeholder {
  flex: 1; display: flex; align-items: center; justify-content: center;
  color: var(--color--text-muted);
}
</style>
