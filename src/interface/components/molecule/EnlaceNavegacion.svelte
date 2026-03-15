<script lang="ts">
  export let href: string;
  export let texto: string;
  export let rutaActual = "/";
  export let coincideConSubrutas = true;

  $: activo = coincideConSubrutas
    ? rutaActual === href || rutaActual.startsWith(`${href}/`)
    : rutaActual === href;
</script>

<a href={href} class:active={activo}>
  <span>{texto}</span>
</a>

<style>
  a {
    position: relative;
    display: inline-flex;
    align-items: center;
    min-height: 40px;
    padding: 0 12px;
    border: 1px solid transparent;
    border-radius: 999px;
    color: var(--color--text-muted);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-decoration: none;
  }

  a:hover {
    color: var(--color--text);
    border-color: rgba(var(--color--primary-rgb), 0.14);
    background: rgba(var(--color--primary-rgb), 0.08);
  }

  a.active {
    color: var(--color--primary);
    border-color: rgba(var(--color--primary-rgb), 0.18);
    background: rgba(var(--color--primary-rgb), 0.12);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
</style>
