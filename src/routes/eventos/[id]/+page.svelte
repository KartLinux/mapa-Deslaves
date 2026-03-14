<script lang="ts">
  import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { formatFecha, formatNumero, nivelColor, tipoEventoIcon } from '$lib/utils/formatters';

  export let data: PageData;
  $: ev = data.evento;

  let mapEl: HTMLDivElement;

  async function initMiniMap() {
    if (!browser || !mapEl || !ev) return;
    const leaflet = await import('leaflet');
    const L = leaflet.default ?? leaflet;
    await import('leaflet/dist/leaflet.css');
    const map = L.map(mapEl, { center: [ev.lat, ev.lng], zoom: 13 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.circleMarker([ev.lat, ev.lng], {
      radius: 12, fillColor: nivelColor(ev.nivelEvento),
      color: '#fff', weight: 2, fillOpacity: 0.9,
    }).addTo(map);
  }

  onMount(initMiniMap);
</script>

<svelte:head>
  <title>{ev?.tipoEvento ?? 'Evento'} - SNGR</title>
</svelte:head>

{#if ev}
<div class="evento-page page-container">
  <button class="back-btn" on:click={() => goto('/geoportal')}>← Volver al Geoportal</button>

  <div class="hero" style="border-left: 4px solid {nivelColor(ev.nivelEvento)}">
    <span class="tipo-icon">{tipoEventoIcon(ev.tipoEvento)}</span>
    <div class="hero-info">
      <h1>{ev.tipoEvento}</h1>
      <p>{ev.provincia} · {ev.canton} · {ev.parroquia}</p>
      <p>{formatFecha(ev.fechaEvento)}</p>
      <span class="nivel-badge" style="background: {nivelColor(ev.nivelEvento)}22; color: {nivelColor(ev.nivelEvento)}">
        {ev.nivelEvento || 'Sin nivel'}
      </span>
    </div>
  </div>

  <div class="content-grid">
    <div class="data-sheet">
      <!-- Identificación -->
      <section class="group card">
        <h2>📋 Identificación</h2>
        <dl>
          <dt>ID</dt><dd>{ev.id}</dd>
          <dt>Tipo</dt><dd>{ev.tipoEvento}</dd>
          <dt>Causa</dt><dd>{ev.causa || '—'}</dd>
          <dt>Categoría</dt><dd>{ev.categoriaEvento || '—'}</dd>
          <dt>Nivel</dt><dd>{ev.nivelEvento || '—'}</dd>
          <dt>Fecha</dt><dd>{formatFecha(ev.fechaEvento)}</dd>
          <dt>Hora</dt><dd>{ev.horaEvento || '—'}</dd>
          <dt>Provincia</dt><dd>{ev.provincia}</dd>
          <dt>Cantón</dt><dd>{ev.canton}</dd>
          <dt>Parroquia</dt><dd>{ev.parroquia}</dd>
          <dt>Comunidad</dt><dd>{ev.comunidad || '—'}</dd>
        </dl>
      </section>

      <!-- Personas Afectadas -->
      <section class="group card">
        <h2>👥 Personas Afectadas</h2>
        <dl>
          <dt>Heridos</dt><dd>{formatNumero(ev.heridos)}</dd>
          <dt>Desaparecidos</dt><dd>{formatNumero(ev.desaparecidos)}</dd>
          <dt>Muertos y Desaparecidos</dt><dd>{formatNumero(ev.muertosDesaparecidos)}</dd>
          <dt>Afectados Directos</dt><dd>{formatNumero(ev.afectadosDirectos)}</dd>
          <dt>Afectados Indirectos</dt><dd>{formatNumero(ev.afectadosIndirectos)}</dd>
          <dt>Familias Afectadas</dt><dd>{formatNumero(ev.familiasAfectadas)}</dd>
          <dt>Familias Damnificadas</dt><dd>{formatNumero(ev.familiasDamnificadas)}</dd>
          <dt>Personas Damnificadas</dt><dd>{formatNumero(ev.personasDamnificadas)}</dd>
          <dt>Evacuados</dt><dd>{formatNumero(ev.personasEvacuadas)}</dd>
          <dt>Albergados</dt><dd>{formatNumero(ev.personasAlbergadas)}</dd>
          <dt>Total Impactados</dt><dd><strong>{formatNumero(ev.totalImpactados)}</strong></dd>
        </dl>
      </section>

      <!-- Infraestructura -->
      <section class="group card">
        <h2>🏗️ Infraestructura</h2>
        <dl>
          <dt>Viviendas Afectadas</dt><dd>{formatNumero(ev.viviendasAfectadas)}</dd>
          <dt>Viviendas Destruidas</dt><dd>{formatNumero(ev.viviendasDestruidas)}</dd>
          <dt>Establ. Educativos Afectados</dt><dd>{formatNumero(ev.educativosAfectados)}</dd>
          <dt>Establ. Educativos Destruidos</dt><dd>{formatNumero(ev.educativosDestruidos)}</dd>
          <dt>Centros de Salud Afectados</dt><dd>{formatNumero(ev.saludAfectados)}</dd>
          <dt>Centros de Salud Destruidos</dt><dd>{formatNumero(ev.saludDestruidos)}</dd>
          <dt>Puentes Afectados</dt><dd>{formatNumero(ev.puentesAfectados)}</dd>
          <dt>Puentes Destruidos</dt><dd>{formatNumero(ev.puentesDestruidos)}</dd>
          <dt>Bienes Públicos Afectados</dt><dd>{formatNumero(ev.bienesPublicosAfectados)}</dd>
          <dt>Bienes Privados Afectados</dt><dd>{formatNumero(ev.bienesPrivadosAfectados)}</dd>
        </dl>
      </section>

      <!-- Territorio -->
      <section class="group card">
        <h2>🌿 Territorio</h2>
        <dl>
          <dt>Vías Afectadas (m)</dt><dd>{formatNumero(ev.viasAfectadasM)}</dd>
          <dt>Vías Afectadas (km)</dt><dd>{formatNumero(ev.viasAfectadasKm)}</dd>
          <dt>Cultivos Afectados (ha)</dt><dd>{formatNumero(ev.cultivosAfectadosHa)}</dd>
          <dt>Cultivos Perdidos (ha)</dt><dd>{formatNumero(ev.cultivosPerdidosHa)}</dd>
          <dt>Cobertura Vegetal (ha)</dt><dd>{formatNumero(ev.coberturaVegetalHa)}</dd>
          <dt>Animales Afectados</dt><dd>{formatNumero(ev.animalesAfectados)}</dd>
          <dt>Animales Muertos</dt><dd>{formatNumero(ev.animalesMuertos)}</dd>
        </dl>
      </section>

      <!-- Acciones -->
      <section class="group card">
        <h2>⚡ Acciones y Estado</h2>
        <dl>
          <dt>Estado</dt><dd>{ev.estado || '—'}</dd>
          <dt>Fuente</dt><dd>{ev.fuente || '—'}</dd>
          <dt>Acciones</dt><dd>{ev.acciones || '—'}</dd>
          {#if ev.descripcion}<dt>Descripción</dt><dd>{ev.descripcion}</dd>{/if}
        </dl>
      </section>
    </div>

    <div class="map-side">
      <div class="card mini-map-card">
        <h3>📍 Ubicación</h3>
        {#if browser}
          <div bind:this={mapEl} class="mini-map"></div>
        {:else}
          <div class="mini-map-placeholder">Cargando mapa...</div>
        {/if}
        <p class="coords">{ev.lat.toFixed(4)}, {ev.lng.toFixed(4)}</p>
      </div>
    </div>
  </div>
</div>
{:else}
  <div class="not-found page-container">
    <h1>404 — Evento no encontrado</h1>
    <button on:click={() => goto('/geoportal')}>← Volver al Geoportal</button>
  </div>
{/if}

<style>
.evento-page { padding: 24px 16px; }
.back-btn {
  background: none; border: 1px solid var(--color--border); border-radius: 8px;
  padding: 8px 16px; cursor: pointer; color: var(--color--text-muted);
  font-size: 0.9rem; margin-bottom: 20px; transition: color 0.15s;
}
.back-btn:hover { color: var(--color--primary); }
.hero {
  display: flex; align-items: flex-start; gap: 16px;
  padding: 20px; background: var(--color--surface);
  border-radius: 12px; margin-bottom: 24px;
  border: 1px solid var(--color--border);
}
.tipo-icon { font-size: 3rem; }
.hero-info h1 { margin-bottom: 4px; }
.hero-info p { margin: 0; color: var(--color--text-muted); font-size: 0.9rem; }
.nivel-badge {
  display: inline-block; padding: 3px 12px; border-radius: 999px;
  font-size: 0.82rem; font-weight: 700; margin-top: 8px;
}
.content-grid {
  display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start;
}
.data-sheet { display: flex; flex-direction: column; gap: 20px; }
.group h2 { font-size: 1rem; margin-bottom: 12px; }
dl { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
dt { font-size: 0.82rem; color: var(--color--text-muted); font-weight: 600; }
dd { font-size: 0.88rem; margin: 0; }
.map-side { position: sticky; top: 80px; }
.mini-map-card h3 { margin-bottom: 12px; font-size: 0.95rem; }
.mini-map { height: 280px; border-radius: 8px; overflow: hidden; }
.mini-map-placeholder {
  height: 280px; display: flex; align-items: center; justify-content: center;
  background: var(--color--surface-2); border-radius: 8px;
  color: var(--color--text-muted);
}
.coords { font-size: 0.8rem; color: var(--color--text-muted); margin: 8px 0 0; }
@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
  .map-side { position: static; }
}
</style>
