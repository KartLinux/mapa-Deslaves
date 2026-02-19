<script lang="ts">
  import Cabecera from "../../components/organism/Cabecera.svelte";
  import { rutaActual, iniciarRouter } from "../../router/enrutador";

  import PaginaInicio from "../Inicio/PaginaInicio.svelte";
  import PaginaMapa from "../ui-mapa/Map.svelte";
  // import PaginaAdmin from "../Admin/PaginaAdmin.svelte";
  // import PaginaAcerca from "../Acerca/PaginaAcerca.svelte";

  iniciarRouter();

  // Mapa de rutas -> componente
  const rutas: Record<string, any> = {
    "/": PaginaInicio,
    "/mapa": PaginaMapa,
    // "/admin": PaginaAdmin,
    // "/acerca": PaginaAcerca,
  };

  // Componente actual según ruta (fallback a Inicio)
  $: pagina = rutas[$rutaActual] ?? PaginaInicio;
</script>

<div class="pagina">
  <Cabecera />
  <main class="contenido">
    <svelte:component this={pagina} />
  </main>
</div>
