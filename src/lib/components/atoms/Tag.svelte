<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let text: string = '';
  export let removable: boolean = false;
  const dispatch = createEventDispatcher();
</script>

<span class="tag">
  {text}
  {#if removable}
    <button class="remove" on:click={() => dispatch('remove', text)} aria-label="Quitar">×</button>
  {/if}
</span>

<style>
.tag {
  display: inline-flex; align-items: center; gap: 4px;
  background: var(--color--surface-2); border: 1px solid var(--color--border);
  border-radius: 6px; padding: 3px 10px; font-size: 0.85rem;
}
.remove {
  background: none; border: none; cursor: pointer; padding: 0;
  color: var(--color--text-muted); font-size: 1rem; line-height: 1;
}
.remove:hover { color: var(--color--text); }
</style>
