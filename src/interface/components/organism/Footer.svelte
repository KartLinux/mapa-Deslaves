<script lang="ts">
  import { navegar } from "../../router/enrutador";

  const ano = new Date().getFullYear();
  const links = [
    { href: "/mapa", texto: "Geoportal" },
    { href: "/dashboard", texto: "Dashboard" },
    { href: "/sobre-nosotros", texto: "Metodologia" },
    { href: "/contacto", texto: "Contacto" },
  ];

  function ir(e: MouseEvent, href: string) {
    e.preventDefault();
    navegar(href);
  }
</script>

<footer class="footer">
  <div class="contenedor footer-shell">
    <div class="footer-brand">
      <span class="footer-kicker">Plataforma institucional</span>
      <h3>Geoportal Nacional de Riesgos</h3>
      <p>
        Visualizacion cartografica, analitica territorial y consulta historica de
        eventos adversos para la toma de decisiones.
      </p>
    </div>

    <nav class="footer-nav" aria-label="Navegacion del pie">
      {#each links as link}
        <a href={link.href} onclick={(e) => ir(e, link.href)}>{link.texto}</a>
      {/each}
    </nav>

    <div class="footer-metrics">
      <div>
        <strong>Fuente</strong>
        <span>Base_Eventos_Limpia.csv</span>
      </div>
      <div>
        <strong>Referencia</strong>
        <span>Coordenadas WGS84</span>
      </div>
      <div>
        <strong>Institucion</strong>
        <span>SGR Ecuador</span>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© {ano} Secretaria de Gestion de Riesgos</span>
      <span>Geoportal preparado para consulta publica y analisis territorial</span>
    </div>
  </div>
</footer>

<style>
  .footer {
    margin-top: auto;
    padding: 20px 0 28px;
  }

  .footer-shell {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr 1fr;
    gap: 20px;
    padding: 26px;
    border: 1px solid var(--color--border);
    border-radius: 28px;
    background: var(--gradient--glass);
    box-shadow: var(--sombra--suave);
  }

  .footer-kicker {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color--primary);
  }

  .footer-brand h3 {
    margin: 8px 0 10px;
    font-size: 24px;
    line-height: 1.05;
  }

  .footer-brand p {
    max-width: 34ch;
    margin: 0;
    color: var(--color--text-muted);
    line-height: 1.7;
  }

  .footer-nav {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-self: start;
  }

  .footer-nav a {
    display: inline-flex;
    width: fit-content;
    padding: 8px 12px;
    border-radius: 999px;
    color: var(--color--text-muted);
    font-weight: 700;
    text-decoration: none;
  }

  .footer-nav a:hover {
    background: rgba(var(--color--primary-rgb), 0.08);
    color: var(--color--primary);
  }

  .footer-metrics {
    display: grid;
    gap: 10px;
    align-self: start;
  }

  .footer-metrics div {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 14px;
    border: 1px solid var(--color--border);
    border-radius: 18px;
    background: rgba(var(--color--primary-rgb), 0.04);
  }

  .footer-metrics strong {
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color--text-soft);
  }

  .footer-metrics span {
    font-size: 14px;
    font-weight: 700;
  }

  .footer-bottom {
    display: flex;
    justify-content: space-between;
    grid-column: 1 / -1;
    padding-top: 8px;
    border-top: 1px solid var(--color--border);
    font-size: 12px;
    color: var(--color--text-soft);
  }

  @media (max-width: 900px) {
    .footer-shell {
      grid-template-columns: 1fr;
    }

    .footer-bottom {
      flex-direction: column;
      gap: 6px;
    }
  }
</style>
