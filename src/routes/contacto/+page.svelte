<script lang="ts">
  let name = '', email = '', subject = '', message = '', sent = false;
  function submit(e: Event) {
    e.preventDefault();
    sent = true;
  }
</script>

<svelte:head>
  <title>Contacto - SNGR Ecuador</title>
</svelte:head>

<div class="page-container">
  <h1>📬 Contacto</h1>

  <div class="contact-grid">
    <div class="form-side">
      {#if sent}
        <div class="success card">
          ✅ Mensaje enviado. Gracias por contactarnos.
        </div>
      {:else}
        <form class="card" on:submit={submit}>
          <h2>Envíanos un mensaje</h2>
          <div class="field">
            <label for="name">Nombre</label>
            <input id="name" type="text" bind:value={name} required placeholder="Tu nombre" />
          </div>
          <div class="field">
            <label for="email">Correo electrónico</label>
            <input id="email" type="email" bind:value={email} required placeholder="tu@email.com" />
          </div>
          <div class="field">
            <label for="subject">Asunto</label>
            <input id="subject" type="text" bind:value={subject} required placeholder="Asunto del mensaje" />
          </div>
          <div class="field">
            <label for="message">Mensaje</label>
            <textarea id="message" bind:value={message} required rows="5" placeholder="Tu mensaje..."></textarea>
          </div>
          <button type="submit" class="submit-btn">Enviar Mensaje</button>
        </form>
      {/if}
    </div>

    <div class="info-side">
      <div class="card">
        <h3>Información de Contacto</h3>
        <p>📍 Quito, Ecuador</p>
        <p>🏢 Servicio Nacional de Gestión de Riesgos y Emergencias</p>
        <p>🌐 <a href="https://www.gestionderiesgos.gob.ec" target="_blank" rel="noopener">www.gestionderiesgos.gob.ec</a></p>
      </div>
    </div>
  </div>
</div>

<style>
h1 { margin-bottom: 24px; }
.contact-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; }
h2 { margin-bottom: 20px; font-size: 1.1rem; }
h3 { margin-bottom: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
label { font-size: 0.85rem; font-weight: 600; color: var(--color--text-muted); }
input, textarea {
  background: var(--color--surface-2); color: var(--color--text);
  border: 1px solid var(--color--border); border-radius: 8px;
  padding: 10px 12px; font-size: 0.95rem; font-family: inherit;
}
input:focus, textarea:focus { outline: 2px solid var(--color--primary); }
.submit-btn {
  background: var(--color--primary); color: var(--color--primary-contrast);
  border: none; border-radius: 10px; padding: 12px 24px;
  font-size: 1rem; font-weight: 700; cursor: pointer; width: 100%;
  transition: opacity 0.15s;
}
.submit-btn:hover { opacity: 0.88; }
.success { padding: 20px; color: #10b981; font-weight: 600; }
.info-side p { margin-bottom: 8px; }
a { color: var(--color--primary); }
@media (max-width: 700px) {
  .contact-grid { grid-template-columns: 1fr; }
}
</style>
