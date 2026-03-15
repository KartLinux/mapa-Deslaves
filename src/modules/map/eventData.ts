// src/modules/map/eventData.ts
// ─── NOTA: Columnas mapeadas exactamente desde Base_Eventos_Limpia.csv ─────────

export interface Evento {
  // Identificación
  id: number;
  // Ubicación
  provincia: string;
  canton: string;
  parroquias: string;          // columna: parroquias
  comunidad: string;           // columna: comunidadbarriosector
  lat: number;
  lng: number;
  // Caracterización del evento
  evento: string;              // columna: evento  (antes tipoEvento)
  causa: string;
  categoriaDelEvento: string;  // columna: categoria_del_evento
  fechaEvento: string;
  ano: number;                 // columna: ano  (sin tilde para TS)
  mes: number;
  horaEvento: string;
  diaEvento: number;
  // Impacto en personas
  fallecidas: number;
  heridas: number;             // columna: heridas  (antes heridos)
  desaparecidos: number;
  muertosDesaparecidos: number;
  familiasAfectadas: number;
  personasAfectadasDirectamente: number; // (antes afectadosDirectos)
  afectadasIndirectas: number;           // (antes afectadosIndirectos)
  personasImpactadas: number;
  familiasDamnificadas: number;
  personasDamnificadas: number;
  personasEvacuadas: number;
  personasAlbergadas: number;
  pEnFamiliasAcogientes: number;
  personasOtrosMedios: number;
  personasEnProcesoEvacuacion: number;
  personasResistenEvacuacion: number;
  necesidadAlbergue: number;
  personasAphRescate: number;
  // Impacto en infraestructura
  viviendasAfectadas: number;
  viviendasDestruidas: number;
  estabEdAfectados: number;
  estabEdDestruidos: number;
  centrosSaludAfectados: number;
  centrosSaludDestruidos: number;
  puentesAfectados: number;
  puentesDestruidos: number;
  bienesPublicosAfectados: number;
  bienesPublicosDestruidos: number;
  bienesPrivadosAfectados: number;
  bienesPrivadosDestruidos: number;
  metrosViasAfectadas: number;   // columna: metros_lineales_de_vias_afectadas
  kmViasAfectadas: number;       // columna: km_lineales_de_vias_afecatdas
  categoriaVia: string;
  estadoVia: string;
  viaAlterna: string;
  // Impacto ambiental y agropecuario
  haCultivoAfectadas: number;
  haCultivoPerdidas: number;
  haVegetalQuemada: number;
  animalesAfectados: number;
  animalesMuertos: number;
  // Narrativa
  descripcion: string;           // columna: descripcion_general_del_evento
  acciones: string;
  // Clasificación institucional
  nivelEvento: string;           // columna: calificacion_del_evento_peligroso
  estadoInforme: string;         // columna: inicial_inicial_seguimiento_… (nombre largo)
  zonal: string;
  nivelInforme: string;
  macroevento: string;
  eventosLluvias: number;
}

/** Escapa caracteres HTML para prevenir inyección en popups y HTML strings */
function sanitize(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function parseNum(s: string): number {
  if (!s) return 0;
  const clean = s.trim();
  if (clean === "" || clean.toLowerCase() === "no especifica" || clean === "-") return 0;
  return parseFloat(clean.replace(",", ".")) || 0;
}

function parseStr(s: string): string {
  return sanitize((s ?? "").trim());
}

/** Parsea el CSV completo respetando comillas, saltos de línea y delimitadores. */
function parseCsvRows(text: string, delimiter = ";"): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === delimiter && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(current);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += ch;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
  }

  return rows;
}

/** Nombre del cache en el Cache API del navegador */
const CSV_CACHE = "geoportal-csv-v2";
const LOCAL_STORAGE_DATA_KEY = "geoportal:eventos-csv";
const LOCAL_STORAGE_META_KEY = "geoportal:eventos-csv-meta";
const LOCAL_STORAGE_CACHE_VERSION = 1;

