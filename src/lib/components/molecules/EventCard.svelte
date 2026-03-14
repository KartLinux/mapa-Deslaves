<script lang="ts">
  import type { Evento } from '$lib/data/types';
  import { tipoEventoIcon, nivelColor, formatNumero } from '$lib/utils/formatters';
  import { goto } from '$app/navigation';
  export let evento: Evento;
</script>

<button class="event-card" on:click={() => goto(`/eventos/${evento.id}`)}>
  <div class="top">
    <span class="icon">{tipoEventoIcon(evento.tipoEvento)}</span>
    <span class="tipo">{evento.tipoEvento}</span>
    <span class="nivel" style="background: {nivelColor(evento.nivelEvento)}22; color: {nivelColor(evento.nivelEvento)}">
      {evento.nivelEvento || 'Sin nivel'}
    </span>
  </div>
  <div class="lugar">{evento.provincia} · {evento.canton}</div>
  <div class="fecha">{evento.fechaEvento}</div>
  {#if evento.totalImpactados > 0}
    <div class="impacto">👥 {formatNumero(evento.totalImpactados)} impactados</div>
  {/if}
</button>

<style>
.event-card {
  background: var(--color--surface); border: 1px solid var(--color--border);
  border-radius: 10px; padding: 14px; text-align: left; cursor: pointer;
  width: 100%; transition: box-shadow 0.15s, transform 0.1s;
  box-shadow: var(--sombra--suave);
}
.event-card:hover { box-shadow: var(--sombra--media); transform: translateY(-2px); }
.top { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.icon { font-size: 1.2rem; }
.tipo { font-weight: 700; font-size: 0.9rem; flex: 1; }
.nivel { font-size: 0.75rem; font-weight: 600; padding: 2px 8px; border-radius: 999px; }
.lugar { font-size: 0.85rem; color: var(--color--text-muted); margin-bottom: 2px; }
.fecha { font-size: 0.8rem; color: var(--color--text-muted); margin-bottom: 4px; }
.impacto { font-size: 0.82rem; color: var(--color--primary); font-weight: 600; }
</style>
