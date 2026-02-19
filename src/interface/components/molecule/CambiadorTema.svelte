<!-- src/interface/componentes/moleculas/CambiadorTema.svelte -->
<script lang="ts">
  /*
    Cambiador de tema (SIN auto):
    - Alterna entre light <-> dark
    - Guarda preferencia en localStorage
    - Aplica el tema al cargar para que NO cambie al navegar
  */

  type ThemeMode = "light" | "dark";

  const ATTR = "data-theme";
  const STORAGE_KEY = "tema";

  function getFromDom(): ThemeMode {
    const raw = document.documentElement.getAttribute(ATTR);
    return raw === "dark" ? "dark" : "light";
  }

  function setToDom(mode: ThemeMode) {
    document.documentElement.setAttribute(ATTR, mode);
  }

  function getFromStorage(): ThemeMode | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw === "dark" || raw === "light" ? raw : null;
  }

  function saveToStorage(mode: ThemeMode) {
    localStorage.setItem(STORAGE_KEY, mode);
  }

  function next(mode: ThemeMode): ThemeMode {
    return mode === "light" ? "dark" : "light";
  }

  function icon(mode: ThemeMode) {
    return mode === "light" ? "Claro" : "Oscuro";
  }

  // 1) Al cargar: usar localStorage si existe, si no, usar DOM, si no, light.
  let modo: ThemeMode = "light";

  if (typeof window !== "undefined") {
    const guardado = getFromStorage();
    modo = guardado ?? getFromDom();
    setToDom(modo); // asegura consistencia desde el inicio
  }

  // 2) Alternar y persistir
  function toggle() {
    modo = next(modo);
    setToDom(modo);
    saveToStorage(modo);
  }
</script>

<button class="tema" type="button" on:click={toggle} aria-label="Cambiar tema">
  Tema {icon(modo)}
</button>

<style>
  /* Solo variables globales (sin colores quemados) */
  .tema {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    height: 40px;
    padding: 0 12px;
    border-radius: var(--radio--m);

    background: rgba(var(--color--primary-rgb), 0.10);
    border: 1px solid rgba(var(--color--text-rgb), 0.12);
    color: var(--color--text);
    cursor: pointer;

    transition: all 0.2s ease;
    font-weight: var(--tipografia--peso-medio);
  }

  .tema:hover {
    background: rgba(var(--color--primary-rgb), 0.16);
    color: var(--color--primary);
  }

  .tema:active {
    transform: scale(0.98);
  }
</style>
