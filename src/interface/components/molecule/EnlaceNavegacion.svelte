<!-- src/interface/componentes/moleculas/EnlaceNavegacion.svelte -->
<script lang="ts">
  export let href: string;
  export let texto: string;

  // ruta actual (simple)
  export let rutaActual: string = "/";
  export let coincideConSubrutas = true;

  $: activo =
    coincideConSubrutas
      ? (rutaActual === href || rutaActual.startsWith(href + "/"))
      : (rutaActual === href);
</script>

<a href={href} class:active={activo}>
  {texto}
</a>

<style>
  a {
    text-decoration: none;
    transition: all 0.2s ease;
    color: var(--color--text);
    font-weight: 400;
    padding: 6px 10px;
    border-radius: 8px;
  }

  a:hover {
    color: var(--color--primary);
    filter: drop-shadow(0px 0px 3px var(--color--primary));
    background: rgba(var(--color--primary-rgb), 0.08);
  }

  a.active {
    font-weight: 800;
    background: rgba(var(--color--primary-rgb), 0.14);
    color: var(--color--primary);
  }
</style>
