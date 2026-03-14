import { parseEventos } from '$lib/data/csvParser';
export const load = async ({ fetch }: { fetch: typeof window.fetch }) => {
  const res = await fetch('/data.csv');
  const text = await res.text();
  const eventos = parseEventos(text);
  return { eventos };
};
