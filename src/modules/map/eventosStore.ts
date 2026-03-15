import { get, writable } from "svelte/store";
import { fetchEventos, type Evento } from "./eventData";

export type EventosState = {
  eventos: Evento[];
  cargando: boolean;
  progreso: number;
  error: string;
};

const estadoInicial: EventosState = {
  eventos: [],
  cargando: false,
  progreso: 0,
  error: "",
};

const eventosState = writable<EventosState>(estadoInicial);

let pending: Promise<Evento[]> | null = null;

export const eventosCompartidos = {
  subscribe: eventosState.subscribe,
};

export function getEventosState(): EventosState {
  return get(eventosState);
}

export async function ensureEventosLoaded(): Promise<Evento[]> {
  const state = get(eventosState);
  if (state.eventos.length) return state.eventos;
  if (pending) return pending;

  eventosState.set({
    ...state,
    cargando: true,
    progreso: state.progreso || 0,
    error: "",
  });

  pending = fetchEventos((loaded, total) => {
    eventosState.update((current) => ({
      ...current,
      cargando: true,
      progreso: total ? Math.round((loaded / total) * 100) : 0,
      error: "",
    }));
  })
    .then((eventos) => {
      eventosState.set({
        eventos,
        cargando: false,
        progreso: 100,
        error: "",
      });
      return eventos;
    })
    .catch((error) => {
      eventosState.set({
        eventos: [],
        cargando: false,
        progreso: 0,
        error: String(error),
      });
      throw error;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}
