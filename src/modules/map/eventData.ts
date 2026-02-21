// src/modules/map/eventData.ts

export interface Evento {
  id: number;
  provincia: string;
  canton: string;
  parroquia: string;
  comunidad: string;
  lat: number;
  lng: number;
  tipoEvento: string;
  causa: string;
  categoriaEvento: string;
  fechaEvento: string;
  año: number;
  mes: number;
  descripcion: string;
  heridos: number;
  desaparecidos: number;
  familiasAfectadas: number;
  afectadosDirectos: number;
  afectadosIndirectos: number;
  familiasDamnificadas: number;
  personasDamnificadas: number;
  personasEvacuadas: number;
  personasAlbergadas: number;
  viviendasAfectadas: number;
  viviendasDestruidas: number;
  puentesAfectados: number;
  puentesDestruidos: number;
  viasAfectadasM: number;
  viasAfectadasKm: number;
  cultivosAfectadosHa: number;
  cultivosPerdidosHa: number;
  nivelEvento: string;
  totalImpactados: number;
  muertosDesaparecidos: number;
  estado: string;
  acciones: string;
}

function parseNum(s: string): number {
  if (!s) return 0;
  const clean = s.trim();
  if (clean === "" || clean.toLowerCase() === "no especifica" || clean === "-") return 0;
  // replace comma decimal separator
  return parseFloat(clean.replace(",", ".")) || 0;
}

/** Parses a single semicolon-delimited CSV line respecting quoted fields */
function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ";" && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export async function fetchEventos(): Promise<Evento[]> {
  const res = await fetch("/data.csv");
  if (!res.ok) throw new Error(`No se pudo cargar data.csv: ${res.status}`);
  const text = await res.text();

  const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (rawLines.length < 2) return [];

  const headers = parseLine(rawLines[0]).map((h) => h.trim());

  const get = (cols: string[], name: string): string =>
    cols[headers.indexOf(name)]?.trim() ?? "";

  const eventos: Evento[] = [];

  for (const line of rawLines.slice(1)) {
    const cols = parseLine(line);

    const lat = parseNum(get(cols, "latitud"));
    const lng = parseNum(get(cols, "longitud"));
    if (lat === 0 && lng === 0) continue; // skip rows without coordinates

    const fechaStr = get(cols, "fecha_evento");
    const fechaParts = fechaStr.split("/");
    const año = fechaParts.length === 3 ? parseInt(fechaParts[2]) || 0 : 0;
    const mes = fechaParts.length >= 2 ? parseInt(fechaParts[1]) || 0 : 0;

    eventos.push({
      id: parseInt(get(cols, "id_evento")) || 0,
      provincia: get(cols, "provincia"),
      canton: get(cols, "canton"),
      parroquia: get(cols, "parroquia"),
      comunidad: get(cols, "comunidad_barrio_sector"),
      lat,
      lng,
      tipoEvento: get(cols, "tipo_evento"),
      causa: get(cols, "causa"),
      categoriaEvento: get(cols, "categoria_evento"),
      fechaEvento: fechaStr,
      año,
      mes,
      descripcion: get(cols, "descripcion_del_evento"),
      heridos: parseNum(get(cols, "num_heridos")),
      desaparecidos: parseNum(get(cols, "num_personas_desaparecidas")),
      familiasAfectadas: parseNum(get(cols, "num_familias_afectadas")),
      afectadosDirectos: parseNum(get(cols, "num_afectados_directamente")),
      afectadosIndirectos: parseNum(get(cols, "num_afectados_indirectamente")),
      familiasDamnificadas: parseNum(get(cols, "num_familias_damnificadas")),
      personasDamnificadas: parseNum(get(cols, "num_personas_damnificadas")),
      personasEvacuadas: parseNum(get(cols, "num_personas_evacuadas")),
      personasAlbergadas: parseNum(get(cols, "num_personas_albergadas")),
      viviendasAfectadas: parseNum(get(cols, "viviendas_afectadas")),
      viviendasDestruidas: parseNum(get(cols, "viviendas_destruidas")),
      puentesAfectados: parseNum(get(cols, "puentes_afectados")),
      puentesDestruidos: parseNum(get(cols, "puentes_destruidos")),
      viasAfectadasM: parseNum(get(cols, "vias_afectadas_m")),
      viasAfectadasKm: parseNum(get(cols, "vias_afectadas_km")),
      cultivosAfectadosHa: parseNum(get(cols, "cultivos_afectados_ha")),
      cultivosPerdidosHa: parseNum(get(cols, "cultivos_perdidos_ha")),
      nivelEvento: get(cols, "nivel_evento"),
      totalImpactados: parseNum(get(cols, "num_personas_impactadas")),
      muertosDesaparecidos: parseNum(get(cols, "muertos_y_desaparecidos")),
      estado: get(cols, "estado_evento"),
      acciones: get(cols, "acciones"),
    });
  }

  return eventos;
}

// ─── Helpers de agrupación ────────────────────────────────────────────────────

export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {});
}

export function sumField<T>(arr: T[], field: keyof T): number {
  return arr.reduce((s, item) => s + (Number(item[field]) || 0), 0);
}

export function color_nivel(nivel: string): string {
  switch (nivel.trim()) {
    case "Nivel 1": return "#f59e0b";
    case "Nivel 2": return "#f97316";
    case "Nivel 3": return "#ef4444";
    case "Nivel 4": return "#7f1d1d";
    default:        return "#94a3b8";
  }
}

export const NIVEL_COLORS: Record<string, string> = {
  "Nivel 1": "#f59e0b",
  "Nivel 2": "#f97316",
  "Nivel 3": "#ef4444",
  "Nivel 4": "#7f1d1d",
  "Sin nivel": "#94a3b8",
};
