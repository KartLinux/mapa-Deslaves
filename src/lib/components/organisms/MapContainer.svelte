<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import type { Evento } from '$lib/data/types';
  import { color_nivel } from '$lib/data/csvParser';
  import { MAP_DEFAULTS, TILE_URLS, LABELS, ATTRIBUTION, OVERLAY_CONFIG } from '$lib/utils/mapHelpers';

  export let eventos: Evento[] = [];
  let className: string = '';
  export { className as class };

  const dispatch = createEventDispatcher<{ eventoClick: number }>();

  let mapEl: HTMLDivElement;
  let map: unknown = null;
  let markersLayer: unknown = null;
  let L: typeof import('leaflet') | null = null;
  let initialized = false;

  function buildMarkers(evs: Evento[]) {
    if (!map || !L || !initialized) return;
    const lMap = map as import('leaflet').Map;
    const lLayerGroup = (L as typeof import('leaflet')).layerGroup;
    const lCircleMarker = (L as typeof import('leaflet')).circleMarker;
    if (markersLayer) lMap.removeLayer(markersLayer as import('leaflet').Layer);
    markersLayer = lLayerGroup();
    for (const ev of evs) {
      if (!ev.lat || !ev.lng) continue;
      const marker = lCircleMarker([ev.lat, ev.lng], {
        radius: 7,
        fillColor: color_nivel(ev.nivelEvento),
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.85,
      });
      marker.bindPopup(`
        <div style="min-width:180px">
          <strong>${ev.tipoEvento}</strong><br/>
          📍 ${ev.provincia}, ${ev.canton}<br/>
          📅 ${ev.fechaEvento}<br/>
          <span style="color:${color_nivel(ev.nivelEvento)};font-weight:700">${ev.nivelEvento || 'Sin nivel'}</span><br/>
          <a href="/eventos/${ev.id}" style="color:#2564eb">Ver detalle →</a>
        </div>
      `);
      marker.on('click', () => {
        dispatch('eventoClick', ev.id);
        goto(`/eventos/${ev.id}`);
      });
      (markersLayer as import('leaflet').LayerGroup).addLayer(marker);
    }
    (markersLayer as import('leaflet').LayerGroup).addTo(lMap);
  }

  export function updateFiltros(filteredEvents: Evento[]) {
    buildMarkers(filteredEvents);
  }

  onMount(async () => {
    if (!browser) return;
    const leaflet = await import('leaflet');
    L = leaflet;
    await import('leaflet/dist/leaflet.css');

    const lL = leaflet.default ?? leaflet;

    map = lL.map(mapEl, {
      center: MAP_DEFAULTS.center as import('leaflet').LatLngExpression,
      zoom: MAP_DEFAULTS.zoom,
      maxZoom: MAP_DEFAULTS.maxZoom,
    });

    const lMap = map as import('leaflet').Map;

    const osmLayer = lL.tileLayer(TILE_URLS.osm, { attribution: ATTRIBUTION.osm, maxZoom: MAP_DEFAULTS.maxZoom });
    const darkLayer = lL.tileLayer(TILE_URLS.cartoDark, { attribution: ATTRIBUTION.carto, maxZoom: MAP_DEFAULTS.maxZoom });
    osmLayer.addTo(lMap);

    const topoLayer = lL.tileLayer(TILE_URLS.topo, { attribution: ATTRIBUTION.topo, opacity: OVERLAY_CONFIG.topo.opacity, maxZoom: OVERLAY_CONFIG.topo.maxZoom });
    const riosLayer = lL.tileLayer(TILE_URLS.rios, { attribution: ATTRIBUTION.rios, opacity: OVERLAY_CONFIG.rios.opacity, maxZoom: OVERLAY_CONFIG.rios.maxZoom });

    const geologiaLayer = lL.tileLayer.wms(TILE_URLS.igmWms, {
      layers: OVERLAY_CONFIG.geologia.layers,
      format: OVERLAY_CONFIG.geologia.format,
      transparent: true,
      version: OVERLAY_CONFIG.geologia.version,
      opacity: OVERLAY_CONFIG.geologia.opacity,
      attribution: ATTRIBUTION.igm,
    });

    lL.control.layers(
      { [LABELS.base.light]: osmLayer, [LABELS.base.dark]: darkLayer },
      { [LABELS.overlays.topo]: topoLayer, [LABELS.overlays.rios]: riosLayer, [LABELS.overlays.geologia]: geologiaLayer }
    ).addTo(lMap);

    initialized = true;
    buildMarkers(eventos);
  });

  onDestroy(() => {
    if (map) (map as import('leaflet').Map).remove();
  });

  $: if (initialized && map && L) buildMarkers(eventos);
</script>

{#if browser}
  <div bind:this={mapEl} class="map-container {className}"></div>
{:else}
  <div class="map-placeholder">Cargando mapa...</div>
{/if}

<style>
.map-container {
  width: 100%; height: 100%; min-height: 400px;
  border-radius: 12px; overflow: hidden;
}
.map-placeholder {
  width: 100%; height: 400px; display: flex; align-items: center; justify-content: center;
  background: var(--color--surface-2); color: var(--color--text-muted);
  border-radius: 12px;
}
</style>
