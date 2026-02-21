// src/map/initMap.ts
import L from "leaflet";
import { buildBaseLayers, buildOverlays } from "./layers";
import { LABELS, MAP_DEFAULTS, type ThemeMode, LEGEND_BY_OVERLAY_NAME } from "./mapConfig";
import { readThemeFromHtml, resolveTheme, watchThemeChanges } from "./theme";
import { createLegendControl, bindLegendToLayerControl } from "./legend";

export type MapController = {
  getMap: () => L.Map;
  destroy: () => void;
};

type InitOptions = Partial<{
  center: L.LatLngExpression;
  zoom: number;
  followTheme: boolean; // si true: se actualiza al cambiar data-theme o tema sistema
}>;

export async function initMap(
  containerId: string,
  options: InitOptions = {}
): Promise<MapController> {
  // --------------------
  // 1) Inicialización del mapa
  // --------------------
  const map = L.map(containerId, {
    center: options.center ?? MAP_DEFAULTS.center,
    zoom: options.zoom ?? MAP_DEFAULTS.zoom,
    zoomControl: false,
  });

  // --------------------
  // 2) Capas (base + overlays)
  // --------------------
  const baseLayers = buildBaseLayers();
  const overlays = await buildOverlays();

  // --------------------
  // 3) Debug tiles (solo desarrollo)
  // --------------------
  const ENABLE_TILE_DEBUG = true;

  if (ENABLE_TILE_DEBUG) {
    const attachTileError = (layers: Record<string, L.Layer>, groupName: string) => {
      Object.entries(layers).forEach(([name, layer]) => {
        if ("on" in layer) {
          (layer as L.TileLayer).on("tileerror", (e: any) => {
            const src = e?.tile?.src;
            const c = e?.coords;
            console.warn(`[Tile error] ${groupName} → ${name}`, { src, coords: c, e });
          });
        }
      });
    };

    attachTileError(baseLayers, "Base");
    attachTileError(overlays, "Overlay");
  }

  // --------------------
  // 4) Control de capas + botón toggle "Capas"
  // --------------------
  const layersControl = L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(map);

  // Estado de visibilidad del panel capas + leyenda
  let capasVisible = true;

  const layersToggle = L.control({ position: "topright" });
  layersToggle.onAdd = () => {
    const btn = L.DomUtil.create("button", "map-btn layers-toggle-btn") as HTMLButtonElement;
    btn.type = "button";
    btn.textContent = "🗂️ Capas";

    L.DomEvent.disableClickPropagation(btn);
    L.DomEvent.on(btn, "click", () => {
      capasVisible = !capasVisible;

      const layersEl = (layersControl as any)._container as HTMLElement | undefined;
      if (layersEl) layersEl.style.display = capasVisible ? "" : "none";

      // La leyenda se referencia después del mount; usamos un pequeño helper
      applyLegendVisibility(capasVisible);

      btn.textContent = capasVisible ? "🗂️ Capas" : "🗂️ Capas ✕";
      btn.classList.toggle("capas-ocultas", !capasVisible);
    });

    return btn;
  };
  layersToggle.addTo(map);

  // Helper que se sobrescribe una vez que la leyenda exista
  let applyLegendVisibility: (visible: boolean) => void = () => {};

  // --------------------
  // 5) Escala
  // --------------------
  const scale = L.control.scale({ imperial: false }).addTo(map);

  // --------------------
  // 6) Leyenda (solo overlays con leyenda definida)
  // --------------------
  const legend = createLegendControl("bottomright");
  legend.control.addTo(map);

  // Conectar helper de visibilidad ahora que la leyenda existe
  applyLegendVisibility = (visible: boolean) => {
    const legendEl = (legend.control as any)._container as HTMLElement | undefined;
    if (legendEl) legendEl.style.display = visible ? "" : "none";
  };

  const cleanupLegend = bindLegendToLayerControl({
    map,
    overlays,
    legendByName: LEGEND_BY_OVERLAY_NAME,
    setActive: (items) => legend.setActive(items),
  });

  // --------------------
  // 7) Tema
  // --------------------
  const applyBase = (mode: ThemeMode) => {
    const resolved = resolveTheme(mode);

    const wantedLabel = resolved === "dark" ? LABELS.base.dark : LABELS.base.light;
    const unwantedLabel = resolved === "dark" ? LABELS.base.light : LABELS.base.dark;

    const wanted = baseLayers[wantedLabel] as L.TileLayer;
    const unwanted = baseLayers[unwantedLabel] as L.TileLayer;

    if (!map.hasLayer(wanted)) wanted.addTo(map);
    if (map.hasLayer(unwanted)) map.removeLayer(unwanted);
  };

  // Base inicial (según data-theme / sistema)
  applyBase(readThemeFromHtml());

  // Seguir cambios del tema (atributo data-theme o tema del sistema)
  const followTheme = options.followTheme ?? true;
  const cleanupTheme = followTheme ? watchThemeChanges(applyBase) : undefined;

  // --------------------
  // 8) Destroy / Cleanup
  // --------------------
  const destroy = () => {
    cleanupTheme?.();
    cleanupLegend?.();

    map.removeControl(layersControl);
    map.removeControl(layersToggle);
    map.removeControl(scale);
    map.removeControl(legend.control);

    Object.values(baseLayers).forEach((l) => map.hasLayer(l) && map.removeLayer(l));
    Object.values(overlays).forEach((l) => map.hasLayer(l) && map.removeLayer(l));

    map.remove();
  };

  return {
    getMap: () => map,
    destroy,
  };
}
