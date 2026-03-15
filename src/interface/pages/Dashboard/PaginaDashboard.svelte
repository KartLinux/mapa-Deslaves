<script lang="ts">
  import { onDestroy } from "svelte";
  import { Chart } from "svelte-echarts";
  import { init, use } from "echarts/core";
  import { BarChart } from "echarts/charts";
  import { GridComponent, TooltipComponent, LegendComponent } from "echarts/components";
  import { CanvasRenderer } from "echarts/renderers";
  import type { Evento } from "../../../modules/map/eventData";
  import { ensureEventosLoaded, eventosCompartidos } from "../../../modules/map/eventosStore";

  use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

  type Kpi = {
    label: string;
    value: number;
    tone?: "default" | "danger" | "accent";
  };

  type Datum = {
    label: string;
    value: number;
  };

  type GroupedDatum = {
    label: string;
    a: number;
    b: number;
  };

  const chartInit = init;
  const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const COLOR_PRIMARY = "#0c6fbf";
  const COLOR_ACCENT = "#0f9f8f";
  const COLOR_DANGER = "#d14343";
  const COLOR_SOFT = "#89a8c4";

  let eventos: Evento[] = [];
  let cargando = true;
  let error = "";
  let fProvincia = "";
  let fCanton = "";
  let fEvento = "";
  let fNivel = "";
  let fAnoMin = "";
  let fAnoMax = "";

  function fmt(n: number): string {
    return Math.round(n).toLocaleString("es-EC");
  }

  function compact(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return fmt(n);
  }

  function chartBase(gridLeft = 50, gridRight = 20) {
    return {
      animationDuration: 550,
      animationDurationUpdate: 400,
      grid: { left: gridLeft, right: gridRight, top: 16, bottom: 44, containLabel: true },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      xAxis: {
        axisLine: { lineStyle: { color: "rgba(12,30,49,.28)" } },
        axisLabel: { color: "rgba(12,30,49,.75)" },
      },
      yAxis: {
        axisLine: { show: false },
        splitLine: { lineStyle: { color: "rgba(12,30,49,.1)" } },
        axisLabel: { color: "rgba(12,30,49,.75)" },
      },
    };
  }

  function groupCountBy(items: Evento[], getKey: (item: Evento) => string): Datum[] {
    const acc = new Map<string, number>();
    for (const item of items) {
      const key = getKey(item).trim() || "No especifica";
      acc.set(key, (acc.get(key) ?? 0) + 1);
    }
    return [...acc.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }

  function groupSumBy(items: Evento[], getKey: (item: Evento) => string, getValue: (item: Evento) => number): Datum[] {
    const acc = new Map<string, number>();
    for (const item of items) {
      const key = getKey(item).trim() || "No especifica";
      acc.set(key, (acc.get(key) ?? 0) + (getValue(item) || 0));
    }
    return [...acc.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }

  function yearSeries(items: Evento[], getValue: (item: Evento) => number): Datum[] {
    const acc = new Map<number, number>();
    for (const item of items) {
      if (!item.ano) continue;
      acc.set(item.ano, (acc.get(item.ano) ?? 0) + (getValue(item) || 0));
    }
    return [...acc.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([year, value]) => ({ label: String(year), value }));
  }

  function groupedYearSeries(items: Evento[], first: (item: Evento) => number, second: (item: Evento) => number): GroupedDatum[] {
    const acc = new Map<number, { a: number; b: number }>();
    for (const item of items) {
      if (!item.ano) continue;
      const current = acc.get(item.ano) ?? { a: 0, b: 0 };
      current.a += first(item) || 0;
      current.b += second(item) || 0;
      acc.set(item.ano, current);
    }
    return [...acc.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([year, values]) => ({ label: String(year), a: values.a, b: values.b }));
  }

  function monthlySeries(items: Evento[]): Datum[] {
    const totals = Array.from({ length: 12 }, (_, i) => ({ label: MONTHS[i], value: 0 }));
    for (const item of items) {
      if (item.mes >= 1 && item.mes <= 12) totals[item.mes - 1].value += 1;
    }
    return totals;
  }

  function top(data: Datum[], count: number): Datum[] {
    return data.slice(0, count);
  }

  function toneFor(kpi: Kpi["tone"]): string {
    if (kpi === "danger") return "var(--color--danger)";
    if (kpi === "accent") return "var(--color--accent)";
    return "var(--color--primary)";
  }

  function limpiarFiltros() {
    fProvincia = "";
    fCanton = "";
    fEvento = "";
    fNivel = "";
    fAnoMin = "";
    fAnoMax = "";
  }

  function verticalBarOption(title: string, data: Datum[], color: string, valueFmt = fmt) {
    return {
      ...chartBase(),
      tooltip: {
        trigger: "axis",
        formatter: (params: Array<{ axisValue: string; value: number }>) => {
          const p = params[0];
          return `${title}<br/>${p.axisValue}: <b>${valueFmt(p.value)}</b>`;
        },
      },
      xAxis: { ...chartBase().xAxis, type: "category", data: data.map((d) => d.label) },
      yAxis: { ...chartBase().yAxis, type: "value" },
      series: [
        {
          type: "bar",
          data: data.map((d) => d.value),
          itemStyle: { color, borderRadius: [8, 8, 0, 0] },
          barMaxWidth: 28,
        },
      ],
    };
  }

  function groupedBarOption(firstLabel: string, secondLabel: string, data: GroupedDatum[], firstColor: string, secondColor: string) {
    return {
      ...chartBase(),
      legend: { bottom: 0, textStyle: { color: "rgba(12,30,49,.74)" } },
      xAxis: { ...chartBase().xAxis, type: "category", data: data.map((d) => d.label) },
      yAxis: { ...chartBase().yAxis, type: "value" },
      series: [
        {
          name: firstLabel,
          type: "bar",
          data: data.map((d) => d.a),
          itemStyle: { color: firstColor, borderRadius: [8, 8, 0, 0] },
          barMaxWidth: 24,
        },
        {
          name: secondLabel,
          type: "bar",
          data: data.map((d) => d.b),
          itemStyle: { color: secondColor, borderRadius: [8, 8, 0, 0] },
          barMaxWidth: 24,
        },
      ],
    };
  }

  function horizontalBarOption(data: Datum[], color: string, valueFmt = fmt) {
    const cleaned = [...data].reverse();
    return {
      ...chartBase(12, 20),
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: Array<{ name: string; value: number }>) => {
          const p = params[0];
          return `${p.name}: <b>${valueFmt(p.value)}</b>`;
        },
      },
      xAxis: { ...chartBase().xAxis, type: "value" },
      yAxis: {
        ...chartBase().yAxis,
        type: "category",
        data: cleaned.map((d) => d.label),
        axisLabel: { color: "rgba(12,30,49,.82)", width: 180, overflow: "truncate" },
      },
      series: [
        {
          type: "bar",
          data: cleaned.map((d) => d.value),
          itemStyle: { color, borderRadius: [0, 8, 8, 0] },
          barMaxWidth: 18,
        },
      ],
    };
  }

  $: provinciasOptions = [...new Set(eventos.map((e) => e.provincia).filter(Boolean))].sort();
  $: cantonesOptions = [...new Set(eventos
    .filter((e) => !fProvincia || e.provincia === fProvincia)
    .map((e) => e.canton)
    .filter(Boolean))].sort();
  $: eventosOptions = [...new Set(eventos.map((e) => e.evento).filter(Boolean))].sort();
  $: nivelesOptions = [...new Set(eventos.map((e) => e.nivelEvento).filter(Boolean))].sort();
  $: aniosOptions = [...new Set(eventos.map((e) => e.ano).filter(Boolean))].sort((a, b) => a - b);
  $: if (fCanton && !cantonesOptions.includes(fCanton)) fCanton = "";

  $: eventosFiltrados = eventos.filter((e) => {
    if (fProvincia && e.provincia !== fProvincia) return false;
    if (fCanton && e.canton !== fCanton) return false;
    if (fEvento && e.evento !== fEvento) return false;
    if (fNivel && e.nivelEvento !== fNivel) return false;
    if (fAnoMin && e.ano < Number(fAnoMin)) return false;
    if (fAnoMax && e.ano > Number(fAnoMax)) return false;
    return true;
  });

  $: totalEventos = eventosFiltrados.length;
  $: provincias = new Set(eventosFiltrados.map((e) => e.provincia).filter(Boolean));
  $: cantones = new Set(eventosFiltrados.map((e) => e.canton).filter(Boolean));
  $: anios = eventosFiltrados.map((e) => e.ano).filter(Boolean);
  $: desde = anios.length ? Math.min(...anios) : 0;
  $: hasta = anios.length ? Math.max(...anios) : 0;

  $: totalFallecidas = eventosFiltrados.reduce((sum, e) => sum + e.fallecidas, 0);
  $: totalHeridas = eventosFiltrados.reduce((sum, e) => sum + e.heridas, 0);
  $: totalDesaparecidas = eventosFiltrados.reduce((sum, e) => sum + e.desaparecidos, 0);
  $: totalAfectadas = eventosFiltrados.reduce((sum, e) => sum + e.personasAfectadasDirectamente, 0);
  $: totalImpactadas = eventosFiltrados.reduce((sum, e) => sum + e.personasImpactadas, 0);
  $: totalEvacuadas = eventosFiltrados.reduce((sum, e) => sum + e.personasEvacuadas, 0);
  $: totalAlbergadas = eventosFiltrados.reduce((sum, e) => sum + e.personasAlbergadas, 0);
  $: totalViviendasAfectadas = eventosFiltrados.reduce((sum, e) => sum + e.viviendasAfectadas, 0);
  $: totalViviendasDestruidas = eventosFiltrados.reduce((sum, e) => sum + e.viviendasDestruidas, 0);
  $: totalKmVias = eventosFiltrados.reduce((sum, e) => sum + e.kmViasAfectadas, 0);

  $: kpis = [
    { label: "Eventos registrados", value: totalEventos },
    { label: "Provincias con eventos", value: provincias.size },
    { label: "Cantones con eventos", value: cantones.size },
    { label: "Personas afectadas direct.", value: totalAfectadas, tone: "accent" },
    { label: "Personas impactadas", value: totalImpactadas },
    { label: "Fallecidas", value: totalFallecidas, tone: "danger" },
    { label: "Heridas", value: totalHeridas },
    { label: "Desaparecidas", value: totalDesaparecidas, tone: "danger" },
    { label: "Evacuadas", value: totalEvacuadas },
    { label: "Albergadas", value: totalAlbergadas },
    { label: "Viviendas afectadas", value: totalViviendasAfectadas },
    { label: "Viviendas destruidas", value: totalViviendasDestruidas, tone: "danger" },
  ] satisfies Kpi[];

  $: eventosPorAnio = yearSeries(eventosFiltrados, () => 1);
  $: afectadosPorAnio = yearSeries(eventosFiltrados, (e) => e.personasAfectadasDirectamente);
  $: fallecidasPorAnio = yearSeries(eventosFiltrados, (e) => e.fallecidas);
  $: eventosPorMes = monthlySeries(eventosFiltrados);
  $: viviendasPorAnio = groupedYearSeries(eventosFiltrados, (e) => e.viviendasAfectadas, (e) => e.viviendasDestruidas);
  $: movilidadPorAnio = groupedYearSeries(eventosFiltrados, (e) => e.personasEvacuadas, (e) => e.personasAlbergadas);
  $: topProvinciasEventos = top(groupCountBy(eventosFiltrados, (e) => e.provincia), 8);
  $: topProvinciasAfectadas = top(groupSumBy(eventosFiltrados, (e) => e.provincia, (e) => e.personasAfectadasDirectamente), 8);
  $: topCantonesEventos = top(groupCountBy(eventosFiltrados, (e) => `${e.canton}, ${e.provincia}`), 8);
  $: topTipos = top(groupCountBy(eventosFiltrados, (e) => e.evento), 8);

  $: eventosPorAnioOpt = verticalBarOption("Eventos por anio", eventosPorAnio, COLOR_PRIMARY);
  $: afectadosPorAnioOpt = verticalBarOption("Afectadas directas por anio", afectadosPorAnio, COLOR_ACCENT, compact);
  $: fallecidasPorAnioOpt = verticalBarOption("Fallecidas por anio", fallecidasPorAnio, COLOR_DANGER);
  $: eventosPorMesOpt = verticalBarOption("Eventos por mes", eventosPorMes, COLOR_PRIMARY);
  $: viviendasPorAnioOpt = groupedBarOption("Afectadas", "Destruidas", viviendasPorAnio, COLOR_PRIMARY, COLOR_DANGER);
  $: movilidadPorAnioOpt = groupedBarOption("Evacuadas", "Albergadas", movilidadPorAnio, COLOR_ACCENT, COLOR_SOFT);
  $: topProvinciasEventosOpt = horizontalBarOption(topProvinciasEventos, COLOR_PRIMARY);
  $: topProvinciasAfectadasOpt = horizontalBarOption(topProvinciasAfectadas, COLOR_ACCENT, compact);
  $: topCantonesEventosOpt = horizontalBarOption(topCantonesEventos, COLOR_SOFT);
  $: topTiposOpt = horizontalBarOption(topTipos, COLOR_DANGER);

  const unsubscribe = eventosCompartidos.subscribe((state) => {
    eventos = state.eventos;
    cargando = state.cargando;
    error = state.error;
  });

  onDestroy(() => {
    unsubscribe();
  });

  void ensureEventosLoaded();
