<script lang="ts">
  import { navegar } from "../../router/enrutador";
</script>

<div class="page">
  <section class="hero contenedor">
    <div class="hero-card">
      <span class="eyebrow">Metodologia del geoportal</span>
      <h1>Como se organiza, interpreta y presenta la informacion de riesgo</h1>
      <p>
        Esta plataforma concentra reportes tecnicos de eventos adversos y los
        traduce en una experiencia de consulta cartografica y analitica mas clara.
      </p>
    </div>
  </section>

  <section class="contenedor sections">
    <article class="panel">
      <span class="eyebrow">Proposito</span>
      <h2>Que resuelve el geoportal</h2>
      <p>
        Centraliza registros historicos, facilita la lectura territorial del impacto
        y ayuda a equipos tecnicos, investigadores y autoridades a revisar patrones,
        severidad y distribucion espacial.
      </p>
    </article>

    <article class="panel">
      <span class="eyebrow">Fuente</span>
      <h2>Origen y alcance del dato</h2>
      <ul>
        <li>Base historica de eventos adversos levantada por la SGR.</li>
        <li>Cobertura territorial del Ecuador continental e insular.</li>
        <li>Unidad de registro por evento y area afectada reportada.</li>
        <li>Limpieza y normalizacion para visualizacion cartografica y dashboard.</li>
      </ul>
    </article>

    <article class="panel">
      <span class="eyebrow">Clasificacion</span>
      <h2>Niveles de peligrosidad</h2>
      <div class="levels">
        <div><span class="dot n1"></span><strong>Nivel 1</strong><p>Impacto local con respuesta principalmente territorial.</p></div>
        <div><span class="dot n2"></span><strong>Nivel 2</strong><p>Impacto moderado con articulacion interinstitucional.</p></div>
        <div><span class="dot n3"></span><strong>Nivel 3</strong><p>Impacto alto con necesidad de coordinacion ampliada.</p></div>
      </div>
    </article>

    <article class="panel">
      <span class="eyebrow">Tecnologia</span>
      <h2>Arquitectura de la experiencia</h2>
      <div class="tech-grid">
        <div><strong>Svelte 5</strong><span>Interfaz reactiva</span></div>
        <div><strong>Leaflet</strong><span>Cartografia interactiva</span></div>
        <div><strong>TypeScript</strong><span>Tipado y mantenimiento</span></div>
        <div><strong>Vite</strong><span>Build rapido y liviano</span></div>
      </div>
    </article>

    <div class="cta-row">
      <button class="cta" onclick={() => navegar("/mapa")}>Abrir geoportal</button>
      <button class="cta alt" onclick={() => navegar("/dashboard")}>Ir al dashboard</button>
      <button class="cta alt" onclick={() => navegar("/contacto")}>Contactar al equipo</button>
    </div>
  </section>
</div>

<style>
  .page {
    padding-bottom: 34px;
  }

  .hero,
  .sections {
    padding-top: 16px;
  }

  .hero-card,
  .panel {
    border: 1px solid var(--color--border);
    border-radius: 28px;
    background: var(--gradient--glass);
    box-shadow: var(--sombra--suave);
    backdrop-filter: blur(12px);
  }

  .hero-card {
    padding: 30px;
  }

  .eyebrow {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color--primary);
  }

  .hero-card h1,
  .panel h2 {
    margin: 10px 0 8px;
    line-height: 1.04;
  }

  .hero-card h1 {
    font-size: clamp(30px, 4.6vw, 52px);
    max-width: 15ch;
  }

  .hero-card p,
  .panel p,
  li,
  .tech-grid span {
    color: var(--color--text-muted);
    line-height: 1.75;
  }

  .sections {
    display: grid;
    gap: 16px;
  }

  .panel {
    padding: 24px;
    content-visibility: auto;
    contain-intrinsic-size: 1px 260px;
  }

  .panel ul {
    margin: 0;
    padding-left: 20px;
  }

  .levels {
    display: grid;
    gap: 12px;
  }

  .levels div {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 10px;
    align-items: start;
    padding: 14px;
    border: 1px solid var(--color--border);
    border-radius: 20px;
    background: rgba(var(--color--primary-rgb), 0.04);
  }

  .levels p {
    margin: 0;
  }

  .dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-top: 5px;
  }

  .n1 { background: #22c55e; }
  .n2 { background: #f59e0b; }
  .n3 { background: #ef4444; }

  .tech-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .tech-grid div {
    padding: 16px;
    border: 1px solid var(--color--border);
    border-radius: 20px;
    background: rgba(var(--color--primary-rgb), 0.04);
  }

  .tech-grid strong {
    display: block;
    margin-bottom: 6px;
  }

  .cta-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .cta {
    min-height: 48px;
    padding: 0 18px;
    border: none;
    border-radius: 999px;
    background: var(--color--primary);
    color: var(--color--primary-contrast);
    font-weight: 800;
    cursor: pointer;
  }

  .cta.alt {
    border: 1px solid var(--color--border);
    background: rgba(var(--color--primary-rgb), 0.08);
    color: var(--color--text);
  }

  @media (max-width: 820px) {
    .tech-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .levels div {
      grid-template-columns: auto 1fr;
    }
  }
</style>