const HEADER_ALIASES = {
  id: ["id", "id_evento"],
  provincia: ["provincia"],
  canton: ["canton"],
  parroquias: ["parroquias", "parroquia"],
  comunidad: ["comunidadbarriosector", "comunidad_barrio_sector"],
  latitud: ["latitud"],
  longitud: ["longitud"],
  evento: ["evento", "tipo_evento"],
  causa: ["causa"],
  categoria: ["categoria_del_evento", "categoria_evento"],
  fecha: ["fecha_del_evento", "fecha_evento"],
  ano: ["ano"],
  mes: ["mes"],
  hora: ["hora_del_evento"],
  dia: ["dia_evento"],
  fallecidas: ["fallecidas"],
  heridas: ["heridas", "num_heridos"],
  desaparecidos: ["personas_desaparecidas", "num_personas_desaparecidas"],
  familiasAfectadas: ["familias_afectadas", "num_familias_afectadas"],
  personasAfectadasDirectamente: ["personas_afectadas_directamente", "num_afectados_directamente"],
  afectadasIndirectas: ["afectadas_indirectas", "num_afectados_indirectamente"],
  familiasDamnificadas: ["familias_damnificadas", "num_familias_damnificadas"],
  personasDamnificadas: ["personas_damnificadas", "num_personas_damnificadas"],
  personasEvacuadas: ["personas_evacuadas", "num_personas_evacuadas"],
  personasAlbergadas: ["personas_albergadas", "num_personas_albergadas"],
  personasAcogidasFamiliares: ["p_en_familias_acogientes", "num_personas_acojidas_por_familiares"],
  personasOtrosMedios: ["personas_en_otros_medios", "num_personas_acojidas_por_otros_medios"],
  personasEnProcesoEvacuacion: ["personas_en_proceso_de_evacuacion"],
  personasResistenEvacuacion: ["personas_que_resisten_a_la_evacuacion", "personas_resistidas_a_la_evacuacion"],
  viviendasAfectadas: ["viviendas_afectadas"],
  viviendasDestruidas: ["viviendas_destruidas"],
  estabEdAfectados: ["establecimientos_educativos_afectados"],
  estabEdDestruidos: ["establecimientos_educativos_destruidos"],
  centrosSaludAfectados: ["centros_de_salud_afectados"],
  centrosSaludDestruidos: ["centros_de_salud_destruidos"],
  puentesAfectados: ["puentes_afectados"],
  puentesDestruidos: ["puentes_destruidos"],
  bienesPublicosAfectados: ["bienes_publicos_afectados"],
  bienesPublicosDestruidos: ["bienes_publicos_destruidos"],
  bienesPrivadosAfectados: ["bienes_privados_afectados"],
  bienesPrivadosDestruidos: ["bienes_privados_destruidos"],
  metrosViasAfectadas: ["metros_lineales_de_vias_afectadas", "vias_afectadas_m"],
  kmViasAfectadas: ["km_lineales_de_vias_afecatdas", "vias_afectadas_km"],
  categoriaVia: ["categoria_de_via"],
  estadoVia: ["esatdo_infvia"],
  viaAlterna: ["via_alterna"],
  haCultivoAfectadas: ["ha_cultivo_afectadas", "cultivos_afectados_ha"],
  haCultivoPerdidas: ["ha_cultivo_perdidas", "cultivos_perdidos_ha"],
  haVegetalQuemada: ["ha_de_cobertura_vegetal_quemada", "cobertura_vegetal_quemada_ha"],
  animalesAfectados: ["animales_afectados"],
  animalesMuertos: ["animales_muertos"],
  descripcion: ["descripcion_general_del_evento", "descripcion_del_evento"],
  acciones: ["acciones"],
  estadoInforme: [
    "inicial_inicial_seguimiento_seguimiento_cierre_cierre_inicialcierre_inicialcierre",
    "estado_evento",
  ],
  zonal: ["zonal"],
  nivelInforme: ["nivel_del_inf"],
  macroevento: ["macroevento"],
  personasAfectadasTotales: ["no_de_personas_afectadas", "no. de personas afectadas"],
  muertosDesaparecidos: ["muertos_y_desaparecidos"],
  necesidadAlbergue: ["no_de_necesidad_de_albergue"],
  personasAphRescate: ["no_de_personas_con_aph_y_rescate", "num_personas_aph_rescate"],
  nivelEvento: ["calificacion_del_evento_peligroso", "nivel_evento"],
  personasImpactadas: ["personas_impactadas", "num_personas_impactadas"],
  eventosLluvias: ["eventos_lluvias"],
} as const;

