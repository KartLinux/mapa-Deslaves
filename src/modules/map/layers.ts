// src/map/layers.ts
import L from "leaflet";
import type { Layer } from "leaflet";
import {
  LABELS,
  TILE_URLS,
  ATTRIBUTION,
  OVERLAY_CONFIG,
  OPENWEATHER,
} from "./mapConfig";

export type LayerDict = Record<string, Layer>;

export function buildBaseLayers(): LayerDict {
  const light = L.tileLayer(TILE_URLS.osm, {
    maxZoom: 19,
    attribution: ATTRIBUTION.osm,
  });

  const dark = L.tileLayer(TILE_URLS.cartoDark, {
    maxZoom: 19,
    subdomains: "abcd",
    attribution: ATTRIBUTION.carto,
  });

  return {
    [LABELS.base.light]: light,
    [LABELS.base.dark]: dark,
  };
}

export async function buildOverlays(): Promise<LayerDict> {
  const topo = L.tileLayer(TILE_URLS.topo, {
    opacity: OVERLAY_CONFIG.topo.opacity,
    maxZoom: OVERLAY_CONFIG.topo.maxZoom,
    attribution: ATTRIBUTION.topo,
  });

  const rios = L.tileLayer(TILE_URLS.rios, {
    opacity: OVERLAY_CONFIG.rios.opacity,
    attribution: ATTRIBUTION.rios,
    maxZoom: OVERLAY_CONFIG.rios.maxZoom,
  });

  const aguaSuperficial = L.tileLayer(TILE_URLS.aguaSuperficialWmts, {
    opacity: OVERLAY_CONFIG.aguaSuperficial.opacity,
    maxZoom: OVERLAY_CONFIG.aguaSuperficial.maxZoom,
    attribution: ATTRIBUTION.aguaSuperficial,
  });

  const geologia = L.tileLayer.wms(TILE_URLS.igmWms, {
    ...OVERLAY_CONFIG.geologia,
    attribution: ATTRIBUTION.igm,
    crs: L.CRS.EPSG4326,
  });
  const lluviaUrl = TILE_URLS.openWeatherPrecip
    .replace("{layer}", OPENWEATHER.layers.precipitation)
    .replace("{apiKey}", OPENWEATHER.apiKey);

  const lluvia = L.tileLayer(lluviaUrl, {
    opacity: OVERLAY_CONFIG.lluvia.opacity,
    maxZoom: OVERLAY_CONFIG.lluvia.maxZoom,
    attribution: ATTRIBUTION.openweather,
  });

  const soilSand = L.tileLayer.wms(soilGridsWmsUrl("sand"), {
    layers: soilGridsLayerName("sand"),
    format: "image/png",
    transparent: true,
    version: OVERLAY_CONFIG.soilgrids.wmsVersion,
    opacity: OVERLAY_CONFIG.soilgrids.opacity,
    attribution: ATTRIBUTION.soilgrids,
  });

  const soilClay = L.tileLayer.wms(soilGridsWmsUrl("clay"), {
    layers: soilGridsLayerName("clay"),
    format: "image/png",
    transparent: true,
    version: OVERLAY_CONFIG.soilgrids.wmsVersion,
    opacity: OVERLAY_CONFIG.soilgrids.opacity,
    attribution: ATTRIBUTION.soilgrids,
  });

  const soilSilt = L.tileLayer.wms(soilGridsWmsUrl("silt"), {
    layers: soilGridsLayerName("silt"),
    format: "image/png",
    transparent: true,
    version: OVERLAY_CONFIG.soilgrids.wmsVersion,
    opacity: OVERLAY_CONFIG.soilgrids.opacity,
    attribution: ATTRIBUTION.soilgrids,
  });
  
  const overlays: LayerDict = {
    [LABELS.overlays.topo]: topo,
    [LABELS.overlays.rios]: rios,
    [LABELS.overlays.geologia]: geologia,
    [LABELS.overlays.aguaSuperficial]: aguaSuperficial,
    [LABELS.overlays.lluvia]: lluvia,
    [LABELS.overlays.soilSand]: soilSand,
    [LABELS.overlays.soilClay]: soilClay,
    [LABELS.overlays.soilSilt]: soilSilt,
  };

  if (lluvia) {
    overlays[LABELS.overlays.lluvia] = lluvia;
  }

  return overlays;

}

function soilGridsWmsUrl(mapfile: string) {
  return TILE_URLS.soilgridsWmsBase.replace("{mapfile}", mapfile);
}

function soilGridsLayerName(variable: "sand" | "clay" | "silt") {
  const { depth, quantile } = OVERLAY_CONFIG.soilgrids;
  return `${variable}_${depth}_${quantile}`;
}
