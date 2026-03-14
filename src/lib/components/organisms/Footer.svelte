<footer class="footer">
  <div class="container">
    <div class="col">
      <h3>🛡️ SNGR Ecuador</h3>
      <p>Servicio Nacional de Gestión de Riesgos y Emergencias. Sistema de información geoespacial para el seguimiento de eventos adversos en Ecuador.</p>
    </div>
    <div class="col">
      <h4>Acceso Rápido</h4>
      <nav>
        <a href="/">Inicio</a>
        <a href="/geoportal">Geoportal</a>
        <a href="/dashboard">Dashboard</a>
        <a href="/nosotros">Nosotros</a>
        <a href="/contacto">Contacto</a>
      </nav>
    </div>
  </div>
  <div class="bottom">
    <span>© {new Date().getFullYear()} SNGR Ecuador — Geoportal Nacional de Eventos Adversos</span>
  </div>
</footer>

<style>
.footer {
  background: #0f172a; color: #e9eef6;
  padding: 40px 0 0 0; margin-top: auto;
}
.container {
  width: min(1200px, calc(100% - 32px)); margin: 0 auto;
  display: grid; grid-template-columns: 2fr 1fr; gap: 32px;
  padding-bottom: 32px;
}
h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 12px; color: #fff; }
h4 { font-size: 0.95rem; font-weight: 700; margin-bottom: 12px; color: #cbd5e1; }
p { font-size: 0.88rem; color: #94a3b8; line-height: 1.6; margin: 0; }
nav { display: flex; flex-direction: column; gap: 8px; }
nav a { font-size: 0.88rem; color: #94a3b8; text-decoration: none; }
nav a:hover { color: #6aa9ff; }
.bottom {
  border-top: 1px solid rgba(255,255,255,0.08); padding: 16px;
  text-align: center; font-size: 0.82rem; color: #64748b;
}
@media (max-width: 600px) {
  .container { grid-template-columns: 1fr; }
}
</style>
