// Map configuration constants - no Leaflet type imports to avoid SSR issues

export type ThemeMode = 'light' | 'dark' | 'auto';

export const MAP_DEFAULTS = {
  center: [-1.8312, -78.1834] as [number, number],
  zoom: 7,
  maxZoom: 19,
} as const;

export const LABELS = {
  base: {
    light: 'Mapa Estándar',
    dark: 'Mapa Oscuro',
  },
  overlays: {
    topo: 'Relieve (Montañas)',
    rios: 'Flujos de Agua',
    geologia: 'Relieve(IGM Ecuador)',
    lluvia: 'Lluvia en Tiempo Real',
    aguaSuperficial: 'Agua Superficial (JRC)',
    soilSand: 'Textura Suelo: Arena (SoilGrids)',
    soilClay: 'Textura Suelo: Arcilla (SoilGrids)',
    soilSilt: 'Textura Suelo: Limo (SoilGrids)',
  },
} as const;

export const TILE_URLS = {
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  cartoDark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  rios: 'https://tiles.arcgis.com/tiles/P3ePLMYs2RVChkJx/arcgis/rest/services/Esri_Hydro_Reference_Overlay/MapServer/tile/{z}/{y}/{x}',
  rainviewerRadar: 'https://tilecache.rainviewer.com/v2/radar/{ts}/256/{z}/{x}/{y}/{color}/{smooth}_{snow}.png',
  igmWms: 'https://www.geoportaligm.gob.ec/geoserver/ows',
  aguaSuperficialWmts: 'https://data.apps.fao.org/map/wmts/wmts?service=WMTS&request=GetTile&version=1.0.0&layer=JRC/GSW1_3/GlobalSurfaceWater&style=default&format=image/png&tilematrixset=EPSG:900913&tilematrix={z}&tilecol={x}&tilerow={y}',
  openWeatherPrecip: 'https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={apiKey}',
  soilgridsWmsBase: 'https://maps.isric.org/mapserv?map=/map/{mapfile}.map',
} as const;

export const OPENWEATHER = {
  apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY as string,
  layers: {
    precipitation: 'precipitation_new',
  },
} as const;

export const ATTRIBUTION = {
  osm: '&copy; OpenStreetMap contributors',
  carto: '&copy; OpenStreetMap contributors &copy; CARTO',
  topo: '&copy; OpenTopoMap (CC-BY-SA)',
  rios: '&copy; Esri',
  igm: '© IGM Ecuador',
  rainviewer: 'RainViewer.com',
  aguaSuperficial: 'EC JRC / FAO (Global Surface Water)',
  openweather: '&copy; OpenWeather',
  soilgrids: 'SoilGrids / ISRIC',
} as const;

export const OVERLAY_CONFIG = {
  topo: { opacity: 0.7, maxZoom: 17 },
  rios: { opacity: 0.8, maxZoom: 12 },
  geologia: {
    layers: 'mapabase:igmdtm',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    opacity: 0.5,
  },
  lluvia: { opacity: 0.75, maxZoom: 19 } as const,
  aguaSuperficial: { opacity: 0.55, maxZoom: 19 },
  soilgrids: {
    opacity: 0.55,
    depth: '0-5cm',
    quantile: 'Q0.5',
    wmsVersion: '1.3.0',
  },
} as const;

const LEGEND_FORMAT = 'image/png';

function buildWmsLegendUrl(params: {
  baseUrl: string;
  layer: string;
  style?: string;
  version?: string;
}): string {
  const url = new URL(params.baseUrl);
  url.searchParams.set('service', 'WMS');
  url.searchParams.set('request', 'GetLegendGraphic');
  url.searchParams.set('format', LEGEND_FORMAT);
  url.searchParams.set('layer', params.layer);
  url.searchParams.set('version', params.version ?? '1.3.0');
  url.searchParams.set('transparent', 'true');
  if (params.style) url.searchParams.set('style', params.style);
  return url.toString();
}

function soilGridsLegendUrl(mapfile: string, layerName: string): string {
  const base = TILE_URLS.soilgridsWmsBase.replace('{mapfile}', mapfile);
  const url = new URL(base);
  url.searchParams.set('service', 'WMS');
  url.searchParams.set('request', 'GetLegendGraphic');
  url.searchParams.set('version', OVERLAY_CONFIG.soilgrids.wmsVersion);
  url.searchParams.set('sld_version', '1.1.0');
  url.searchParams.set('format', LEGEND_FORMAT);
  url.searchParams.set('layer', layerName);
  url.searchParams.set('STYLE', 'default');
  return url.toString();
}

export const LEGEND_BY_OVERLAY_NAME: Record<string, { title: string; url: () => string } | undefined> = {
  [LABELS.overlays.geologia]: {
    title: LABELS.overlays.geologia,
    url: () => buildWmsLegendUrl({
      baseUrl: TILE_URLS.igmWms,
      layer: OVERLAY_CONFIG.geologia.layers,
      version: '1.3.0',
    }),
  },
  [LABELS.overlays.soilSand]: {
    title: LABELS.overlays.soilSand,
    url: () => {
      const { depth, quantile } = OVERLAY_CONFIG.soilgrids;
      return soilGridsLegendUrl('sand', `sand_${depth}_${quantile}`);
    },
  },
  [LABELS.overlays.soilClay]: {
    title: LABELS.overlays.soilClay,
    url: () => {
      const { depth, quantile } = OVERLAY_CONFIG.soilgrids;
      return soilGridsLegendUrl('clay', `clay_${depth}_${quantile}`);
    },
  },
  [LABELS.overlays.soilSilt]: {
    title: LABELS.overlays.soilSilt,
    url: () => {
      const { depth, quantile } = OVERLAY_CONFIG.soilgrids;
      return soilGridsLegendUrl('silt', `silt_${depth}_${quantile}`);
    },
  },
};
