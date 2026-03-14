import type { Evento } from './types';

export function parseNum(s: string): number {
  if (!s) return 0;
  const clean = s.trim();
  if (clean === '' || clean.toLowerCase() === 'no especifica' || clean === '-') return 0;
  return parseFloat(clean.replace(',', '.')) || 0;
}

export function parseLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ';' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

export function parseEventos(text: string): Evento[] {
  const rawLines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (rawLines.length < 2) return [];

  // Strip BOM if present
  const firstLine = rawLines[0].replace(/^\uFEFF/, '');
  const headers = parseLine(firstLine).map((h) => h.trim());

  const get = (cols: string[], name: string): string =>
    cols[headers.indexOf(name)]?.trim() ?? '';

  const eventos: Evento[] = [];

  for (const line of rawLines.slice(1)) {
    const cols = parseLine(line);

    const lat = parseNum(get(cols, 'latitud'));
    const lng = parseNum(get(cols, 'longitud'));
    if (lat === 0 && lng === 0) continue;

    const fechaStr = get(cols, 'fecha_evento');
    const fechaParts = fechaStr.split('/');
    const dia = fechaParts.length === 3 ? parseInt(fechaParts[0]) || 0 : 0;
    const mes = fechaParts.length >= 2 ? parseInt(fechaParts[1]) || 0 : 0;
    const año = fechaParts.length === 3 ? parseInt(fechaParts[2]) || 0 : 0;

    eventos.push({
      id: parseInt(get(cols, 'id_evento')) || 0,
      provincia: get(cols, 'provincia'),
      canton: get(cols, 'canton'),
      parroquia: get(cols, 'parroquia'),
      comunidad: get(cols, 'comunidad_barrio_sector'),
      lat,
      lng,
      tipoEvento: get(cols, 'tipo_evento'),
      causa: get(cols, 'causa'),
      categoriaEvento: get(cols, 'categoria_evento'),
      fechaEvento: fechaStr,
      año,
      mes,
      dia,
      horaEvento: get(cols, 'hora_del_evento'),
      descripcion: get(cols, 'descripcion_del_evento'),
      heridos: parseNum(get(cols, 'num_heridos')),
      desaparecidos: parseNum(get(cols, 'num_personas_desaparecidas')),
      familiasAfectadas: parseNum(get(cols, 'num_familias_afectadas')),
      afectadosDirectos: parseNum(get(cols, 'num_afectados_directamente')),
      afectadosIndirectos: parseNum(get(cols, 'num_afectados_indirectamente')),
      familiasDamnificadas: parseNum(get(cols, 'num_familias_damnificadas')),
      personasDamnificadas: parseNum(get(cols, 'num_personas_damnificadas')),
      personasEvacuadas: parseNum(get(cols, 'num_personas_evacuadas')),
      personasAlbergadas: parseNum(get(cols, 'num_personas_albergadas')),
      personasAcogiFamilias: parseNum(get(cols, 'num_personas_acojidas_por_familiares')),
      personasAcogiOtros: parseNum(get(cols, 'num_personas_acojidas_por_otros_medios')),
      personasEnEvacuacion: parseNum(get(cols, 'personas_en_proceso_de_evacuacion')),
      personasResistenEvacuacion: parseNum(get(cols, 'personas_resistidas_a_la_evacuacion')),
      viviendasAfectadas: parseNum(get(cols, 'viviendas_afectadas')),
      viviendasDestruidas: parseNum(get(cols, 'viviendas_destruidas')),
      educativosAfectados: parseNum(get(cols, 'establecimientos_educativos_afectados')),
      educativosDestruidos: parseNum(get(cols, 'establecimientos_educativos_destruidos')),
      saludAfectados: parseNum(get(cols, 'centros_de_salud_afectados')),
      saludDestruidos: parseNum(get(cols, 'centros_de_salud_destruidos')),
      puentesAfectados: parseNum(get(cols, 'puentes_afectados')),
      puentesDestruidos: parseNum(get(cols, 'puentes_destruidos')),
      bienesPublicosAfectados: parseNum(get(cols, 'bienes_publicos_afectados')),
      bienesPublicosDestruidos: parseNum(get(cols, 'bienes_publicos_destruidos')),
      bienesPrivadosAfectados: parseNum(get(cols, 'bienes_privados_afectados')),
      bienesPrivadosDestruidos: parseNum(get(cols, 'bienes_privados_destruidos')),
      viasAfectadasM: parseNum(get(cols, 'vias_afectadas_m')),
      cultivosAfectadosHa: parseNum(get(cols, 'cultivos_afectados_ha')),
      cultivosPerdidosHa: parseNum(get(cols, 'cultivos_perdidos_ha')),
      coberturaVegetalHa: parseNum(get(cols, 'cobertura_vegetal_quemada_ha')),
      animalesAfectados: parseNum(get(cols, 'animales_afectados')),
      animalesMuertos: parseNum(get(cols, 'animales_muertos')),
      fuente: get(cols, 'fuente_del_evento'),
      acciones: get(cols, 'acciones'),
      estado: get(cols, 'estado_evento'),
      totalPersonasAfectadas: parseNum(get(cols, 'No. De personas afectadas')),
      muertosDesaparecidos: parseNum(get(cols, 'muertos_y_desaparecidos')),
      nivelEvento: get(cols, 'nivel_evento'),
      totalImpactados: parseNum(get(cols, 'num_personas_impactadas')),
      viasAfectadasKm: parseNum(get(cols, 'vias_afectadas_km')),
    });
  }

  return eventos;
}

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

/** Returns the CSS color for a given event level. Use `NIVEL_COLORS` for direct lookup. */
export function colorNivel(nivel: string): string {
  return NIVEL_COLORS[nivel.trim()] ?? NIVEL_COLORS['Sin nivel'];
}

/** @deprecated Use colorNivel instead */
export const color_nivel = colorNivel;

export const NIVEL_COLORS: Record<string, string> = {
  'Nivel 1': '#f59e0b',
  'Nivel 2': '#f97316',
  'Nivel 3': '#ef4444',
  'Nivel 4': '#7f1d1d',
  'Sin nivel': '#94a3b8',
};

export function getUniqueValues<T>(arr: T[], key: keyof T): string[] {
  const seen = new Set<string>();
  for (const item of arr) {
    const val = String(item[key] ?? '').trim();
    if (val) seen.add(val);
  }
  return Array.from(seen).sort();
}
