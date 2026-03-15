import { writable, type Writable } from "svelte/store";
import type { Evento } from "./eventData";

const EVENTO_STORAGE_KEY = "geoportal:evento-seleccionado";

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredEvento(): Evento | null {
  if (!canUseLocalStorage()) return null;

  try {
    const raw = window.localStorage.getItem(EVENTO_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Evento) : null;
  } catch {
    return null;
  }
}

function writeStoredEvento(evento: Evento | null): void {
  if (!canUseLocalStorage()) return;

  try {
    if (evento) {
      window.localStorage.setItem(EVENTO_STORAGE_KEY, JSON.stringify(evento));
    } else {
      window.localStorage.removeItem(EVENTO_STORAGE_KEY);
    }
  } catch {
    // Ignorar cuota o bloqueos del navegador.
  }
}

function createEventoStore(): Writable<Evento | null> {
  const store = writable<Evento | null>(readStoredEvento());

  return {
    subscribe: store.subscribe,
    set(value) {
      writeStoredEvento(value);
      store.set(value);
    },
    update(updater) {
      store.update((current) => {
        const next = updater(current);
        writeStoredEvento(next);
        return next;
      });
    },
  };
}

export const eventoSeleccionado = createEventoStore();
