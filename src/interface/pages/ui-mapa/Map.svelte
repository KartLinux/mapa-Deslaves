<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { MapController } from "../../../modules/map/initMap";
  import { initMap } from "../../../modules/map/initMap";
  import {
    fetchEventos,
    groupBy,
    sumField,
    color_nivel,
    NIVEL_COLORS,
    type Evento,
  } from "../../../modules/map/eventData";
  import L from "leaflet";

  // ─── Estado global ────────────────────────────────────────────────────────
  let tab: "mapa" | "estadisticas" = "mapa";
  let controller: MapController | null = null;
  let map: L.Map | null = null;
  let markersLayer: L.LayerGroup | null = null;

  let todos: Evento[] = [];
  let cargando = true;
  let error = "";

  // ─── Filtros ──────────────────────────────────────────────────────────────
  let fProvincia = "";
  let fCanton = "";
  let fTipo = "";
  let fNivel = "";
  let fAñoMin = "";
  let fAñoMax = "";
  let filtrosAbiertos = true;

  // ─── Opciones únicas (para selects) ───────────────────────────────────────
  $: provincias = [...new Set(todos.map((e) => e.provincia))].sort();
  $: cantones = [
    ...new Set(
      todos.filter((e) => !fProvincia || e.provincia === fProvincia).map((e) => e.canton)
    ),
  ].sort();
  $: tipos = [...new Set(todos.map((e) => e.tipoEvento))].sort();
  $: niveles = [...new Set(todos.map((e) => e.nivelEvento))].sort();
  $: años = [...new Set(todos.map((e) => e.año).filter(Boolean))].sort();

  // Reset cantón when provincia changes
  $: if (fProvincia) fCanton = "";

  // ─── Eventos filtrados ────────────────────────────────────────────────────
  $: filtrados = todos.filter((e) => {
    if (fProvincia && e.provincia !== fProvincia) return false;
    if (fCanton && e.canton !== fCanton) return false;
    if (fTipo && e.tipoEvento !== fTipo) return false;
    if (fNivel && e.nivelEvento !== fNivel) return false;
    if (fAñoMin && e.año < parseInt(fAñoMin)) return false;
    if (fAñoMax && e.año > parseInt(fAñoMax)) return false;
    return true;
  });

  // ─── Actualizar marcadores cuando cambian los filtros ─────────────────────
  $: if (map && markersLayer) {
    renderMarkers(filtrados);
  }

  function renderMarkers(eventos: Evento[]) {
    if (!markersLayer || !map) return;
    markersLayer.clearLayers();
    for (const e of eventos) {
      const col = color_nivel(e.nivelEvento);
      const marker = L.circleMarker([e.lat, e.lng], {
        radius: 7,
        fillColor: col,
        color: "#fff",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.85,
      });
      marker.bindPopup(buildPopup(e), { maxWidth: 320 });
      markersLayer.addLayer(marker);
    }
  }

  function buildPopup(e: Evento): string {
    const rows = [
      ["ID", e.id],
      ["Provincia", e.provincia],
      ["Cantón", e.canton],
      ["Parroquia", e.parroquia],
      ["Tipo", e.tipoEvento],
      ["Causa", e.causa],
      ["Fecha", e.fechaEvento],
      ["Nivel", e.nivelEvento],
      ["Heridos", e.heridos],
      ["Afectados directos", e.afectadosDirectos],
      ["Familias afectadas", e.familiasAfectadas],
      ["Viviendas afectadas", e.viviendasAfectadas],
      ["Viviendas destruidas", e.viviendasDestruidas],
      ["Vías afectadas (m)", e.viasAfectadasM],
      ["Estado", e.estado],
    ]
      .filter(([, v]) => v !== 0 && v !== "" && v !== undefined)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:2px 6px;opacity:.7;white-space:nowrap">${k}</td><td style="padding:2px 6px;font-weight:600">${v}</td></tr>`
      )
      .join("");

    const desc =
      e.descripcion.length > 200
        ? e.descripcion.slice(0, 200) + "…"
        : e.descripcion;

    return `
      <div style="font-family:system-ui,sans-serif;font-size:13px">
        <div style="font-weight:700;font-size:14px;margin-bottom:6px;border-bottom:1px solid #e2e8f0;padding-bottom:6px">
          Evento #${e.id} — ${e.tipoEvento}
        </div>
        <table style="border-collapse:collapse;width:100%">${rows}</table>
        ${desc ? `<p style="margin:8px 0 0;opacity:.75;font-size:12px;line-height:1.4">${desc}</p>` : ""}
      </div>`;
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────
  $: kpiTotal        = filtrados.length;
  $: kpiHeridos      = sumField(filtrados, "heridos");
  $: kpiAfectados    = sumField(filtrados, "afectadosDirectos");
  $: kpiViviendas    = sumField(filtrados, "viviendasAfectadas") + sumField(filtrados, "viviendasDestruidas");
  $: kpiEvacuados    = sumField(filtrados, "personasEvacuadas");
  $: kpiVias         = sumField(filtrados, "viasAfectadasM");

  // ─── Datos para gráficos ──────────────────────────────────────────────────
  $: porAño = (() => {
    const g = groupBy(filtrados, (e) => String(e.año));
    return Object.keys(g).sort().map((k) => ({ label: k, value: g[k].length }));
  })();

  $: afectadosPorAño = (() => {
    const g = groupBy(filtrados, (e) => String(e.año));
    return Object.keys(g).sort().map((k) => ({ label: k, value: sumField(g[k], "afectadosDirectos") }));
  })();

  $: topCantones = (() => {
    const g = groupBy(filtrados, (e) => e.canton);
    return Object.keys(g)
      .map((k) => ({ label: k, value: g[k].length }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  })();

  $: porTipo = (() => {
    const g = groupBy(filtrados, (e) => e.tipoEvento);
    return Object.keys(g)
      .map((k) => ({ label: k, value: g[k].length }))
      .sort((a, b) => b.value - a.value);
  })();

  $: porCausa = (() => {
    const g = groupBy(filtrados, (e) => e.causa);
    return Object.keys(g)
      .map((k) => ({ label: k, value: g[k].length }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  })();

  $: porNivel = (() => {
    const g = groupBy(filtrados, (e) => e.nivelEvento || "Sin nivel");
    return Object.keys(g).map((k) => ({ label: k, value: g[k].length }));
  })();

  // ─── SVG chart helpers ────────────────────────────────────────────────────
  const W = 520, H = 200, PAD = { t: 16, r: 16, b: 48, l: 52 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  function barPath(data: { label: string; value: number }[], _color = "#2564eb") {
    if (!data.length) return { bars: [], labels: [], maxVal: 0, yLabels: [] };
    const maxVal = Math.max(...data.map((d) => d.value), 1);
    const bw = cW / data.length;
    const bars = data.map((d, i) => {
      const h = (d.value / maxVal) * cH;
      return { x: PAD.l + i * bw + bw * 0.1, y: PAD.t + cH - h, w: bw * 0.8, h, value: d.value };
    });
    const labels = data.map((d, i) => ({
      x: PAD.l + i * bw + bw / 2,
      y: H - 4,
      text: d.label.length > 10 ? d.label.slice(0, 10) + "…" : d.label,
    }));
    const steps = 4;
    const yLabels = Array.from({ length: steps + 1 }, (_, i) => ({
      y: PAD.t + cH - (i / steps) * cH,
      text: Math.round((maxVal * i) / steps).toLocaleString(),
    }));
    return { bars, labels, maxVal, yLabels };
  }

  function linePath(data: { label: string; value: number }[]) {
    if (data.length < 2) return { path: "", dots: [], labels: [], yLabels: [] };
    const maxVal = Math.max(...data.map((d) => d.value), 1);
    const xs = data.map((_, i) => PAD.l + (i / (data.length - 1)) * cW);
    const ys = data.map((d) => PAD.t + cH - (d.value / maxVal) * cH);
    const path = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x},${ys[i]}`).join(" ");
    const dots = xs.map((x, i) => ({ cx: x, cy: ys[i], value: data[i].value }));
    const labels = xs.map((x, i) => ({ x, y: H - 4, text: data[i].label }));
    const steps = 4;
    const yLabels = Array.from({ length: steps + 1 }, (_, i) => ({
      y: PAD.t + cH - (i / steps) * cH,
      text: Math.round((maxVal * i) / steps).toLocaleString(),
    }));
    return { path, dots, labels, yLabels };
  }

  $: lineAño     = linePath(porAño);
  $: barAñoAfect = barPath(afectadosPorAño);
  $: barCantones = barPath(topCantones);
  $: barCausa    = barPath(porCausa);
  $: barTipo     = barPath(porTipo);

  // ─── Ciclo de vida ────────────────────────────────────────────────────────
  onMount(async () => {
    try {
      todos = await fetchEventos();
    } catch (e) {
      error = String(e);
    } finally {
      cargando = false;
    }

    controller = await initMap("map", { followTheme: true });
    map = controller.getMap();
    markersLayer = L.layerGroup().addTo(map);
    renderMarkers(filtrados);
  });

  onDestroy(() => {
    markersLayer?.clearLayers();
    controller?.destroy();
  });

  function switchTab(t: "mapa" | "estadisticas") {
    tab = t;
    if (t === "mapa") setTimeout(() => map?.invalidateSize(), 50);
  }

  function limpiarFiltros() {
    fProvincia = ""; fCanton = ""; fTipo = ""; fNivel = ""; fAñoMin = ""; fAñoMax = "";
  }
</script>

<!-- ─── Layout principal ─────────────────────────────────────────────── -->
<div class="mapa-app">
  <nav class="pestanas">
      <button class="pestana-btn" class:activa={tab === "mapa"} on:click={() => switchTab("mapa")}>
        🗺️ Mapa
      </button>
      <button class="pestana-btn" class:activa={tab === "estadisticas"} on:click={() => switchTab("estadisticas")}>
        📊 Estadísticas
      </button>
    </nav>

    <!-- Mapa siempre en DOM -->
    <div class="tab-panel" style="display:{tab === 'mapa' ? 'flex' : 'none'}">
      {#if error}<div class="error-msg">⚠️ {error}</div>{/if}
      <div id="map" class="map"></div>

      <!-- Panel de filtros flotante sobre el mapa -->
      <div class="panel-filtros" class:cerrado={!filtrosAbiertos}>
        <div class="filtros-header">
          <span class="filtros-titulo">Filtros</span>
          <button class="btn-toggle-filtros" on:click={() => (filtrosAbiertos = !filtrosAbiertos)}>
            {filtrosAbiertos ? "◀" : "▶"}
          </button>
        </div>
        {#if filtrosAbiertos}
          <div class="filtros-body">
            <div class="filtros-stat">
              {cargando ? "Cargando…" : `${filtrados.length} / ${todos.length} eventos`}
            </div>

            <label class="filtro-grupo">
              <span>Provincia</span>
              <select bind:value={fProvincia}>
                <option value="">Todas</option>
                {#each provincias as p}<option value={p}>{p}</option>{/each}
              </select>
            </label>

            <label class="filtro-grupo">
              <span>Cantón</span>
              <select bind:value={fCanton}>
                <option value="">Todos</option>
                {#each cantones as c}<option value={c}>{c}</option>{/each}
              </select>
            </label>

            <label class="filtro-grupo">
              <span>Tipo de evento</span>
              <select bind:value={fTipo}>
                <option value="">Todos</option>
                {#each tipos as t}<option value={t}>{t}</option>{/each}
              </select>
            </label>

            <label class="filtro-grupo">
              <span>Nivel</span>
              <select bind:value={fNivel}>
                <option value="">Todos</option>
                {#each niveles as n}<option value={n}>{n}</option>{/each}
              </select>
            </label>

            <div class="filtro-grupo">
              <span>Año (rango)</span>
              <div class="rango-año">
                <select bind:value={fAñoMin}>
                  <option value="">Desde</option>
                  {#each años as a}<option value={a}>{a}</option>{/each}
                </select>
                <select bind:value={fAñoMax}>
                  <option value="">Hasta</option>
                  {#each años as a}<option value={a}>{a}</option>{/each}
                </select>
              </div>
            </div>

            <button class="btn-limpiar" on:click={limpiarFiltros}>Limpiar filtros</button>

            <div class="leyenda-niveles">
              <span class="leyenda-titulo">Leyenda</span>
              {#each Object.entries(NIVEL_COLORS) as [nivel, col]}
                <div class="leyenda-item">
                  <span class="leyenda-dot" style="background:{col}"></span>
                  <span>{nivel}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="tab-panel estadisticas-panel" style="display:{tab === 'estadisticas' ? 'flex' : 'none'}">
      {#if cargando}
        <p class="cargando-msg">Cargando datos…</p>
      {:else}

        <!-- KPI Cards -->
        <section class="kpi-grid">
          <div class="kpi-card">
            <span class="kpi-label">Total eventos</span>
            <span class="kpi-value">{kpiTotal.toLocaleString()}</span>
          </div>
          <div class="kpi-card kpi-heridos">
            <span class="kpi-label">Heridos</span>
            <span class="kpi-value">{kpiHeridos.toLocaleString()}</span>
          </div>
          <div class="kpi-card kpi-afectados">
            <span class="kpi-label">Afectados directos</span>
            <span class="kpi-value">{kpiAfectados.toLocaleString()}</span>
          </div>
          <div class="kpi-card kpi-viviendas">
            <span class="kpi-label">Viviendas (afect. + destr.)</span>
            <span class="kpi-value">{kpiViviendas.toLocaleString()}</span>
          </div>
          <div class="kpi-card kpi-evacuados">
            <span class="kpi-label">Personas evacuadas</span>
            <span class="kpi-value">{kpiEvacuados.toLocaleString()}</span>
          </div>
          <div class="kpi-card kpi-vias">
            <span class="kpi-label">Vías afectadas (m)</span>
            <span class="kpi-value">{kpiVias.toLocaleString()}</span>
          </div>
        </section>

        <div class="graficos-grid">

          <!-- Serie temporal -->
          <div class="grafico-card grafico-ancho">
            <h3 class="grafico-titulo">Eventos por año (serie temporal)</h3>
            <svg viewBox="0 0 {W} {H}" class="grafico-svg">
              {#each lineAño.yLabels as yl}
                <line x1={PAD.l} y1={yl.y} x2={W-PAD.r} y2={yl.y} stroke="currentColor" stroke-opacity=".1"/>
                <text x={PAD.l-4} y={yl.y+4} text-anchor="end" font-size="10" fill="currentColor" opacity=".6">{yl.text}</text>
              {/each}
              {#if lineAño.path}
                <path d="{lineAño.path} L{W-PAD.r},{PAD.t+cH} L{PAD.l},{PAD.t+cH} Z" fill="var(--color--primary)" fill-opacity=".12"/>
                <path d={lineAño.path} fill="none" stroke="var(--color--primary)" stroke-width="2.5" stroke-linejoin="round"/>
                {#each lineAño.dots as d}
                  <circle cx={d.cx} cy={d.cy} r="4" fill="var(--color--primary)" stroke="#fff" stroke-width="1.5"><title>{d.value} eventos</title></circle>
                {/each}
                {#each lineAño.labels as l}
                  <text x={l.x} y={l.y} text-anchor="middle" font-size="10" fill="currentColor" opacity=".7">{l.text}</text>
                {/each}
              {:else}
                <text x={W/2} y={H/2} text-anchor="middle" font-size="13" fill="currentColor" opacity=".4">Sin datos</text>
              {/if}
              <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t+cH} stroke="currentColor" stroke-opacity=".3"/>
              <line x1={PAD.l} y1={PAD.t+cH} x2={W-PAD.r} y2={PAD.t+cH} stroke="currentColor" stroke-opacity=".3"/>
            </svg>
          </div>

          <!-- Afectados por año -->
          <div class="grafico-card grafico-ancho">
            <h3 class="grafico-titulo">Afectados directos por año</h3>
            <svg viewBox="0 0 {W} {H}" class="grafico-svg">
              {#each barAñoAfect.yLabels as yl}
                <line x1={PAD.l} y1={yl.y} x2={W-PAD.r} y2={yl.y} stroke="currentColor" stroke-opacity=".1"/>
                <text x={PAD.l-4} y={yl.y+4} text-anchor="end" font-size="10" fill="currentColor" opacity=".6">{yl.text}</text>
              {/each}
              {#each barAñoAfect.bars as b}
                <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="var(--color--primary)" rx="2" opacity=".85"><title>{b.value.toLocaleString()} afectados</title></rect>
              {/each}
              {#each barAñoAfect.labels as l}
                <text x={l.x} y={l.y} text-anchor="middle" font-size="10" fill="currentColor" opacity=".7">{l.text}</text>
              {/each}
              <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t+cH} stroke="currentColor" stroke-opacity=".3"/>
              <line x1={PAD.l} y1={PAD.t+cH} x2={W-PAD.r} y2={PAD.t+cH} stroke="currentColor" stroke-opacity=".3"/>
            </svg>
          </div>

          <!-- Top cantones -->
          <div class="grafico-card grafico-ancho">
            <h3 class="grafico-titulo">Top 10 cantones con más eventos</h3>
            <svg viewBox="0 0 {W} {H}" class="grafico-svg">
              {#each barCantones.yLabels as yl}
                <line x1={PAD.l} y1={yl.y} x2={W-PAD.r} y2={yl.y} stroke="currentColor" stroke-opacity=".1"/>
                <text x={PAD.l-4} y={yl.y+4} text-anchor="end" font-size="10" fill="currentColor" opacity=".6">{yl.text}</text>
              {/each}
              {#each barCantones.bars as b}
                <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#10b981" rx="2" opacity=".85"><title>{b.value} eventos</title></rect>
              {/each}
              {#each barCantones.labels as l}
                <text x={l.x} y={l.y} text-anchor="middle" font-size="9" fill="currentColor" opacity=".7">{l.text}</text>
              {/each}
              <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t+cH} stroke="currentColor" stroke-opacity=".3"/>
              <line x1={PAD.l} y1={PAD.t+cH} x2={W-PAD.r} y2={PAD.t+cH} stroke="currentColor" stroke-opacity=".3"/>
            </svg>
          </div>

          <!-- Causa -->
          <div class="grafico-card">
            <h3 class="grafico-titulo">Eventos por causa</h3>
            <svg viewBox="0 0 {W} {H}" class="grafico-svg">
              {#each barCausa.yLabels as yl}
                <line x1={PAD.l} y1={yl.y} x2={W-PAD.r} y2={yl.y} stroke="currentColor" stroke-opacity=".1"/>
                <text x={PAD.l-4} y={yl.y+4} text-anchor="end" font-size="10" fill="currentColor" opacity=".6">{yl.text}</text>
              {/each}
              {#each barCausa.bars as b}
                <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#8b5cf6" rx="2" opacity=".85"><title>{b.value} eventos</title></rect>
              {/each}
              {#each barCausa.labels as l}
                <text x={l.x} y={l.y} text-anchor="middle" font-size="9" fill="currentColor" opacity=".7">{l.text}</text>
              {/each}
              <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t+cH} stroke="currentColor" stroke-opacity=".3"/>
              <line x1={PAD.l} y1={PAD.t+cH} x2={W-PAD.r} y2={PAD.t+cH} stroke="currentColor" stroke-opacity=".3"/>
            </svg>
          </div>

          <!-- Tipo -->
          <div class="grafico-card">
            <h3 class="grafico-titulo">Tipo de evento</h3>
            <svg viewBox="0 0 {W} {H}" class="grafico-svg">
              {#each barTipo.yLabels as yl}
                <line x1={PAD.l} y1={yl.y} x2={W-PAD.r} y2={yl.y} stroke="currentColor" stroke-opacity=".1"/>
                <text x={PAD.l-4} y={yl.y+4} text-anchor="end" font-size="10" fill="currentColor" opacity=".6">{yl.text}</text>
              {/each}
              {#each barTipo.bars as b}
                <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#f97316" rx="2" opacity=".85"><title>{b.value} eventos</title></rect>
              {/each}
              {#each barTipo.labels as l}
                <text x={l.x} y={l.y} text-anchor="middle" font-size="9" fill="currentColor" opacity=".7">{l.text}</text>
              {/each}
              <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t+cH} stroke="currentColor" stroke-opacity=".3"/>
              <line x1={PAD.l} y1={PAD.t+cH} x2={W-PAD.r} y2={PAD.t+cH} stroke="currentColor" stroke-opacity=".3"/>
            </svg>
          </div>

          <!-- Distribución por nivel -->
          <div class="grafico-card">
            <h3 class="grafico-titulo">Distribución por nivel de evento</h3>
            <div class="nivel-bars">
              {#each porNivel.sort((a, b) => b.value - a.value) as item}
                {@const col = NIVEL_COLORS[item.label] ?? "#94a3b8"}
                {@const pct = kpiTotal ? Math.round((item.value / kpiTotal) * 100) : 0}
                <div class="nivel-row">
                  <span class="nivel-label">{item.label}</span>
                  <div class="nivel-bar-wrap">
                    <div class="nivel-bar-fill" style="width:{pct}%;background:{col}"></div>
                  </div>
                  <span class="nivel-count">{item.value} ({pct}%)</span>
                </div>
              {/each}
            </div>
          </div>

        </div>
      {/if}
    </div>
</div>

<style>
  .mapa-app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: var(--color--background);
    color: var(--color--text);
    font-family: system-ui, sans-serif;
  }

  /* ── Panel flotante sobre el mapa ───────────────────────────────────── */
  .panel-filtros {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    width: 220px;
    max-height: calc(100% - 20px);
    background: var(--color--surface);
    border: 1px solid var(--color--border);
    border-radius: 12px;
    box-shadow: var(--sombra--media);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width 0.2s ease;
  }
  .panel-filtros.cerrado { width: auto; }

  .filtros-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 10px;
    border-bottom: 1px solid var(--color--border);
    flex-shrink: 0;
  }
  .filtros-titulo { font-weight: 700; font-size: 14px; white-space: nowrap; }

  .btn-toggle-filtros {
    background: none;
    border: 1px solid var(--color--border);
    border-radius: 6px;
    cursor: pointer;
    padding: 2px 7px;
    font-size: 12px;
    color: var(--color--text);
    flex-shrink: 0;
  }

  .filtros-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .filtros-stat {
    font-size: 12px;
    font-weight: 600;
    color: var(--color--primary);
    background: rgba(var(--color--primary-rgb), 0.08);
    border-radius: 6px;
    padding: 6px 8px;
    text-align: center;
  }

  .filtro-grupo {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--color--text-muted);
  }
  .filtro-grupo select {
    background: var(--color--surface-2);
    border: 1px solid var(--color--border);
    border-radius: 6px;
    padding: 5px 8px;
    font-size: 12px;
    color: var(--color--text);
    outline: none;
    cursor: pointer;
  }
  .filtro-grupo select:focus { border-color: var(--color--primary); }

  .rango-año { display: flex; gap: 4px; }
  .rango-año select { flex: 1; }

  .btn-limpiar {
    background: none;
    border: 1px solid var(--color--border);
    border-radius: 6px;
    padding: 6px;
    font-size: 12px;
    cursor: pointer;
    color: var(--color--text-muted);
    transition: background 0.15s;
  }
  .btn-limpiar:hover { background: var(--color--surface-2); color: var(--color--text); }

  .leyenda-niveles {
    margin-top: 6px;
    padding-top: 10px;
    border-top: 1px solid var(--color--border);
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .leyenda-titulo {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--color--text-muted);
    margin-bottom: 2px;
  }
  .leyenda-item { display: flex; align-items: center; gap: 7px; font-size: 12px; }
  .leyenda-dot {
    width: 12px; height: 12px;
    border-radius: 50%;
    border: 1.5px solid rgba(255,255,255,0.25);
    flex-shrink: 0;
  }

  .pestanas {
    display: flex;
    gap: 2px;
    padding: 8px 12px 0;
    background: var(--color--surface);
    border-bottom: 1px solid var(--color--border);
    flex-shrink: 0;
  }
  .pestana-btn {
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    color: var(--color--text-muted);
    transition: color 0.15s, border-color 0.15s;
    border-radius: 6px 6px 0 0;
  }
  .pestana-btn:hover { color: var(--color--text); background: var(--color--surface-2); }
  .pestana-btn.activa { color: var(--color--primary); border-bottom-color: var(--color--primary); }

  .tab-panel { flex: 1; overflow: hidden; flex-direction: column; position: relative; }

  /* ── Mapa ─────────────────────────────────────────────────────────────── */
  .map { flex: 1; height: 100%; width: 100%; }
  .error-msg {
    background: #fee2e2; color: #991b1b;
    padding: 10px 16px; font-size: 13px;
    border-bottom: 1px solid #fca5a5;
  }

  /* ── Estadísticas ─────────────────────────────────────────────────────── */
  .estadisticas-panel { overflow-y: auto; padding: 20px; gap: 20px; }
  .cargando-msg { text-align: center; padding: 40px; opacity: .5; }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  .kpi-card {
    background: var(--color--surface);
    border: 1px solid var(--color--border);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: var(--sombra--suave);
  }
  .kpi-label {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: .07em;
    color: var(--color--text-muted);
  }
  .kpi-value { font-size: 28px; font-weight: 800; color: var(--color--primary); line-height: 1; }
  .kpi-heridos   .kpi-value { color: #ef4444; }
  .kpi-afectados .kpi-value { color: #f97316; }
  .kpi-viviendas .kpi-value { color: #8b5cf6; }
  .kpi-evacuados .kpi-value { color: #10b981; }
  .kpi-vias      .kpi-value { color: #0ea5e9; }

  .graficos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
    gap: 16px;
  }
  .grafico-card {
    background: var(--color--surface);
    border: 1px solid var(--color--border);
    border-radius: 12px;
    padding: 16px;
    box-shadow: var(--sombra--suave);
  }
  .grafico-ancho { grid-column: 1 / -1; }
  .grafico-titulo { font-size: 13px; font-weight: 700; margin: 0 0 10px; }
  .grafico-svg { width: 100%; height: auto; display: block; color: var(--color--text); }

  .nivel-bars { display: flex; flex-direction: column; gap: 10px; padding-top: 4px; }
  .nivel-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
  .nivel-label { width: 72px; flex-shrink: 0; font-weight: 600; }
  .nivel-bar-wrap {
    flex: 1;
    background: var(--color--surface-2);
    border-radius: 4px;
    height: 14px;
    overflow: hidden;
  }
  .nivel-bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
  .nivel-count { width: 90px; text-align: right; color: var(--color--text-muted); flex-shrink: 0; }
</style>
