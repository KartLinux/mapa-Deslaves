import { NIVEL_COLORS } from '$lib/data/csvParser';

export function formatFecha(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const monthName = months[parseInt(month) - 1] ?? month;
  return `${parseInt(day)} de ${monthName} de ${year}`;
}

export function formatNumero(n: number): string {
  if (n === 0) return '0';
  return n.toLocaleString('es-EC');
}

export function nivelColor(nivel: string): string {
  return NIVEL_COLORS[nivel] ?? '#94a3b8';
}

export function tipoEventoIcon(tipo: string): string {
  const t = tipo.toLowerCase();
  if (t.includes('desliz')) return '🏔️';
  if (t.includes('inundac')) return '🌊';
  if (t.includes('incendio')) return '🔥';
  if (t.includes('sismo') || t.includes('terremoto')) return '🌍';
  if (t.includes('erupcion') || t.includes('volcán') || t.includes('volcan')) return '🌋';
  if (t.includes('sequia') || t.includes('sequía')) return '☀️';
  if (t.includes('granizo')) return '🌨️';
  if (t.includes('viento') || t.includes('temporal')) return '💨';
  return '⚠️';
}
