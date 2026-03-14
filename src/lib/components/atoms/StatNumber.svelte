<script lang="ts">
  import { formatNumero } from '$lib/utils/formatters';
  export let value: number = 0;
  export let label: string = '';
  export let color: string = 'var(--color--primary)';
</script>

<div class="stat-number">
  <span class="value" style="color: {color}">{formatNumero(value)}</span>
  <span class="label">{label}</span>
</div>

<style>
.stat-number { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.value { font-size: 2rem; font-weight: 800; line-height: 1; }
.label { font-size: 0.85rem; color: var(--color--text-muted); text-align: center; }
</style>
