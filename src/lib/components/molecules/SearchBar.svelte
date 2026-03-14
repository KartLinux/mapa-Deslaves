<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let value: string = '';
  export let placeholder: string = 'Buscar...';
  const dispatch = createEventDispatcher();
</script>

<div class="search-bar">
  <span class="icon">🔍</span>
  <input
    type="text"
    bind:value
    {placeholder}
    on:input={() => dispatch('search', value)}
  />
</div>

<style>
.search-bar {
  display: flex; align-items: center; gap: 8px;
  background: var(--color--surface); border: 1px solid var(--color--border);
  border-radius: 10px; padding: 8px 14px;
}
.icon { font-size: 1rem; color: var(--color--text-muted); }
input {
  border: none; background: none; color: var(--color--text);
  font-size: 0.95rem; width: 100%; outline: none;
}
input::placeholder { color: var(--color--text-muted); }
</style>