</script>

<section class="dashboard-page">
  <div class="contenedor dashboard-shell">
    <header class="hero">
      <div class="hero-copy">
        <span class="eyebrow">Dashboard historico</span>
        <h1>Indicadores y tendencias de deslaves e impactos asociados</h1>
        <p>Priorizamos escritorio: el panel mantiene lectura comparativa en 2 columnas y graficos con ECharts.</p>
      </div>

      <div class="hero-summary">
        <div class="hero-highlight">
          <strong>{cargando ? "..." : compact(totalEventos)}</strong>
          <span>eventos entre {desde || "-"} y {hasta || "-"}</span>
        </div>
        <div class="hero-mini-grid">
          <div>
            <strong>{cargando ? "..." : compact(totalAfectadas)}</strong>
            <span>afectadas directas</span>
          </div>
          <div>
            <strong>{cargando ? "..." : compact(totalFallecidas)}</strong>
            <span>fallecidas</span>
          </div>
          <div>
            <strong>{cargando ? "..." : compact(totalViviendasDestruidas)}</strong>
            <span>viviendas destruidas</span>
          </div>
          <div>
            <strong>{cargando ? "..." : compact(totalEvacuadas)}</strong>
            <span>evacuadas</span>
          </div>
        </div>
      </div>
    </header>

    {#if error}
      <div class="error-box">No se pudieron cargar los datos: {error}</div>
    {:else if cargando}
      <div class="loading-grid">
        {#each Array.from({ length: 6 }) as _}
          <div class="loading-card" aria-hidden="true"></div>
        {/each}
      </div>
    {:else}
      <section class="filters-card">
        <div class="filters-head">
          <div>
            <span class="eyebrow">Filtros</span>
            <h2>Refinar dashboard</h2>
          </div>
          <button class="btn-clear" onclick={limpiarFiltros}>Limpiar</button>
        </div>

        <div class="filters-grid">
          <label>
            <span>Provincia</span>
            <select bind:value={fProvincia}>
              <option value="">Todas</option>
              {#each provinciasOptions as item}
                <option value={item}>{item}</option>
              {/each}
            </select>
          </label>

          <label>
            <span>Canton</span>
            <select bind:value={fCanton}>
              <option value="">Todos</option>
              {#each cantonesOptions as item}
                <option value={item}>{item}</option>
              {/each}
            </select>
          </label>

          <label>
            <span>Tipo de evento</span>
            <select bind:value={fEvento}>
              <option value="">Todos</option>
              {#each eventosOptions as item}
                <option value={item}>{item}</option>
              {/each}
            </select>
          </label>

          <label>
            <span>Nivel</span>
            <select bind:value={fNivel}>
              <option value="">Todos</option>
              {#each nivelesOptions as item}
                <option value={item}>{item}</option>
              {/each}
            </select>
          </label>

          <label>
            <span>Anio desde</span>
            <select bind:value={fAnoMin}>
              <option value="">Desde</option>
              {#each aniosOptions as item}
                <option value={item}>{item}</option>
              {/each}
            </select>
          </label>

          <label>
            <span>Anio hasta</span>
            <select bind:value={fAnoMax}>
              <option value="">Hasta</option>
              {#each aniosOptions as item}
                <option value={item}>{item}</option>
              {/each}
            </select>
          </label>
        </div>

        <p class="filters-result">Resultados: <strong>{fmt(totalEventos)}</strong> eventos.</p>
      </section>

      <section class="kpi-grid">
        {#each kpis as kpi}
          <article class="kpi-card">
            <span>{kpi.label}</span>
            <strong style={`color:${toneFor(kpi.tone)}`}>{compact(kpi.value)}</strong>
          </article>
        {/each}
      </section>

      <section class="chart-grid">
        <article class="chart-card">
          <div class="card-head"><h2>Eventos por anio</h2><strong>{fmt(totalEventos)}</strong></div>
          <div class="echart"><Chart init={chartInit} options={eventosPorAnioOpt} /></div>
        </article>

        <article class="chart-card">
          <div class="card-head"><h2>Personas afectadas directamente por anio</h2><strong>{compact(totalAfectadas)}</strong></div>
          <div class="echart"><Chart init={chartInit} options={afectadosPorAnioOpt} /></div>
        </article>

        <article class="chart-card">
          <div class="card-head"><h2>Fallecidas por anio</h2><strong>{fmt(totalFallecidas)}</strong></div>
          <div class="echart"><Chart init={chartInit} options={fallecidasPorAnioOpt} /></div>
        </article>

        <article class="chart-card">
          <div class="card-head"><h2>Eventos por mes</h2><strong>12 meses</strong></div>
          <div class="echart"><Chart init={chartInit} options={eventosPorMesOpt} /></div>
        </article>

        <article class="chart-card">
          <div class="card-head"><h2>Viviendas afectadas vs destruidas por anio</h2><strong>{compact(totalViviendasAfectadas)}</strong></div>
          <div class="echart"><Chart init={chartInit} options={viviendasPorAnioOpt} /></div>
        </article>

        <article class="chart-card">
          <div class="card-head"><h2>Evacuadas vs albergadas por anio</h2><strong>{compact(totalEvacuadas)}</strong></div>
          <div class="echart"><Chart init={chartInit} options={movilidadPorAnioOpt} /></div>
        </article>

        <article class="chart-card">
          <div class="card-head"><h2>Top provincias por numero de eventos</h2><strong>{provincias.size}</strong></div>
          <div class="echart"><Chart init={chartInit} options={topProvinciasEventosOpt} /></div>
        </article>

        <article class="chart-card">
          <div class="card-head"><h2>Top provincias por personas afectadas</h2><strong>{compact(totalAfectadas)}</strong></div>
          <div class="echart"><Chart init={chartInit} options={topProvinciasAfectadasOpt} /></div>
        </article>

        <article class="chart-card">
          <div class="card-head"><h2>Top cantones por numero de eventos</h2><strong>{cantones.size}</strong></div>
          <div class="echart"><Chart init={chartInit} options={topCantonesEventosOpt} /></div>
        </article>

        <article class="chart-card">
          <div class="card-head"><h2>Tipos de evento mas frecuentes</h2><strong>{topTipos.length}</strong></div>
          <div class="echart"><Chart init={chartInit} options={topTiposOpt} /></div>
        </article>
      </section>

      <section class="notes-grid">
        <article class="note-card">
          <span class="eyebrow">Cobertura</span>
          <h3>Lectura territorial</h3>
          <p>El dashboard resume {fmt(totalEventos)} registros, {fmt(provincias.size)} provincias y {fmt(cantones.size)} cantones.</p>
        </article>
        <article class="note-card">
          <span class="eyebrow">Infraestructura</span>
          <h3>Danios acumulados</h3>
          <p>Se registran {compact(totalViviendasAfectadas)} viviendas afectadas, {compact(totalViviendasDestruidas)} destruidas y {compact(totalKmVias)} km de vias afectadas.</p>
        </article>
      </section>
    {/if}
  </div>
</section>

<style>
  .dashboard-page {
    min-height: 100%;
    padding: 24px 0 34px;
    background:
      radial-gradient(circle at top left, rgba(var(--color--primary-rgb), 0.14), transparent 28%),
      radial-gradient(circle at bottom right, rgba(var(--color--accent-rgb), 0.1), transparent 22%),
      var(--color--background);
  }

  .dashboard-shell {
    display: grid;
    gap: 18px;
  }

  .hero,
  .filters-card,
  .kpi-card,
  .chart-card,
  .note-card,
  .error-box,
  .loading-card {
    border: 1px solid var(--color--border);
    background: var(--gradient--glass);
    box-shadow: var(--sombra--suave);
    backdrop-filter: blur(14px);
  }

  .hero {
    display: grid;
    grid-template-columns: 1.2fr 0.9fr;
    gap: 18px;
    padding: 26px;
    border-radius: 30px;
  }

  .hero-copy h1 {
    max-width: 12ch;
    margin: 10px 0 12px;
    font-size: clamp(34px, 4.6vw, 58px);
    line-height: 0.96;
  }

  .hero-copy p,
  .note-card p {
    margin: 0;
    color: var(--color--text-muted);
    line-height: 1.75;
  }

  .eyebrow {
    display: inline-block;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color--primary);
  }

  .hero-summary {
    display: grid;
    gap: 14px;
  }

  .hero-highlight {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 22px;
    border-radius: 24px;
    background: linear-gradient(145deg, rgba(var(--color--primary-rgb), 0.16), rgba(var(--color--accent-rgb), 0.08));
  }

  .hero-highlight strong {
    font-size: clamp(42px, 6vw, 72px);
    line-height: 1;
    color: var(--color--primary);
  }

  .hero-highlight span,
  .hero-mini-grid span,
  .kpi-card span {
    color: var(--color--text-muted);
    font-weight: 700;
  }

  .hero-mini-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .hero-mini-grid div,
  .kpi-card {
    padding: 18px;
    border: 1px solid var(--color--border);
    border-radius: 22px;
    background: rgba(var(--color--primary-rgb), 0.04);
  }

  .hero-mini-grid strong,
  .kpi-card strong {
    display: block;
    margin-top: 8px;
    font-size: 30px;
    line-height: 1.05;
  }

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .filters-card {
    padding: 22px 24px;
    border-radius: 24px;
  }

  .filters-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .filters-head h2 {
    margin: 6px 0 0;
    font-size: 22px;
    line-height: 1.1;
  }

  .btn-clear {
    border: 1px solid var(--color--border);
    background: rgba(var(--color--primary-rgb), 0.06);
    color: var(--color--text);
    border-radius: 12px;
    min-height: 36px;
    padding: 0 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .filters-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 14px;
    align-items: start;
  }

  .filters-grid label {
    display: grid;
    gap: 8px;
    padding: 10px;
    border: 1px solid var(--color--border);
    border-radius: 12px;
    background: color-mix(in srgb, var(--color--surface) 86%, transparent);
  }

  .filters-grid label span {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color--text-muted);
  }

  .filters-grid select {
    border: 1px solid var(--color--border);
    border-radius: 10px;
    background: var(--color--surface);
    color: var(--color--text);
    min-height: 40px;
    padding: 0 12px;
    width: 100%;
  }

  .filters-grid select:focus {
    border-color: var(--color--primary);
    box-shadow: 0 0 0 2px rgba(var(--color--primary-rgb), 0.12);
    outline: none;
  }

  .filters-result {
    margin: 14px 0 0;
    color: var(--color--text-muted);
    font-size: 13px;
  }

  .chart-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    align-items: start;
  }

  .chart-card,
  .note-card,
  .error-box,
  .loading-card {
    padding: 22px;
    border-radius: 28px;
  }

  .card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  .card-head h2,
  .note-card h3 {
    margin: 0;
    font-size: 22px;
    line-height: 1.08;
    max-width: 78%;
  }

  .card-head strong {
    font-size: 20px;
    color: var(--color--text);
  }

  .echart {
    width: 100%;
    height: 320px;
  }

  .echart :global(canvas) {
    border-radius: 14px;
  }

  .notes-grid,
  .loading-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .note-card h3 {
    margin: 8px 0 10px;
  }

  .error-box {
    color: var(--color--danger);
    background: rgba(209, 67, 67, 0.08);
  }

  .loading-card {
    min-height: 280px;
    background:
      linear-gradient(90deg, var(--color--surface-2), var(--color--surface-3), var(--color--surface-2));
    background-size: 200% 100%;
    animation: shimmer 1.5s linear infinite;
  }

  @keyframes shimmer {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: -200% 0;
    }
  }

  @media (max-width: 1100px) {
    .kpi-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .filters-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
    }
  }

  @media (max-width: 920px) {
    .hero,
    .chart-grid,
    .notes-grid,
    .loading-grid {
      grid-template-columns: 1fr;
    }

    .kpi-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .filters-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
  }

  @media (max-width: 640px) {
    .dashboard-page {
      padding-top: 16px;
    }

    .hero,
    .chart-card,
    .note-card,
    .error-box,
    .loading-card {
      padding: 18px;
      border-radius: 22px;
    }

    .hero-mini-grid,
    .kpi-grid {
      grid-template-columns: 1fr;
    }

    .filters-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .filters-card {
      padding: 18px;
    }

    .card-head {
      flex-direction: column;
    }

    .card-head h2 {
      max-width: 100%;
    }
  }
</style>
