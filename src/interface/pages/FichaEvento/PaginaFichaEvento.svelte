<script lang="ts">
  import { onMount } from "svelte";
  import { eventoSeleccionado } from "../../../modules/map/eventoStore";
  import { navegar } from "../../router/enrutador";
  import { NIVEL_COLORS, type Evento } from "../../../modules/map/eventData";

  let evento: Evento | null = null;
  $: evento = $eventoSeleccionado;

  function nivelColor(nivel: string): string {
    return NIVEL_COLORS[nivel] ?? "#94a3b8";
  }

  function fmtNum(n: number | undefined): string {
    if (n === undefined || n === null || isNaN(n)) return "—";
    if (n === 0) return "0";
    return n.toLocaleString("es-EC");
  }

  function fmtStr(s: string | undefined): string {
    if (!s || s.trim() === "" || s === "undefined") return "—";
    return s;
  }

  function osm(lat: number, lng: number): string {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=13`;
  }

  function volver() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navegar("/mapa");
    }
  }

  // Si se accede directamente a /ficha sin evento, redirigir al mapa
  onMount(() => {
    if (!evento) {
      setTimeout(() => navegar("/mapa"), 2500);
    }
  });
</script>

<div class="ficha-app">
  <!-- ─── Breadcrumb / back ─────────────────────────────────────────── -->
  <div class="ficha-nav contenedor">
    <button class="btn-volver" onclick={volver}>
      ← Volver al Geoportal
    </button>
    {#if evento}
      <nav class="breadcrumb" aria-label="Navegación">
        <button type="button" onclick={() => navegar("/")} class="bc-link">Inicio</button>
        <span class="bc-sep" aria-hidden="true">›</span>
        <button type="button" onclick={() => navegar("/mapa")} class="bc-link">Geoportal</button>
        <span class="bc-sep" aria-hidden="true">›</span>
        <span class="bc-current">{evento.evento} #{evento.id}</span>
      </nav>
    {/if}
  </div>

  {#if !evento}
    <!-- ── Sin evento seleccionado ────────────────────────────────── -->
    <div class="sin-evento contenedor">
      <div class="sin-icono">📍</div>
      <h2>No hay evento seleccionado</h2>
      <p>Selecciona un marcador en el mapa para ver su ficha técnica completa.</p>
      <p class="redir">Redirigiendo al Geoportal en unos segundos…</p>
      <button class="btn-primario" onclick={() => navegar("/mapa")}>Ir al Geoportal</button>
    </div>

  {:else}
    <!-- ─── CABECERA DE LA FICHA ──────────────────────────────────── -->
    <div class="ficha-header-band" style="border-left: 5px solid {nivelColor(evento.nivelEvento)}">
      <div class="contenedor ficha-header-inner">
        <div class="ficha-badges">
          <span class="badge-nivel" style="background:{nivelColor(evento.nivelEvento)};color:#fff">
            {evento.nivelEvento || "Sin nivel"}
          </span>
          <span class="badge-categoria">{evento.categoriaDelEvento || "Evento adverso"}</span>
        </div>
        <h1 class="ficha-titulo">{evento.evento}</h1>
        <div class="ficha-meta">
          <span>📍 {evento.provincia} › {evento.canton}{evento.parroquias ? " › " + evento.parroquias : ""}</span>
          {#if evento.fechaEvento}
            <span>📅 {evento.fechaEvento}</span>
          {:else if evento.ano}
            <span>📅 Año {evento.ano}</span>
          {/if}
          <span>🆔 ID: {evento.id}</span>
        </div>
      </div>
    </div>

    <div class="ficha-body contenedor">

      <!-- ── BLOQUE A: Identificación ───────────────────────────── -->
      <section class="bloque">
        <h2 class="bloque-titulo">A — Identificación</h2>
        <div class="campo-grid">
          <div class="campo"><span class="campo-lbl">ID evento</span><span class="campo-val">{evento.id}</span></div>
          <div class="campo"><span class="campo-lbl">Tipo de evento</span><span class="campo-val">{fmtStr(evento.evento)}</span></div>
          <div class="campo"><span class="campo-lbl">Categoría</span><span class="campo-val">{fmtStr(evento.categoriaDelEvento)}</span></div>
          <div class="campo"><span class="campo-lbl">Causa</span><span class="campo-val">{fmtStr(evento.causa)}</span></div>
          <div class="campo"><span class="campo-lbl">Nivel de peligrosidad</span>
            <span class="campo-val">
              <span class="mini-badge" style="background:{nivelColor(evento.nivelEvento)}">{fmtStr(evento.nivelEvento)}</span>
            </span>
          </div>
          <div class="campo"><span class="campo-lbl">Estado del informe</span><span class="campo-val">{fmtStr(evento.estadoInforme)}</span></div>
          <div class="campo"><span class="campo-lbl">Nivel de informe</span><span class="campo-val">{fmtStr(evento.nivelInforme)}</span></div>
          <div class="campo"><span class="campo-lbl">Macroevento</span><span class="campo-val">{fmtStr(evento.macroevento)}</span></div>
          <div class="campo"><span class="campo-lbl">Zonal</span><span class="campo-val">{fmtStr(evento.zonal)}</span></div>
          <div class="campo"><span class="campo-lbl">Fecha del evento</span><span class="campo-val">{fmtStr(evento.fechaEvento)}</span></div>
          <div class="campo"><span class="campo-lbl">Año</span><span class="campo-val">{evento.ano || "—"}</span></div>
          <div class="campo"><span class="campo-lbl">Mes</span><span class="campo-val">{evento.mes || "—"}</span></div>
          <div class="campo"><span class="campo-lbl">Hora</span><span class="campo-val">{fmtStr(evento.horaEvento)}</span></div>
          <div class="campo"><span class="campo-lbl">Eventos lluvias</span><span class="campo-val">{fmtNum(evento.eventosLluvias)}</span></div>
        </div>
      </section>

      <!-- ── BLOQUE B: Ubicación ────────────────────────────────── -->
      <section class="bloque">
        <h2 class="bloque-titulo">B — Ubicación</h2>
        <div class="campo-grid">
          <div class="campo"><span class="campo-lbl">Provincia</span><span class="campo-val">{fmtStr(evento.provincia)}</span></div>
          <div class="campo"><span class="campo-lbl">Cantón</span><span class="campo-val">{fmtStr(evento.canton)}</span></div>
          <div class="campo"><span class="campo-lbl">Parroquias</span><span class="campo-val">{fmtStr(evento.parroquias)}</span></div>
          <div class="campo"><span class="campo-lbl">Comunidad / Barrio</span><span class="campo-val">{fmtStr(evento.comunidad)}</span></div>
          <div class="campo"><span class="campo-lbl">Latitud</span><span class="campo-val">{evento.lat.toFixed(6)}</span></div>
          <div class="campo"><span class="campo-lbl">Longitud</span><span class="campo-val">{evento.lng.toFixed(6)}</span></div>
          {#if evento.lat && evento.lng}
            <div class="campo campo-ancho">
              <span class="campo-lbl">Ver en mapa externo</span>
              <span class="campo-val">
                <a href={osm(evento.lat, evento.lng)} target="_blank" rel="noopener noreferrer" class="enlace-externo">
                  Ver en OpenStreetMap ↗
                </a>
              </span>
            </div>
          {/if}
        </div>
      </section>

      <!-- ── BLOQUE C: Impacto en personas ──────────────────────── -->
      <section class="bloque bloque-impacto">
        <h2 class="bloque-titulo">C — Impacto en personas</h2>
        <div class="campo-grid">
          <div class="campo campo-critico">
            <span class="campo-lbl">🔴 Fallecidas</span>
            <span class="campo-val campo-val-grande">{fmtNum(evento.fallecidas)}</span>
          </div>
          <div class="campo campo-critico">
            <span class="campo-lbl">⚠️ Heridas</span>
            <span class="campo-val campo-val-grande">{fmtNum(evento.heridas)}</span>
          </div>
          <div class="campo campo-critico">
            <span class="campo-lbl">🔍 Desaparecidos</span>
            <span class="campo-val campo-val-grande">{fmtNum(evento.desaparecidos)}</span>
          </div>
          <div class="campo campo-critico">
            <span class="campo-lbl">💀 Muertos + desap.</span>
            <span class="campo-val campo-val-grande">{fmtNum(evento.muertosDesaparecidos)}</span>
          </div>
          <div class="campo"><span class="campo-lbl">Familias afectadas</span><span class="campo-val">{fmtNum(evento.familiasAfectadas)}</span></div>
          <div class="campo"><span class="campo-lbl">Pers. afect. directamente</span><span class="campo-val">{fmtNum(evento.personasAfectadasDirectamente)}</span></div>
          <div class="campo"><span class="campo-lbl">Pers. afect. indirectamente</span><span class="campo-val">{fmtNum(evento.afectadasIndirectas)}</span></div>
          <div class="campo"><span class="campo-lbl">Personas impactadas</span><span class="campo-val">{fmtNum(evento.personasImpactadas)}</span></div>
          <div class="campo"><span class="campo-lbl">Familias damnificadas</span><span class="campo-val">{fmtNum(evento.familiasDamnificadas)}</span></div>
          <div class="campo"><span class="campo-lbl">Personas damnificadas</span><span class="campo-val">{fmtNum(evento.personasDamnificadas)}</span></div>
          <div class="campo"><span class="campo-lbl">Personas evacuadas</span><span class="campo-val">{fmtNum(evento.personasEvacuadas)}</span></div>
          <div class="campo"><span class="campo-lbl">Personas albergadas</span><span class="campo-val">{fmtNum(evento.personasAlbergadas)}</span></div>
          <div class="campo"><span class="campo-lbl">P. en familias acogientes</span><span class="campo-val">{fmtNum(evento.pEnFamiliasAcogientes)}</span></div>
          <div class="campo"><span class="campo-lbl">P. en otros medios</span><span class="campo-val">{fmtNum(evento.personasOtrosMedios)}</span></div>
          <div class="campo"><span class="campo-lbl">P. en proceso evacuación</span><span class="campo-val">{fmtNum(evento.personasEnProcesoEvacuacion)}</span></div>
          <div class="campo"><span class="campo-lbl">P. resistencia evacuación</span><span class="campo-val">{fmtNum(evento.personasResistenEvacuacion)}</span></div>
          <div class="campo"><span class="campo-lbl">Necesidad albergue</span><span class="campo-val">{fmtNum(evento.necesidadAlbergue)}</span></div>
          <div class="campo"><span class="campo-lbl">Personas APH / Rescate</span><span class="campo-val">{fmtNum(evento.personasAphRescate)}</span></div>
        </div>
      </section>

      <!-- ── BLOQUE D: Infraestructura ──────────────────────────── -->
      <section class="bloque">
        <h2 class="bloque-titulo">D — Infraestructura</h2>
        <div class="campo-grid">
          <div class="campo"><span class="campo-lbl">Viviendas afectadas</span><span class="campo-val">{fmtNum(evento.viviendasAfectadas)}</span></div>
          <div class="campo"><span class="campo-lbl">Viviendas destruidas</span><span class="campo-val">{fmtNum(evento.viviendasDestruidas)}</span></div>
          <div class="campo"><span class="campo-lbl">Estab. educ. afectados</span><span class="campo-val">{fmtNum(evento.estabEdAfectados)}</span></div>
          <div class="campo"><span class="campo-lbl">Estab. educ. destruidos</span><span class="campo-val">{fmtNum(evento.estabEdDestruidos)}</span></div>
          <div class="campo"><span class="campo-lbl">Centros salud afectados</span><span class="campo-val">{fmtNum(evento.centrosSaludAfectados)}</span></div>
          <div class="campo"><span class="campo-lbl">Centros salud destruidos</span><span class="campo-val">{fmtNum(evento.centrosSaludDestruidos)}</span></div>
          <div class="campo"><span class="campo-lbl">Puentes afectados</span><span class="campo-val">{fmtNum(evento.puentesAfectados)}</span></div>
          <div class="campo"><span class="campo-lbl">Puentes destruidos</span><span class="campo-val">{fmtNum(evento.puentesDestruidos)}</span></div>
          <div class="campo"><span class="campo-lbl">Bienes públicos afect.</span><span class="campo-val">{fmtNum(evento.bienesPublicosAfectados)}</span></div>
          <div class="campo"><span class="campo-lbl">Bienes públicos destruidos</span><span class="campo-val">{fmtNum(evento.bienesPublicosDestruidos)}</span></div>
          <div class="campo"><span class="campo-lbl">Bienes privados afect.</span><span class="campo-val">{fmtNum(evento.bienesPrivadosAfectados)}</span></div>
          <div class="campo"><span class="campo-lbl">Bienes privados destruidos</span><span class="campo-val">{fmtNum(evento.bienesPrivadosDestruidos)}</span></div>
          <div class="campo"><span class="campo-lbl">Vías afectadas (m)</span><span class="campo-val">{fmtNum(evento.metrosViasAfectadas)}</span></div>
          <div class="campo"><span class="campo-lbl">Vías afectadas (km)</span><span class="campo-val">{fmtNum(evento.kmViasAfectadas)}</span></div>
          <div class="campo"><span class="campo-lbl">Categoría de vía</span><span class="campo-val">{fmtStr(evento.categoriaVia)}</span></div>
          <div class="campo"><span class="campo-lbl">Estado de vía</span><span class="campo-val">{fmtStr(evento.estadoVia)}</span></div>
          <div class="campo"><span class="campo-lbl">Vía alterna</span><span class="campo-val">{fmtStr(evento.viaAlterna)}</span></div>
        </div>
      </section>

      <!-- ── BLOQUE E: Impacto ambiental ────────────────────────── -->
      <section class="bloque">
        <h2 class="bloque-titulo">E — Impacto ambiental y agropecuario</h2>
        <div class="campo-grid">
          <div class="campo"><span class="campo-lbl">Ha. cultivo afectadas</span><span class="campo-val">{fmtNum(evento.haCultivoAfectadas)}</span></div>
          <div class="campo"><span class="campo-lbl">Ha. cultivo perdidas</span><span class="campo-val">{fmtNum(evento.haCultivoPerdidas)}</span></div>
          <div class="campo"><span class="campo-lbl">Ha. vegetal quemada</span><span class="campo-val">{fmtNum(evento.haVegetalQuemada)}</span></div>
          <div class="campo"><span class="campo-lbl">Animales afectados</span><span class="campo-val">{fmtNum(evento.animalesAfectados)}</span></div>
          <div class="campo"><span class="campo-lbl">Animales muertos</span><span class="campo-val">{fmtNum(evento.animalesMuertos)}</span></div>
        </div>
      </section>

      <!-- ── BLOQUE F: Narrativa ─────────────────────────────────── -->
      <section class="bloque">
        <h2 class="bloque-titulo">F — Narrativa técnica</h2>
        <div class="narrativa-box">
          <div class="narrativa-item">
            <h4 class="narrativa-lbl">Descripción general del evento</h4>
            <p class="narrativa-texto">{fmtStr(evento.descripcion)}</p>
          </div>
          <div class="narrativa-item">
            <h4 class="narrativa-lbl">Acciones y respuesta</h4>
            <p class="narrativa-texto">{fmtStr(evento.acciones)}</p>
          </div>
        </div>
      </section>

    </div>
  {/if}
</div>

<style>
  .ficha-app {
    background:
      radial-gradient(circle at top left, rgba(var(--color--primary-rgb), 0.08), transparent 28%),
      linear-gradient(180deg, var(--color--background), var(--color--surface-2));
    color: var(--color--text);
    min-height: calc(100vh - 60px);
    padding-bottom: 60px;
  }

  /* ── Nav ───────────────────────────────────────────────────────── */
  .ficha-nav {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 18px 0 12px;
  }

  .btn-volver {
    background: var(--gradient--glass);
    border: 1px solid var(--color--border);
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    color: var(--color--primary);
    box-shadow: var(--sombra--suave);
    white-space: nowrap;
  }
  .btn-volver:hover { transform: translateY(-1px); }

  .breadcrumb { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .bc-link {
    font-size: 13px;
    color: var(--color--primary);
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-family: inherit;
    text-decoration: underline;
    text-decoration-color: transparent;
    transition: text-decoration-color 0.15s;
  }
  .bc-link:hover { text-decoration-color: var(--color--primary); }
  .bc-sep { font-size: 13px; color: var(--color--text-muted); }
  .bc-current { font-size: 13px; color: var(--color--text-muted); font-weight: 600; }

  /* ── Sin evento ────────────────────────────────────────────────── */
  .sin-evento {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 100px 20px;
    text-align: center;
  }
  .sin-icono { font-size: 48px; }
  .sin-evento h2 { font-size: 20px; margin: 0; }
  .sin-evento p { font-size: 15px; color: var(--color--text-muted); margin: 0; }
  .redir { font-size: 12px; opacity: .7; font-style: italic; }
  .btn-primario {
    background: var(--color--primary);
    color: var(--color--primary-contrast);
    border: none;
    border-radius: 10px;
    padding: 11px 28px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 8px;
    transition: opacity 0.15s;
  }
  .btn-primario:hover { opacity: .88; }

  /* ── Header ficha ──────────────────────────────────────────────── */
  .ficha-header-band {
    background: var(--gradient--glass);
    border: 1px solid var(--color--border);
    border-radius: 30px;
    margin-bottom: 28px;
    padding: 0;
    box-shadow: var(--sombra--suave);
  }
  .ficha-header-inner { padding: 22px 24px 24px; }
  .ficha-badges { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .badge-nivel {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 100px;
    text-transform: uppercase;
    letter-spacing: .06em;
  }
  .badge-categoria {
    font-size: 12px;
    color: var(--color--text-muted);
    background: var(--color--surface-2);
    border: 1px solid var(--color--border);
    border-radius: 100px;
    padding: 2px 10px;
  }
  .ficha-titulo {
    font-size: 26px;
    font-weight: 800;
    margin: 0 0 8px;
  }
  .ficha-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 14px;
    color: var(--color--text-muted);
  }

  /* ── Body ──────────────────────────────────────────────────────── */
  .ficha-body { display: flex; flex-direction: column; gap: 20px; }

  /* ── Bloques ───────────────────────────────────────────────────── */
  .bloque {
    background: var(--gradient--glass);
    border: 1px solid var(--color--border);
    border-radius: 22px;
    padding: 22px 24px;
    box-shadow: var(--sombra--suave);
    content-visibility: auto;
    contain-intrinsic-size: 1px 360px;
  }
  .bloque-titulo {
    font-size: 15px;
    font-weight: 700;
    margin: 0 0 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color--border);
    color: var(--color--primary);
  }

  /* ── Campos ────────────────────────────────────────────────────── */
  .campo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px 20px;
  }

  .campo { display: flex; flex-direction: column; gap: 3px; }
  .campo-ancho { grid-column: 1 / -1; }
  .campo-critico {
    background: rgba(var(--color--primary-rgb), 0.05);
    border: 1px solid var(--color--border);
    border-radius: 16px;
    padding: 12px 14px;
  }

  .campo-lbl {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--color--text-muted);
  }
  .campo-val {
    font-size: 14px;
    font-weight: 500;
    color: var(--color--text);
  }
  .campo-val-grande {
    font-size: 22px;
    font-weight: 800;
    color: var(--color--text);
  }

  .mini-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
  }

  .enlace-externo {
    color: var(--color--primary);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
  }
  .enlace-externo:hover { text-decoration: underline; }

  /* ── Narrativa ─────────────────────────────────────────────────── */
  .narrativa-box { display: flex; flex-direction: column; gap: 18px; }
  .narrativa-lbl { font-size: 13px; font-weight: 700; color: var(--color--text-muted); margin: 0 0 6px; }
  .narrativa-texto {
    font-size: 15px;
    line-height: 1.65;
    color: var(--color--text);
    white-space: pre-wrap;
    margin: 0;
  }

  @media (max-width: 600px) {
    .campo-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
    .ficha-titulo { font-size: 20px; }
    .ficha-header-inner { padding: 18px; }
  }
</style>
