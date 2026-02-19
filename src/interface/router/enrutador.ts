import { writable } from "svelte/store";

export const rutaActual = writable(window.location.pathname);

export function navegar(path: string) {
  history.pushState({}, "", path);
  rutaActual.set(path);
}

export function iniciarRouter() {
  window.addEventListener("popstate", () => {
    rutaActual.set(window.location.pathname);
  });
}
