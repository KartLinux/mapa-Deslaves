<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let label: string = '';
  export let options: string[] = [];
  export let value: string = '';
  export let placeholder: string = 'Todos';
  const dispatch = createEventDispatcher();
</script>

<div class="filter-select">
  {#if label}<label>{label}</label>{/if}
  <select bind:value on:change={() => dispatch('change', value)}>
    <option value="">{placeholder}</option>
    {#each options as opt}
      <option value={opt}>{opt}</option>
    {/each}
  </select>
</div>

<style>
.filter-select { display: flex; flex-direction: column; gap: 4px; }
label { font-size: 0.82rem; font-weight: 600; color: var(--color--text-muted); }
select {
  background: var(--color--surface); color: var(--color--text);
  border: 1px solid var(--color--border); border-radius: 8px;
  padding: 8px 10px; font-size: 0.9rem; cursor: pointer;
}
select:focus { outline: 2px solid var(--color--primary); }
</style>
