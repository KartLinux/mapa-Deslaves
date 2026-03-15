<script lang="ts">
  let nombre = "";
  let correo = "";
  let asunto = "";
  let mensaje = "";
  let enviado = false;
  let errorCorreo = false;

  function validarCorreo(v: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    errorCorreo = correo !== "" && !validarCorreo(correo);
    if (!nombre || !correo || !asunto || !mensaje || errorCorreo) return;

    const para = encodeURIComponent("info@gestionderiesgos.gob.ec");
    const asuntoEnc = encodeURIComponent(`[Geoportal] ${asunto}`);
    const cuerpo = encodeURIComponent(`Nombre: ${nombre}\nCorreo: ${correo}\n\n${mensaje}`);
    window.location.href = `mailto:${para}?subject=${asuntoEnc}&body=${cuerpo}`;
    enviado = true;
  }

  function reset() {
    nombre = "";
    correo = "";
    asunto = "";
    mensaje = "";
    enviado = false;
    errorCorreo = false;
  }
</script>

<div class="page">
  <section class="hero contenedor">
    <div class="hero-card">
      <span class="eyebrow">Mesa tecnica</span>
      <h1>Contacto institucional del geoportal</h1>
      <p>
        Canal para consultas sobre datos, reportes, mejora de visualizacion y
        solicitudes vinculadas a la plataforma geoespacial.
      </p>
    </div>
  </section>

  <section class="contenedor layout">
    <aside class="aside">
      <article class="panel">
        <span class="eyebrow">Institucion</span>
        <h2>Secretaria de Gestion de Riesgos</h2>
        <p>Atencion institucional para el geoportal nacional y sus fuentes de datos.</p>
      </article>

      <article class="panel compact">
        <strong>Sede central</strong>
        <span>Av. Juan Tanca Marengo, Guayaquil, Ecuador</span>
      </article>

      <article class="panel compact">
        <strong>Portal institucional</strong>
        <a href="https://www.gestionderiesgos.gob.ec" target="_blank" rel="noopener noreferrer">
          www.gestionderiesgos.gob.ec
        </a>
      </article>

      <article class="panel compact">
        <strong>Canal recomendado</strong>
        <span>Usa el formulario para dejar el correo prellenado con contexto tecnico.</span>
      </article>
    </aside>

    <div class="form-wrap">
      {#if enviado}
        <div class="panel sent">
          <span class="eyebrow">Mensaje preparado</span>
          <h2>Tu cliente de correo se abrira para completar el envio</h2>
          <p>Si deseas enviar otra consulta, puedes reiniciar el formulario.</p>
          <button class="btn-secondary" onclick={reset}>Enviar otro mensaje</button>
        </div>
      {:else}
        <form class="panel form" onsubmit={handleSubmit} novalidate>
          <div class="form-head">
            <span class="eyebrow">Formulario</span>
            <h2>Enviar consulta</h2>
          </div>

          <label class="field">
            <span>Nombre completo</span>
            <input bind:value={nombre} type="text" placeholder="Tu nombre" required />
          </label>

          <label class="field">
            <span>Correo electronico</span>
            <input
              bind:value={correo}
              type="email"
              placeholder="tu@correo.com"
              required
              class:error={errorCorreo}
            />
            {#if errorCorreo}
              <small>Ingresa un correo valido.</small>
            {/if}
          </label>

          <label class="field">
            <span>Asunto</span>
            <select bind:value={asunto} required>
              <option value="">Selecciona un motivo</option>
              <option value="Consulta sobre el Geoportal">Consulta sobre el Geoportal</option>
              <option value="Reporte de error en datos">Reporte de error en datos</option>
              <option value="Solicitud de informacion">Solicitud de informacion</option>
              <option value="Colaboracion institucional">Colaboracion institucional</option>
              <option value="Otro">Otro</option>
            </select>
          </label>

          <label class="field">
            <span>Mensaje</span>
            <textarea bind:value={mensaje} rows="6" maxlength="1000" placeholder="Describe tu consulta"></textarea>
            <small class="counter">{mensaje.length}/1000</small>
          </label>

          <button class="btn-primary" type="submit" disabled={!nombre || !correo || !asunto || !mensaje}>
            Preparar mensaje
          </button>
        </form>
      {/if}
    </div>
  </section>
</div>

<style>
  .page {
    padding-bottom: 34px;
  }

  .hero,
  .layout {
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
    line-height: 1.02;
  }

  .hero-card h1 {
    font-size: clamp(30px, 4vw, 46px);
  }

  .hero-card p,
  .panel p,
  .panel span,
  .panel a {
    color: var(--color--text-muted);
    line-height: 1.7;
  }

  .layout {
    display: grid;
    grid-template-columns: 0.85fr 1.15fr;
    gap: 18px;
  }

  .aside {
    display: grid;
    gap: 14px;
    align-self: start;
  }

  .panel {
    padding: 24px;
    content-visibility: auto;
    contain-intrinsic-size: 1px 240px;
  }

  .compact {
    gap: 6px;
  }

  .compact strong {
    margin-bottom: 6px;
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color--text-soft);
  }

  .compact a {
    color: var(--color--primary);
    font-weight: 700;
    text-decoration: none;
  }

  .form {
    display: grid;
    gap: 16px;
  }

  .form-head h2 {
    font-size: 30px;
  }

  .field {
    display: grid;
    gap: 7px;
  }

  .field span {
    color: var(--color--text);
    font-size: 13px;
    font-weight: 700;
  }

  .field input,
  .field select,
  .field textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid var(--color--border);
    border-radius: 16px;
    background: rgba(var(--color--primary-rgb), 0.04);
    color: var(--color--text);
    outline: none;
  }

  .field input:focus,
  .field select:focus,
  .field textarea:focus {
    border-color: rgba(var(--color--primary-rgb), 0.42);
    box-shadow: 0 0 0 4px rgba(var(--color--primary-rgb), 0.1);
  }

  .field input.error {
    border-color: var(--color--danger);
  }

  .field small {
    color: var(--color--danger);
  }

  .counter {
    text-align: right;
    color: var(--color--text-soft) !important;
  }

  .btn-primary,
  .btn-secondary {
    min-height: 48px;
    padding: 0 18px;
    border-radius: 999px;
    font-weight: 800;
    cursor: pointer;
  }

  .btn-primary {
    border: none;
    background: var(--color--primary);
    color: var(--color--primary-contrast);
  }

  .btn-primary:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .btn-secondary {
    width: fit-content;
    border: 1px solid var(--color--border);
    background: rgba(var(--color--primary-rgb), 0.06);
    color: var(--color--text);
  }

  .sent {
    display: grid;
    gap: 8px;
  }

  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
</style>
