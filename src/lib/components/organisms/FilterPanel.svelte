<script lang="ts">
  import type { Evento } from '$lib/data/types';
  import type { Writable } from 'svelte/store';
  import FilterSelect from '../molecules/FilterSelect.svelte';
  import FilterRange from '../molecules/FilterRange.svelte';
  import SearchBar from '../molecules/SearchBar.svelte';
  import Button from '../atoms/Button.svelte';
  import { getUniqueValues } from '$lib/data/csvParser';

  export let eventos: Evento[] = [];
  export let filtros: Writable<{
    provincia: string; canton: string; tipoEvento: string;
    categoriaEvento: string; nivelEvento: string;
    añoDesde: string; añoHasta: string; textoBusqueda: string;
  }>;

  let open = true;

  $: provincias = getUniqueValues(eventos, 'provincia');
  $: cantones = $filtros.provincia
    ? getUniqueValues(eventos.filter(e => e.provincia === $filtros.provincia), 'canton')
    : getUniqueValues(eventos, 'canton');
  $: tipos = getUniqueValues(eventos, 'tipoEvento');
  $: categorias = getUniqueValues(eventos, 'categoriaEvento');
  $: niveles = getUniqueValues(eventos, 'nivelEvento');
  $: años = eventos.map(e => e.año).filter(Boolean);
  $: minAño = Math.min(...años, 2000);
  $: maxAño = Math.max(...años, new Date().getFullYear());

  function limpiar() {
    filtros.set({ provincia: '', canton: '', tipoEvento: '', categoriaEvento: '', nivelEvento: '', añoDesde: '', añoHasta: '', textoBusqueda: '' });
  }
</script>

<aside class="panel" class:open>
  <div class="panel-header">
    <h3>Filtros</h3>
    <button class="toggle" on:click={() => open = !open}>{open ? '◀' : '▶'}</button>
  </div>
  {#if open}
    <div class="content">
      <SearchBar
        value={$filtros.textoBusqueda}
        placeholder="Buscar provincia, tipo..."
        on:search={(e) => filtros.update(f => ({ ...f, textoBusqueda: e.detail }))}
      />
      <FilterSelect
        label="Provincia" options={provincias} value={$filtros.provincia}
        on:change={(e) => filtros.update(f => ({ ...f, provincia: e.detail, canton: '' }))}
      />
      <FilterSelect
        label="Cantón" options={cantones} value={$filtros.canton}
        on:change={(e) => filtros.update(f => ({ ...f, canton: e.detail }))}
      />
      <FilterSelect
        label="Tipo de Evento" options={tipos} value={$filtros.tipoEvento}
        on:change={(e) => filtros.update(f => ({ ...f, tipoEvento: e.detail }))}
      />
      <FilterSelect
        label="Categoría" options={categorias} value={$filtros.categoriaEvento}
        on:change={(e) => filtros.update(f => ({ ...f, categoriaEvento: e.detail }))}
      />
      <FilterSelect
        label="Nivel" options={niveles} value={$filtros.nivelEvento}
        on:change={(e) => filtros.update(f => ({ ...f, nivelEvento: e.detail }))}
      />
      <FilterRange
        label="Año" minValue={$filtros.añoDesde} maxValue={$filtros.añoHasta}
        min={minAño} max={maxAño}
        on:change={(e) => filtros.update(f => ({ ...f, añoDesde: e.detail.min, añoHasta: e.detail.max }))}
      />
      <Button variant="secondary" size="sm" on:click={limpiar}>🗑️ Limpiar filtros</Button>
    </div>
  {/if}
</aside>

<style>
.panel {
  background: var(--color--surface); border-right: 1px solid var(--color--border);
  width: 280px; min-width: 280px; overflow-y: auto; transition: width 0.2s;
  display: flex; flex-direction: column;
}
.panel:not(.open) { width: 48px; min-width: 48px; }
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px; border-bottom: 1px solid var(--color--border); flex-shrink: 0;
}
h3 { margin: 0; font-size: 0.95rem; }
.toggle {
  background: none; border: none; cursor: pointer;
  color: var(--color--text-muted); font-size: 0.9rem;
}
.content { padding: 16px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
@media (max-width: 768px) {
  .panel { width: 100%; min-width: unset; border-right: none; border-bottom: 1px solid var(--color--border); }
  .panel:not(.open) { width: 100%; min-width: unset; }
}
</style>