function buildHeaderLookup(headers: string[]): Record<string, number> {
  const lookup: Record<string, number> = {};
  headers.forEach((header, index) => {
    lookup[header.trim().toLowerCase()] = index;
  });
  return lookup;
}

function createGetter(headers: string[]) {
  const lookup = buildHeaderLookup(headers);
  return (cols: string[], aliases: readonly string[]): string => {
    for (const alias of aliases) {
      const value = cols[lookup[alias]];
      if (value !== undefined) return value.trim();
    }
    return "";
  };
}

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readCsvFromLocalStorage(): string | null {
  if (!canUseLocalStorage()) return null;

  try {
    const metaRaw = window.localStorage.getItem(LOCAL_STORAGE_META_KEY);
    const csvText = window.localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
    if (!metaRaw || !csvText) return null;

    const meta = JSON.parse(metaRaw) as { version?: number };
    if (meta.version !== LOCAL_STORAGE_CACHE_VERSION) return null;
    return csvText;
  } catch {
    return null;
  }
}

function writeCsvToLocalStorage(text: string): void {
  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(LOCAL_STORAGE_DATA_KEY, text);
    window.localStorage.setItem(
      LOCAL_STORAGE_META_KEY,
      JSON.stringify({
        version: LOCAL_STORAGE_CACHE_VERSION,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // Ignorar cuota excedida o bloqueos del navegador.
  }
}

/** Carga el CSV usando la Cache API para persistirlo entre recargas de página */
async function fetchCsvText(): Promise<string> {
  const urls = ["/Base_Eventos_Limpia.csv", "/data.csv"];
  const localHit = readCsvFromLocalStorage();
  if (localHit) return localHit;

  try {
    const cache = await caches.open(CSV_CACHE);
    for (const url of urls) {
      const hit = await cache.match(url);
      if (hit) {
        const text = await hit.text();
        writeCsvToLocalStorage(text);
        return text;
      }
    }
    // No está en caché → descargar y almacenar
    for (const url of urls) {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.clone().text();
        cache.put(url, res.clone()); // guardar sin bloquear
        writeCsvToLocalStorage(text);
        return text;
      }
    }
  } catch {
    // Cache API no disponible (contexto inseguro) → fetch directo
    for (const url of urls) {
      const res = await fetch(url);
      if (res.ok) {
        const text = await res.text();
        writeCsvToLocalStorage(text);
        return text;
      }
    }
  }
  throw new Error("No se pudo cargar el archivo de datos CSV.");
}

/** Caché en memoria para evitar re-parsear en cada navegación */
let _cache: Evento[] | null = null;
let _pending: Promise<Evento[]> | null = null;

/**
 * Carga y parsea los eventos.
 * - Primer load: descarga CSV (servido desde Cache API en visitas posteriores)
 * - Parsing en chunks de 500 filas para no bloquear el event loop
 * @param onProgress callback opcional con (filasCargadas, totalFilas)
 */
export async function fetchEventos(
  onProgress?: (loaded: number, total: number) => void
): Promise<Evento[]> {
  if (_cache) return _cache;
  if (_pending) return _pending;

  _pending = (async () => {
    const text = await fetchCsvText();
    const rows = parseCsvRows(text);
    if (rows.length < 2) return [];

    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const get = createGetter(headers);
    const dataRows = rows.slice(1);
    const total = dataRows.length;
    const CHUNK = 500;
    const eventos: Evento[] = [];

    for (let start = 0; start < dataRows.length; start += CHUNK) {
      const slice = dataRows.slice(start, start + CHUNK);

      for (const cols of slice) {
        const lat = parseNum(get(cols, HEADER_ALIASES.latitud));
        const lng = parseNum(get(cols, HEADER_ALIASES.longitud));
        if (lat === 0 && lng === 0) continue;
        if (lat < -5.1 || lat > 1.6 || lng < -81.2 || lng > -75.0) continue;

        const fechaStr = get(cols, HEADER_ALIASES.fecha);
        const fechaPartes = fechaStr.includes("-")
          ? fechaStr.split("-")
          : fechaStr.includes("/")
            ? fechaStr.split("/")
            : [];

        let ano = parseInt(get(cols, HEADER_ALIASES.ano)) || 0;
        if (!ano && fechaPartes.length === 3) {
          ano = parseInt(fechaStr.includes("-") ? fechaPartes[0] : fechaPartes[2]) || 0;
        }

        let mes = parseInt(get(cols, HEADER_ALIASES.mes)) || 0;
        if (!mes && fechaPartes.length === 3) {
          mes = parseInt(fechaStr.includes("-") ? fechaPartes[1] : fechaPartes[1]) || 0;
        }

        let diaEvento = parseInt(get(cols, HEADER_ALIASES.dia)) || 0;
        if (!diaEvento && fechaPartes.length === 3) {
          diaEvento = parseInt(fechaStr.includes("-") ? fechaPartes[2] : fechaPartes[0]) || 0;
        }

        eventos.push({
          id: parseInt(get(cols, HEADER_ALIASES.id)) || 0,
          provincia: parseStr(get(cols, HEADER_ALIASES.provincia)),
          canton: parseStr(get(cols, HEADER_ALIASES.canton)),
          parroquias: parseStr(get(cols, HEADER_ALIASES.parroquias)),
          comunidad: parseStr(get(cols, HEADER_ALIASES.comunidad)),
          lat,
          lng,
          evento: parseStr(get(cols, HEADER_ALIASES.evento)),
          causa: parseStr(get(cols, HEADER_ALIASES.causa)),
          categoriaDelEvento: parseStr(get(cols, HEADER_ALIASES.categoria)),
          fechaEvento: parseStr(fechaStr),
          ano,
          mes,
          horaEvento: parseStr(get(cols, HEADER_ALIASES.hora)),
          diaEvento,
          fallecidas: parseNum(get(cols, HEADER_ALIASES.fallecidas)),
          heridas: parseNum(get(cols, HEADER_ALIASES.heridas)),
          desaparecidos: parseNum(get(cols, HEADER_ALIASES.desaparecidos)),
          muertosDesaparecidos: parseNum(get(cols, HEADER_ALIASES.muertosDesaparecidos)),
          familiasAfectadas: parseNum(get(cols, HEADER_ALIASES.familiasAfectadas)),
          personasAfectadasDirectamente: parseNum(get(cols, HEADER_ALIASES.personasAfectadasDirectamente)),
          afectadasIndirectas: parseNum(get(cols, HEADER_ALIASES.afectadasIndirectas)),
          personasImpactadas: parseNum(get(cols, HEADER_ALIASES.personasImpactadas))
            || parseNum(get(cols, HEADER_ALIASES.personasAfectadasTotales)),
          familiasDamnificadas: parseNum(get(cols, HEADER_ALIASES.familiasDamnificadas)),
          personasDamnificadas: parseNum(get(cols, HEADER_ALIASES.personasDamnificadas)),
          personasEvacuadas: parseNum(get(cols, HEADER_ALIASES.personasEvacuadas)),
          personasAlbergadas: parseNum(get(cols, HEADER_ALIASES.personasAlbergadas)),
          pEnFamiliasAcogientes: parseNum(get(cols, HEADER_ALIASES.personasAcogidasFamiliares)),
          personasOtrosMedios: parseNum(get(cols, HEADER_ALIASES.personasOtrosMedios)),
          personasEnProcesoEvacuacion: parseNum(get(cols, HEADER_ALIASES.personasEnProcesoEvacuacion)),
          personasResistenEvacuacion: parseNum(get(cols, HEADER_ALIASES.personasResistenEvacuacion)),
          necesidadAlbergue: parseNum(get(cols, HEADER_ALIASES.necesidadAlbergue)),
          personasAphRescate: parseNum(get(cols, HEADER_ALIASES.personasAphRescate)),
          viviendasAfectadas: parseNum(get(cols, HEADER_ALIASES.viviendasAfectadas)),
          viviendasDestruidas: parseNum(get(cols, HEADER_ALIASES.viviendasDestruidas)),
          estabEdAfectados: parseNum(get(cols, HEADER_ALIASES.estabEdAfectados)),
          estabEdDestruidos: parseNum(get(cols, HEADER_ALIASES.estabEdDestruidos)),
          centrosSaludAfectados: parseNum(get(cols, HEADER_ALIASES.centrosSaludAfectados)),
          centrosSaludDestruidos: parseNum(get(cols, HEADER_ALIASES.centrosSaludDestruidos)),
          puentesAfectados: parseNum(get(cols, HEADER_ALIASES.puentesAfectados)),
          puentesDestruidos: parseNum(get(cols, HEADER_ALIASES.puentesDestruidos)),
          bienesPublicosAfectados: parseNum(get(cols, HEADER_ALIASES.bienesPublicosAfectados)),
          bienesPublicosDestruidos: parseNum(get(cols, HEADER_ALIASES.bienesPublicosDestruidos)),
          bienesPrivadosAfectados: parseNum(get(cols, HEADER_ALIASES.bienesPrivadosAfectados)),
          bienesPrivadosDestruidos: parseNum(get(cols, HEADER_ALIASES.bienesPrivadosDestruidos)),
          metrosViasAfectadas: parseNum(get(cols, HEADER_ALIASES.metrosViasAfectadas)),
          kmViasAfectadas: parseNum(get(cols, HEADER_ALIASES.kmViasAfectadas)),
          categoriaVia: parseStr(get(cols, HEADER_ALIASES.categoriaVia)),
          estadoVia: parseStr(get(cols, HEADER_ALIASES.estadoVia)),
          viaAlterna: parseStr(get(cols, HEADER_ALIASES.viaAlterna)),
          haCultivoAfectadas: parseNum(get(cols, HEADER_ALIASES.haCultivoAfectadas)),
          haCultivoPerdidas: parseNum(get(cols, HEADER_ALIASES.haCultivoPerdidas)),
          haVegetalQuemada: parseNum(get(cols, HEADER_ALIASES.haVegetalQuemada)),
          animalesAfectados: parseNum(get(cols, HEADER_ALIASES.animalesAfectados)),
          animalesMuertos: parseNum(get(cols, HEADER_ALIASES.animalesMuertos)),
          descripcion: parseStr(get(cols, HEADER_ALIASES.descripcion)),
          acciones: parseStr(get(cols, HEADER_ALIASES.acciones)),
          nivelEvento: parseStr(get(cols, HEADER_ALIASES.nivelEvento)),
          estadoInforme: parseStr(get(cols, HEADER_ALIASES.estadoInforme)),
          zonal: parseStr(get(cols, HEADER_ALIASES.zonal)),
          nivelInforme: parseStr(get(cols, HEADER_ALIASES.nivelInforme)),
          macroevento: parseStr(get(cols, HEADER_ALIASES.macroevento)),
          eventosLluvias: parseNum(get(cols, HEADER_ALIASES.eventosLluvias)),
        });
      }

      onProgress?.(Math.min(start + CHUNK, total), total);
      await new Promise<void>((r) => setTimeout(r, 0));
    }

    _cache = eventos;
    return eventos;
  })();

  try {
    return await _pending;
  } finally {
    _pending = null;
  }
}

export function invalidarCache() {
  _cache = null;
  _pending = null;
  if (canUseLocalStorage()) {
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_DATA_KEY);
      window.localStorage.removeItem(LOCAL_STORAGE_META_KEY);
    } catch {
      // Ignorar bloqueos del navegador.
    }
  }
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
  switch ((nivel ?? "").trim()) {
    case "Nivel 1": return "#22c55e";
    case "Nivel 2": return "#f59e0b";
    case "Nivel 3": return "#ef4444";
    default:        return "#94a3b8";
  }
}

export const NIVEL_COLORS: Record<string, string> = {
  "Nivel 1": "#22c55e",
  "Nivel 2": "#f59e0b",
  "Nivel 3": "#ef4444",
  "Sin nivel": "#94a3b8",
};
