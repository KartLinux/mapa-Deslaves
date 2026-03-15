<script lang="ts">
  import Cabecera from "../../components/organism/Cabecera.svelte";
  import Footer from "../../components/organism/Footer.svelte";
  import { navegar, rutaActual, iniciarRouter } from "../../router/enrutador";

  import PaginaMapa from "../ui-mapa/Map.svelte";
  import PaginaFichaEvento from "../FichaEvento/PaginaFichaEvento.svelte";
  import PaginaSobreNosotros from "../SobreNosotros/PaginaSobreNosotros.svelte";
  import PaginaContacto from "../Contacto/PaginaContacto.svelte";

  iniciarRouter();

  type RouteEntry = {
    component?: any;
    load?: () => Promise<{ default: any }>;
  };

  // El dashboard se carga diferido para reducir JS inicial.
  const rutas: Record<string, RouteEntry> = {
    "/mapa": { component: PaginaMapa },
    "/dashboard": { load: () => import("../Dashboard/PaginaDashboard.svelte") },
    "/ficha": { component: PaginaFichaEvento },
    "/sobre-nosotros": { component: PaginaSobreNosotros },
    "/contacto": { component: PaginaContacto },
  };

  const sinFooter = new Set(["/", "/mapa", "/ficha"]);

  let pagina: any = PaginaMapa;
  let cargandoPagina = false;
  let routeLoadToken = 0;

  async function resolverRuta(path: string) {
    if (path === "/") {
      pagina = PaginaMapa;
      cargandoPagina = false;
      navegar("/mapa");
      return;
    }

    routeLoadToken += 1;
    const token = routeLoadToken;
    const route = rutas[path] ?? { component: PaginaMapa };

    if (route.component) {
      pagina = route.component;
      cargandoPagina = false;
      return;
    }

    if (route.load) {
      cargandoPagina = true;
      try {
        const mod = await route.load();
        if (token !== routeLoadToken) return;
        pagina = mod.default;
      } catch {
        if (token !== routeLoadToken) return;
        pagina = PaginaMapa;
      } finally {
        if (token === routeLoadToken) cargandoPagina = false;
      }
    }
  }

  $: void resolverRuta($rutaActual);
  $: mostrarFooter = !sinFooter.has($rutaActual);
  $: headerConFondo = false;
</script>

<div class="pagina">
  <Cabecera mostrarFondo={headerConFondo} />
  <main class="contenido" class:contenido-mapa={$rutaActual === "/mapa"}>
    {#if cargandoPagina}
      <div class="cargando-ruta">Cargando modulo...</div>
    {:else}
      <svelte:component this={pagina} />
    {/if}
  </main>
  {#if mostrarFooter}
    <Footer />
  {/if}
</div>

<style>
  .contenido.contenido-mapa {
    min-height: calc(100dvh - 94px);
    height: calc(100dvh - 94px);
    overflow: hidden;
  }

  .cargando-ruta {
    display: grid;
    place-items: center;
    min-height: 44vh;
    color: var(--color--text-muted);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  @media (max-width: 980px) {
    .contenido.contenido-mapa {
      min-height: calc(100dvh - 84px);
      height: calc(100dvh - 84px);
    }
  }
</style>
