<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import L from "leaflet";
  import { initMap, type MapController } from "../../../modules/map/initMap";
  import {
    NIVEL_COLORS,
    color_nivel,
    type Evento,
  } from "../../../modules/map/eventData";
  import { eventoSeleccionado } from "../../../modules/map/eventoStore";
  import {
    ensureEventosLoaded,
    eventosCompartidos,
  } from "../../../modules/map/eventosStore";
  import { navegar } from "../../router/enrutador";

  let controller: MapController | null = null;
  let map: L.Map | null = null;
  let markersLayer: L.LayerGroup | null = null;

  let todos: Evento[] = [];
  let cargando = true;
  let progreso = 0;
  let error = "";
  let filtrosAbiertos = true;
  let renderizandoMapa = false;
  let totalVisibles = 0;

  let renderTimer: ReturnType<typeof setTimeout> | undefined;
  let renderToken = 0;
  let ultimaProvincia = "";
  let vistaInicialAjustada = false;
  let marcadoresPintados = 0;
  let unsubscribeEventos = () => {};
  const popupCache = new Map<number, string>();
  const markerCache = new Map<number, L.CircleMarker>();

  let fProvincia = "";
  let fCanton = "";
  let fTipo = "";
  let fNivel = "";
  let fAnoMin = "";
  let fAnoMax = "";

  $: provincias = [...new Set(todos.map((e) => e.provincia))].sort();
  $: cantones = [
    ...new Set(
      todos
        .filter((e) => !fProvincia || e.provincia === fProvincia)
        .map((e) => e.canton),
    ),
  ].sort();
  $: tipos = [...new Set(todos.map((e) => e.evento))].sort();
  $: niveles = [...new Set(todos.map((e) => e.nivelEvento).filter(Boolean))].sort();
  $: anos = [...new Set(todos.map((e) => e.ano).filter(Boolean))].sort((a, b) => a - b);

  $: if (fProvincia !== ultimaProvincia) {
    fCanton = "";
    ultimaProvincia = fProvincia;
  }

  $: filtrados = todos.filter((e) => {
    if (fProvincia && e.provincia !== fProvincia) return false;
    if (fCanton && e.canton !== fCanton) return false;
    if (fTipo && e.evento !== fTipo) return false;
    if (fNivel && e.nivelEvento !== fNivel) return false;
    if (fAnoMin && e.ano < parseInt(fAnoMin)) return false;
    if (fAnoMax && e.ano > parseInt(fAnoMax)) return false;
    return true;
  });

  $: resumenProvincias = new Set(filtrados.map((e) => e.provincia)).size;
  $: resumenCantones = new Set(filtrados.map((e) => e.canton)).size;

  $: if (map && markersLayer && !cargando) {
    filtrados;
    scheduleMapRender();
  }

  function buildPopup(e: Evento): string {
    const rows = [
      ["ID", e.id],
      ["Provincia", e.provincia],
      ["Canton", e.canton],
      ["Parroquia", e.parroquias],
      ["Tipo", e.evento],
      ["Causa", e.causa],
      ["Fecha", e.fechaEvento],
      ["Nivel", e.nivelEvento || "No especifica"],
      ["Fallecidas", e.fallecidas],
      ["Heridas", e.heridas],
      ["Afectados directos", e.personasAfectadasDirectamente],
      ["Familias afectadas", e.familiasAfectadas],
      ["Viviendas afectadas", e.viviendasAfectadas],
      ["Viviendas destruidas", e.viviendasDestruidas],
      ["Vias afectadas (m)", e.metrosViasAfectadas],
      ["Estado informe", e.estadoInforme],
    ]
      .filter(([, value]) => value !== 0 && value !== "" && value !== undefined)
      .map(
        ([label, value]) =>
          `<tr><td style="padding:2px 6px;opacity:.7;white-space:nowrap">${label}</td><td style="padding:2px 6px;font-weight:600">${value}</td></tr>`,
      )
      .join("");

    const description = e.descripcion ?? "";
    const descriptionBlock = description
      ? description.length > 200
        ? `<details style="margin:8px 0 0">
             <summary style="cursor:pointer;font-size:12px;font-weight:600;color:#2563eb;list-style:none;padding:2px 0">Ver descripcion</summary>
             <p style="margin:6px 0 0;opacity:.8;font-size:12px;line-height:1.5;white-space:pre-line;border-top:1px solid #e2e8f0;padding-top:6px">${description.slice(0, 600)}</p>
           </details>`
        : `<p style="margin:8px 0 0;opacity:.75;font-size:12px;line-height:1.5;white-space:pre-line">${description}</p>`
      : "";

    return `
      <div style="font-family:system-ui,sans-serif;font-size:13px">
        <div style="font-weight:700;font-size:14px;margin-bottom:6px;border-bottom:1px solid #e2e8f0;padding-bottom:6px">
          Evento #${e.id} - ${e.evento}
        </div>
        <table style="border-collapse:collapse;width:100%">${rows}</table>
        ${descriptionBlock}
        <div style="margin-top:10px;border-top:1px solid #e2e8f0;padding-top:8px">
          <a href="/ficha" onclick="event.preventDefault();window._verFicha&&window._verFicha(${e.id})" style="font-size:12px;font-weight:700;color:#2563eb;text-decoration:none">Ver ficha completa</a>
        </div>
      </div>`;
  }

  function getPopupContent(e: Evento): string {
    const cached = popupCache.get(e.id);
    if (cached) return cached;
    const html = buildPopup(e);
    popupCache.set(e.id, html);
    return html;
  }

  function scheduleMapRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
      void renderMarkers(filtrados);
    }, 120);
  }

  function getRenderableEvents(eventos: Evento[]): Evento[] {
    // Modo estatico: no recalcular por viewport/zoom, solo por filtros.
    totalVisibles = eventos.length;
    const maxMarkers = 12000;
    const candidatos = eventos;
    if (candidatos.length <= maxMarkers) return candidatos;

    const step = Math.ceil(candidatos.length / maxMarkers);
    const sampled: Evento[] = [];
    for (let index = 0; index < candidatos.length; index += step) {
      sampled.push(candidatos[index]);
    }
    return sampled;
  }

  function ajustarVistaInicial(eventos: Evento[]) {
    if (!map || vistaInicialAjustada || eventos.length === 0) return;

    const bounds = L.latLngBounds(eventos.map((evento) => [evento.lat, evento.lng] as [number, number]));
    if (!bounds.isValid()) return;

    map.fitBounds(bounds.pad(0.03), { animate: false });
    vistaInicialAjustada = true;
  }

  async function renderMarkers(eventos: Evento[]) {
    if (!markersLayer) return;

    renderToken += 1;
    const currentToken = renderToken;
    renderizandoMapa = true;
    markersLayer.clearLayers();
    marcadoresPintados = 0;

    const renderables = getRenderableEvents(eventos);
    const chunkSize = 500;
    for (let index = 0; index < renderables.length; index += chunkSize) {
      if (currentToken !== renderToken || !markersLayer) return;

      const chunk = renderables.slice(index, index + chunkSize);
      for (const evento of chunk) {
        let marker = markerCache.get(evento.id);
        if (!marker) {
          marker = L.circleMarker([evento.lat, evento.lng], {
            radius: 7,
            fillColor: color_nivel(evento.nivelEvento),
            color: "#ffffff",
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.85,
          });
          marker.bindPopup(() => getPopupContent(evento), { maxWidth: 380 });
          marker.on("click", () => {
            eventoSeleccionado.set(evento);
          });
          markerCache.set(evento.id, marker);
        }

        markersLayer.addLayer(marker);
        marcadoresPintados += 1;
      }

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }

    if (currentToken === renderToken) {
      renderizandoMapa = false;
    }
  }

  function limpiarFiltros() {
    fProvincia = "";
    fCanton = "";
    fTipo = "";
    fNivel = "";
    fAnoMin = "";
    fAnoMax = "";
  }

  onMount(async () => {
    unsubscribeEventos = eventosCompartidos.subscribe((state) => {
      todos = state.eventos;
      cargando = state.cargando;
      progreso = state.progreso;
      error = state.error;
    });

    (window as Window & { _verFicha?: (id: number) => void })._verFicha = (id: number) => {
      const evento = todos.find((item) => item.id === id);
      if (evento) {
        eventoSeleccionado.set(evento);
        navegar("/ficha");
      }
    };

    try {
      const state = await ensureEventosLoaded();
      todos = state;
    } catch {
      // El error se refleja desde el store compartido.
    }

    controller = await initMap("map", { followTheme: true });
    map = controller.getMap();
    markersLayer = L.layerGroup().addTo(map);
    ajustarVistaInicial(filtrados);
    void renderMarkers(filtrados);
    map.invalidateSize();
  });

  onDestroy(() => {
    unsubscribeEventos();
    renderToken += 1;
    clearTimeout(renderTimer);
    markersLayer?.clearLayers();
    markerCache.clear();
    controller?.destroy();
    delete (window as Window & { _verFicha?: (id: number) => void })._verFicha;
  });
