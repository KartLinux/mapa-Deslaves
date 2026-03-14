import { parseEventos } from '$lib/data/csvParser';
import { error } from '@sveltejs/kit';
export const load = async ({ params, fetch }: { params: { id: string }, fetch: typeof window.fetch }) => {
  const res = await fetch('/data.csv');
  const text = await res.text();
  const eventos = parseEventos(text);
  const evento = eventos.find(e => e.id === Number(params.id));
  if (!evento) throw error(404, 'Evento no encontrado');
  return { evento };
};
