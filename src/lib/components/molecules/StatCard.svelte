<script lang="ts">
  import { formatNumero } from '$lib/utils/formatters';
  export let title: string = '';
  export let value: number | string = 0;
  export let icon: string = '📊';
  export let color: string = '#2564eb';
  export let delta: string = '';
</script>

<div class="stat-card">
  <div class="header">
    <span class="icon" style="color: {color}">{icon}</span>
    <span class="title">{title}</span>
  </div>
  <div class="value" style="color: {color}">
    {typeof value === 'number' ? formatNumero(value) : value}
  </div>
  {#if delta}
    <div class="delta">{delta}</div>
  {/if}
</div>

<style>
.stat-card {
  background: var(--color--surface); border: 1px solid var(--color--border);
  border-radius: 12px; padding: 16px 20px; box-shadow: var(--sombra--suave);
}
.header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.icon { font-size: 1.4rem; }
.title { font-size: 0.85rem; color: var(--color--text-muted); font-weight: 600; }
.value { font-size: 1.8rem; font-weight: 800; line-height: 1; }
.delta { font-size: 0.8rem; color: var(--color--text-muted); margin-top: 4px; }
</style>
