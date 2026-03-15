<script lang="ts">
  import Logo from "../atom/Logo.svelte";
  import EnlaceNavegacion from "../molecule/EnlaceNavegacion.svelte";
  import CambiadorTema from "../molecule/CambiadorTema.svelte";
  import { navegar as irA } from "../../router/enrutador";

  export let mostrarFondo = false;

  let menuAbierto = false;
  let rutaActual = "/mapa";

  const enlaces = [
    { href: "/mapa", texto: "Geoportal" },
    { href: "/dashboard", texto: "Dashboard" },
    { href: "/sobre-nosotros", texto: "Metodologia" },
    { href: "/contacto", texto: "Contacto" },
  ];

  function sincronizarRuta() {
    rutaActual = window.location.pathname || "/mapa";
  }

  function cerrarMenu() {
    menuAbierto = false;
  }

  function alternarMenu() {
    menuAbierto = !menuAbierto;
  }

  function navegar(e: MouseEvent, href: string) {
    e.preventDefault();
    irA(href);
    cerrarMenu();
    sincronizarRuta();
  }

  if (typeof window !== "undefined") {
    sincronizarRuta();
    window.addEventListener("popstate", sincronizarRuta);
  }
</script>

<header>
  <div class="contenedor header-shell" class:con-fondo={mostrarFondo}>
    <div class="marca-lado">
      <a href="/mapa" class="logo" aria-label="Geoportal" onclick={(e) => navegar(e, "/mapa")}>
        <Logo texto="Eventos adversos en Ecuador" />
      </a>
    </div>

    <nav class="menu-escritorio" aria-label="Principal">
      <div class="enlaces">
        {#each enlaces as item (item.href)}
          <EnlaceNavegacion
            href={item.href}
            texto={item.texto}
            {rutaActual}
            coincideConSubrutas={item.coincideConSubrutas ?? true}
          />
        {/each}
      </div>
      <CambiadorTema />
    </nav>

    <button
      class="hamburguesa"
      class:abierto={menuAbierto}
      type="button"
      aria-label="Menu"
      onclick={alternarMenu}
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  </div>

  <div class:abierto={menuAbierto} class="menu-movil">
    <div class="menu-movil-inner contenedor">
      <div class="menu-movil-top">
        <span>Navegacion</span>
        <CambiadorTema />
      </div>

      {#each enlaces as item (item.href)}
        <a
          href={item.href}
          class:active={rutaActual === item.href || rutaActual.startsWith(`${item.href}/`)}
          onclick={(e) => navegar(e, item.href)}
        >
          {item.texto}
        </a>
      {/each}
    </div>
  </div>
</header>

<style>
  header {
    position: sticky;
    top: 0;
    z-index: 1200;
    padding: 10px 0 4px;
    background: transparent;
  }

  .header-shell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    max-width: 1040px;
    min-height: 68px;
    padding: 8px 16px;
    margin: 0 auto;
    border: 1px solid var(--color--border);
    border-radius: 22px;
    background: var(--gradient--glass);
    box-shadow: var(--sombra--suave);
    backdrop-filter: blur(8px);
  }

  .header-shell.con-fondo {
    background: rgba(var(--color--text-rgb), 0.04);
  }

  .marca-lado {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 0 1 auto;
  }

  .logo {
    display: inline-flex;
    max-width: 210px;
    color: var(--color--text);
    text-decoration: none;
  }

  .menu-escritorio {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
    min-width: 0;
  }

  .enlaces {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px;
    border: 1px solid rgba(var(--color--primary-rgb), 0.08);
    border-radius: 100px;
    background: rgba(var(--color--primary-rgb), 0.03);
    min-width: 0;
  }

  .hamburguesa {
    display: none;
    position: relative;
    width: 46px;
    height: 46px;
    padding: 0;
    border: 1px solid var(--color--border);
    border-radius: 14px;
    background: var(--gradient--glass);
    color: var(--color--text);
    cursor: pointer;
  }

  .hamburguesa span {
    position: absolute;
    left: 11px;
    right: 11px;
    height: 2px;
    border-radius: 999px;
    background: currentColor;
    transition: transform 0.2s ease, opacity 0.2s ease, top 0.2s ease;
  }

  .hamburguesa span:nth-child(1) {
    top: 15px;
  }

  .hamburguesa span:nth-child(2) {
    top: 22px;
  }

  .hamburguesa span:nth-child(3) {
    top: 29px;
  }

  .hamburguesa.abierto span:nth-child(1) {
    top: 22px;
    transform: rotate(45deg);
  }

  .hamburguesa.abierto span:nth-child(2) {
    opacity: 0;
  }

  .hamburguesa.abierto span:nth-child(3) {
    top: 22px;
    transform: rotate(-45deg);
  }

  .menu-movil {
    display: none;
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .menu-movil.abierto {
    pointer-events: auto;
    opacity: 1;
    transform: translateY(0);
  }

  .menu-movil-inner {
    margin-top: 6px;
    padding: 16px;
    border: 1px solid var(--color--border);
    border-radius: 24px;
    background: var(--gradient--glass);
    box-shadow: var(--sombra--media);
  }

  .menu-movil-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .menu-movil-top span {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color--text-soft);
  }

  .menu-movil a {
    display: block;
    margin-top: 8px;
    padding: 14px 16px;
    border: 1px solid transparent;
    border-radius: 18px;
    color: var(--color--text);
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
  }

  .menu-movil a:hover,
  .menu-movil a.active {
    border-color: rgba(var(--color--primary-rgb), 0.18);
    background: rgba(var(--color--primary-rgb), 0.1);
    color: var(--color--primary);
  }

  @media (max-width: 980px) {
    header {
      position: sticky;
    }

    .header-shell {
      max-width: none;
      padding: 8px 12px;
    }

    .menu-movil {
      display: block;
    }

    .menu-escritorio {
      display: none;
    }

    .hamburguesa {
      display: inline-flex;
      margin-left: auto;
    }
  }
</style>
