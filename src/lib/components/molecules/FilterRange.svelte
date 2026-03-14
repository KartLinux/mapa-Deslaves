<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let label: string = '';
  export let minValue: string = '';
  export let maxValue: string = '';
  export let min: number = 2000;
  export let max: number = 2025;
  const dispatch = createEventDispatcher();
  function onChange() { dispatch('change', { min: minValue, max: maxValue }); }
</script>

<div class="filter-range">
  {#if label}<label>{label}</label>{/if}
  <div class="inputs">
    <input type="number" bind:value={minValue} {min} {max} placeholder="Desde" on:change={onChange} />
    <span>—</span>
    <input type="number" bind:value={maxValue} {min} {max} placeholder="Hasta" on:change={onChange} />
  </div>
</div>

<style>
.filter-range { display: flex; flex-direction: column; gap: 4px; }
label { font-size: 0.82rem; font-weight: 600; color: var(--color--text-muted); }
.inputs { display: flex; align-items: center; gap: 6px; }
input {
  flex: 1; background: var(--color--surface); color: var(--color--text);
  border: 1px solid var(--color--border); border-radius: 8px;
  padding: 7px 8px; font-size: 0.88rem; min-width: 0;
}
input:focus { outline: 2px solid var(--color--primary); }
span { color: var(--color--text-muted); }
</style>
