<!-- src/interface/componentes/organismos/Cabecera.svelte -->
<script lang="ts">
  import Logo from "../atom/Logo.svelte";
  import EnlaceNavegacion from "../molecule/EnlaceNavegacion.svelte";
  import CambiadorTema from "../molecule/CambiadorTema.svelte";
  import { navegar as irA } from "../../router/enrutador";
  import EfectoDeslizamiento from "../molecule/EfectoDeslizamiento.svelte";

  export let mostrarFondo = false;

  let menuAbierto = false;
  let rutaActual = "/";

  // Rutas del header
  const enlaces = [
    { href: "/", texto: "Inicio" },
    { href: "/mapa", texto: "Mapa" },
    { href: "/admin", texto: "Administración" },
    { href: "/acerca", texto: "Acerca de" },
  ];

  function sincronizarRuta() {
    rutaActual = window.location.pathname || "/";
  }

  function alternarMenu() {
    menuAbierto = !menuAbierto;
  }

  function cerrarMenu() {
    menuAbierto = false;
  }

  // Navegación SPA simple
  function navegar(e: MouseEvent, href: string) {
    e.preventDefault();
    irA(href);
    cerrarMenu();
    sincronizarRuta();
  }

  // Inicializa ruta y escucha cambios del historial
  if (typeof window !== "undefined") {
    sincronizarRuta();
    window.addEventListener("popstate", sincronizarRuta);
  }
</script>

<header class:con-fondo={mostrarFondo}>
  <nav class="contenedor barra">
    <a
      href="/"
      class="logo"
      aria-label="Inicio"
      on:click={(e) => navegar(e, "/")}
    >
      <Logo texto="Desicion Support System" />
    </a>

    <!-- Menú escritorio -->
    <div class="menu-escritorio">
      <div class="enlaces">
        {#each enlaces as item (item.href)}
          <EnlaceNavegacion href={item.href} texto={item.texto} {rutaActual} />
        {/each}
      </div>

      <CambiadorTema />
    </div>

    <!-- Botón hamburguesa (móvil) -->
    <button
      class="hamburguesa"
      class:abierto={menuAbierto}
      type="button"
      on:click={alternarMenu}
      aria-label="Menú"
    >
      {#if !menuAbierto}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 12H21M3 6H21M3 18H21"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      {:else}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      {/if}
    </button>
  </nav>

  <!-- Menú móvil -->
  <div class="menu-movil" class:abierto={menuAbierto}>
    {#each enlaces as item (item.href)}
      <a
        href={item.href}
        class:active={rutaActual === item.href ||
          rutaActual.startsWith(item.href + "/")}
        on:click={(e) => navegar(e, item.href)}
      >
        {item.texto}
      </a>
    {/each}

    <div class="acciones-movil">
      <CambiadorTema />
    </div>
  </div>
    <EfectoDeslizamiento alto={28} piezas={100} />
</header>

<style>
  /* =========================================================
     Cabecera (Organismo)
     - Usa tokens globales: --color--*
     - Usa layout global: .contenedor
     ========================================================= */

  header {
    position: relative;
    padding: 28px 0;
    background: transparent;
  }

  header.con-fondo {
    background: linear-gradient(
      60deg,
      var(--color--waves-start) 0%,
      var(--color--waves-end) 100%
    );
  }

  .barra {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .logo {
    height: 44px;
    display: flex;
    align-items: center;

    text-decoration: none;
    color: var(--color--text);
    cursor: pointer;

    z-index: 1001;
  }

  /* ======================
     Menú escritorio
     ====================== */

  .menu-escritorio {
    display: flex;
    align-items: center;
    gap: 18px;
    flex: 1;
    justify-content: flex-end;
  }

  .enlaces {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }

  /* ======================
     Botón hamburguesa
     ====================== */

  .hamburguesa {
    display: none;
    align-items: center;
    justify-content: center;

    width: 42px;
    height: 42px;

    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    padding: 0;

    border-radius: var(--radio--m);
    transition:
      background 0.2s ease,
      transform 0.12s ease;

    z-index: 1001;
  }

  .hamburguesa svg {
    width: 24px;
    height: 24px;
    color: var(--color--text);
    transition:
      transform 0.2s ease,
      color 0.2s ease;
  }

  .hamburguesa:hover {
    background: rgba(var(--color--primary-rgb), 0.12);
    border-color: rgba(var(--color--primary-rgb), 0.18);
  }

  .hamburguesa:hover svg {
    color: var(--color--primary);
    transform: scale(1.05);
  }

  .hamburguesa:active {
    transform: scale(0.97);
  }

  /* ======================
     Menú móvil
     ====================== */

  .menu-movil {
    display: none;
    position: fixed;

    top: 84px;
    left: 0;
    right: 0;
    bottom: 0;

    width: 100%;
    height: calc(100vh - 84px);

    background: var(--color--surface);
    border-top: 1px solid var(--color--border);
    box-shadow: var(--sombra--media);

    padding: 1.6rem;
    flex-direction: column;
    gap: 0.9rem;

    transform: translateY(-100%);
    opacity: 0;
    transition:
      transform 0.25s ease,
      opacity 0.25s ease;

    z-index: 1000;
    overflow-y: auto;
  }

  .menu-movil.abierto {
    transform: translateY(0);
    opacity: 1;
  }

  .menu-movil a {
    text-decoration: none;
    color: var(--color--text);

    font-size: 1.12rem;
    font-weight: var(--tipografia--peso-medio);

    padding: 0.85rem 1rem;
    border-radius: var(--radio--m);

    transition:
      background 0.2s ease,
      color 0.2s ease;
  }

  .menu-movil a:hover {
    background: rgba(var(--color--primary-rgb), 0.1);
    color: var(--color--primary);
  }

  .menu-movil a.active {
    font-weight: var(--tipografia--peso-fuerte);
    background: rgba(var(--color--primary-rgb), 0.16);
    color: var(--color--primary);
  }

  .acciones-movil {
    display: flex;
    gap: 1rem;
    padding: 1rem;

    border-top: 1px solid rgba(var(--color--text-rgb), 0.1);
    margin-top: 0.8rem;

    justify-content: center;
    align-items: center;
  }

  /* ======================
     Responsive
     ====================== */

  @media (max-width: 700px) {
    .menu-escritorio {
      display: none;
    }

    .hamburguesa {
      display: flex;
    }

    .menu-movil {
      display: flex;
    }
  }
</style>
