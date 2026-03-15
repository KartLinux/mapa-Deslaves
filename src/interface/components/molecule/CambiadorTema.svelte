<script lang="ts">
  type ThemeMode = "light" | "dark";

  const ATTR = "data-theme";
  const STORAGE_KEY = "tema";

  function getFromDom(): ThemeMode {
    return document.documentElement.getAttribute(ATTR) === "dark" ? "dark" : "light";
  }

  function setToDom(mode: ThemeMode) {
    document.documentElement.setAttribute(ATTR, mode);
  }

  function getFromStorage(): ThemeMode | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "light" || raw === "dark" ? raw : null;
  }

  function saveToStorage(mode: ThemeMode) {
    localStorage.setItem(STORAGE_KEY, mode);
  }

  let modo: ThemeMode = "light";

  if (typeof window !== "undefined") {
    modo = getFromStorage() ?? getFromDom();
    setToDom(modo);
  }

  $: etiqueta = modo === "light" ? "Modo claro" : "Modo oscuro";
  $: accion = modo === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro";

  function toggle() {
    modo = modo === "light" ? "dark" : "light";
    setToDom(modo);
    saveToStorage(modo);
  }
</script>

<button class="tema" type="button" onclick={toggle} aria-label={accion} title={accion}>
  <span class="tema-icono" aria-hidden="true">
    {#if modo === "light"}
      <svg viewBox="0 0 24 24" role="presentation">
        <circle cx="12" cy="12" r="4.25"></circle>
        <path
          d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12h-2.5M18.54 5.46l-1.77 1.77M7.23 16.77l-1.77 1.77M18.54 18.54l-1.77-1.77M7.23 7.23 5.46 5.46"
        ></path>
      </svg>
    {:else}
      <svg viewBox="0 0 24 24" role="presentation">
        <path
          d="M20.4 14.1A8.5 8.5 0 0 1 9.9 3.6a8.75 8.75 0 1 0 10.5 10.5Z"
        ></path>
      </svg>
    {/if}
  </span>
  <span>{etiqueta}</span>
</button>

<style>
  .tema {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    height: 44px;
    padding: 0 14px;
    border: 1px solid var(--color--border);
    border-radius: 999px;
    background: var(--gradient--glass);
    color: var(--color--text);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .tema:hover {
    border-color: rgba(var(--color--primary-rgb), 0.25);
    box-shadow: var(--sombra--suave);
    transform: translateY(-1px);
  }

  .tema-icono {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 999px;
    background: rgba(var(--color--primary-rgb), 0.1);
    color: var(--color--primary);
    font-size: 11px;
    text-transform: uppercase;
  }

  .tema-icono svg {
    width: 15px;
    height: 15px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.9;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .tema-icono svg circle {
    fill: currentColor;
    stroke: none;
  }

  @media (max-width: 640px) {
    .tema span:last-child {
      display: none;
    }

    .tema {
      width: 44px;
      padding: 0;
      justify-content: center;
    }
  }
</style>