</script>

<div class="mapa-app">
  <div class="tab-panel">
    {#if error}
      <div class="error-msg">Error cargando datos: {error}</div>
    {/if}

    {#if cargando}
      <div class="mapa-carga-wrap">
        <div class="mapa-carga-texto">Cargando datos... {progreso}%</div>
        <div class="mapa-carga-barra">
          <div class="mapa-carga-fill" style={`width:${progreso}%`}></div>
        </div>
      </div>
    {:else if renderizandoMapa}
      <div class="mapa-carga-wrap mapa-carga-wrap--soft">
        <div class="mapa-carga-texto">
          Actualizando mapa... {Math.min(totalVisibles, filtrados.length).toLocaleString()} visibles
        </div>
      </div>
    {/if}

    <div id="map" class="map"></div>

    <div class:cerrado={!filtrosAbiertos} class="panel-filtros">
      <div class="filtros-header">
        <div>
          <span class="filtros-eyebrow">Geoportal</span>
          <span class="filtros-titulo">Filtros del mapa</span>
        </div>
        <button class="btn-toggle-filtros" onclick={() => (filtrosAbiertos = !filtrosAbiertos)}>
          {filtrosAbiertos ? "Ocultar" : "Abrir"}
        </button>
      </div>

      {#if filtrosAbiertos}
        <div class="filtros-body">
          <div class="filtros-stat">
            {cargando ? "Cargando..." : `${filtrados.length} / ${todos.length} eventos`}
          </div>

          {#if !cargando}
            <div class="filtros-hint">
              Mostrando {totalVisibles.toLocaleString()} eventos segun filtros activos.
            </div>
            <div class="filtros-hint">
              Marcadores pintados: {marcadoresPintados.toLocaleString()}.
            </div>
          {/if}

          <div class="filtros-resumen">
            <div>
              <strong>{resumenProvincias}</strong>
              <span>provincias</span>
            </div>
            <div>
              <strong>{resumenCantones}</strong>
              <span>cantones</span>
            </div>
          </div>

          <label class="filtro-grupo">
            <span>Provincia</span>
            <select bind:value={fProvincia}>
              <option value="">Todas</option>
              {#each provincias as provincia}
                <option value={provincia}>{provincia}</option>
              {/each}
            </select>
          </label>

          <label class="filtro-grupo">
            <span>Canton</span>
            <select bind:value={fCanton}>
              <option value="">Todos</option>
              {#each cantones as canton}
                <option value={canton}>{canton}</option>
              {/each}
            </select>
          </label>

          <label class="filtro-grupo">
            <span>Tipo de evento</span>
            <select bind:value={fTipo}>
              <option value="">Todos</option>
              {#each tipos as tipo}
                <option value={tipo}>{tipo}</option>
              {/each}
            </select>
          </label>

          <label class="filtro-grupo">
            <span>Nivel</span>
            <select bind:value={fNivel}>
              <option value="">Todos</option>
              {#each niveles as nivel}
                <option value={nivel}>{nivel}</option>
              {/each}
            </select>
          </label>

          <div class="filtro-grupo">
            <span>Rango de anio</span>
            <div class="rango-anio">
              <select bind:value={fAnoMin}>
                <option value="">Desde</option>
                {#each anos as ano}
                  <option value={ano}>{ano}</option>
                {/each}
              </select>
              <select bind:value={fAnoMax}>
                <option value="">Hasta</option>
                {#each anos as ano}
                  <option value={ano}>{ano}</option>
                {/each}
              </select>
            </div>
          </div>

          <button class="btn-limpiar" onclick={limpiarFiltros}>Limpiar filtros</button>

          <div class="leyenda-niveles">
            <span class="leyenda-titulo">Leyenda</span>
            {#each Object.entries(NIVEL_COLORS) as [nivel, color]}
              <div class="leyenda-item">
                <span class="leyenda-dot" style={`background:${color}`}></span>
                <span>{nivel}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .mapa-app {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: calc(100dvh - 94px);
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgba(var(--color--primary-rgb), 0.12), transparent 30%),
      linear-gradient(180deg, var(--color--background), var(--color--surface-2));
    color: var(--color--text);
    font-family: system-ui, sans-serif;
  }

  .tab-panel {
    position: relative;
    display: flex;
    flex: 1;
    min-height: inherit;
    overflow: hidden;
  }

  .map {
    flex: 1;
    width: 100%;
    height: 100%;
    min-height: calc(100dvh - 94px);
  }

  .panel-filtros {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 1000;
    width: 280px;
    max-height: calc(100% - 24px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--color--border);
    border-radius: 20px;
    background: color-mix(in srgb, var(--color--surface) 92%, transparent);
    box-shadow: var(--sombra--media);
    backdrop-filter: blur(14px);
    transition: width 0.2s ease;
  }

  .panel-filtros.cerrado {
    width: auto;
  }

  .filtros-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 14px 12px;
    border-bottom: 1px solid var(--color--border);
  }

  .filtros-header > div {
    display: flex;
    flex-direction: column;
  }

  .filtros-eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color--text-muted);
  }

  .filtros-titulo {
    font-size: 15px;
    font-weight: 800;
    color: var(--color--text);
  }

  .btn-toggle-filtros {
    border: 1px solid var(--color--border);
    border-radius: 999px;
    background: var(--color--surface-2);
    color: var(--color--text);
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  .filtros-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    padding: 14px;
  }

  .filtros-stat {
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(var(--color--primary-rgb), 0.09);
    color: var(--color--primary);
    font-size: 12px;
    font-weight: 700;
    text-align: center;
  }

  .filtros-resumen {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .filtros-resumen div {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px;
    border: 1px solid var(--color--border);
    border-radius: 12px;
    background: var(--color--surface-2);
  }

  .filtros-hint {
    padding: 9px 10px;
    border: 1px dashed var(--color--border);
    border-radius: 12px;
    background: color-mix(in srgb, var(--color--surface-2) 72%, transparent);
    font-size: 11px;
    line-height: 1.5;
    color: var(--color--text-muted);
  }

  .filtros-resumen strong {
    font-size: 20px;
    line-height: 1;
  }

  .filtros-resumen span {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color--text-muted);
  }

  .filtro-grupo {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    color: var(--color--text-muted);
  }

  .filtro-grupo select {
    border: 1px solid var(--color--border);
    border-radius: 10px;
    background: var(--color--surface);
    color: var(--color--text);
    padding: 9px 10px;
    outline: none;
  }

  .filtro-grupo select:focus {
    border-color: var(--color--primary);
  }

  .rango-anio {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .btn-limpiar {
    border: 1px solid var(--color--border);
    border-radius: 12px;
    background: none;
    color: var(--color--text-muted);
    padding: 10px 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .btn-limpiar:hover {
    background: var(--color--surface-2);
    color: var(--color--text);
  }

  .leyenda-niveles {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-top: 12px;
    border-top: 1px solid var(--color--border);
  }

  .leyenda-titulo {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color--text-muted);
  }

  .leyenda-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .leyenda-dot {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
  }

  .error-msg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1200;
    padding: 12px 16px;
    border-bottom: 1px solid #fca5a5;
    background: #fee2e2;
    color: #991b1b;
    font-size: 13px;
    font-weight: 700;
  }

  .mapa-carga-wrap {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1100;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 16px 12px;
    border-bottom: 1px solid var(--color--border);
    background: color-mix(in srgb, var(--color--surface) 88%, transparent);
    backdrop-filter: blur(10px);
  }

  .mapa-carga-wrap--soft {
    padding-bottom: 10px;
  }

  .mapa-carga-texto {
    font-size: 13px;
    font-weight: 700;
    color: var(--color--text-muted);
  }

  .mapa-carga-barra {
    height: 4px;
    overflow: hidden;
    border-radius: 999px;
    background: var(--color--surface-2);
  }

  .mapa-carga-fill {
    height: 100%;
    border-radius: 999px;
    background: var(--color--primary);
    transition: width 0.2s ease;
  }

  @media (max-width: 900px) {
    .panel-filtros {
      width: min(300px, calc(100% - 24px));
    }
  }

  @media (max-width: 640px) {
    .mapa-app {
      min-height: calc(100dvh - 84px);
    }

    .panel-filtros {
      top: auto;
      right: 12px;
      bottom: 12px;
      left: 12px;
      width: auto;
      max-height: 50vh;
    }
  }
</style>
