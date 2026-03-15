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
  followTheme: boolean;
}>;

export async function initMap(
  containerId: string,
  options: InitOptions = {}
): Promise<MapController> {
  const map = L.map(containerId, {
    center: options.center ?? MAP_DEFAULTS.center,
    zoom: options.zoom ?? MAP_DEFAULTS.zoom,
    zoomControl: false,
  });

  const baseLayers = buildBaseLayers();
  const overlays = await buildOverlays();

  const ENABLE_TILE_DEBUG = import.meta.env.DEV;
  if (ENABLE_TILE_DEBUG) {
    const attachTileError = (layers: Record<string, L.Layer>, groupName: string) => {
      Object.entries(layers).forEach(([name, layer]) => {
        if ("on" in layer) {
          (layer as L.TileLayer).on("tileerror", (e: any) => {
            const src = e?.tile?.src;
            const c = e?.coords;
            console.warn(`[Tile error] ${groupName} -> ${name}`, { src, coords: c, e });
          });
        }
      });
    };

    attachTileError(baseLayers, "Base");
    attachTileError(overlays, "Overlay");
  }

  // Solo overlays en el panel de capas (sin "Mapa Estandar/Oscuro")
  const layersControl = L.control.layers(undefined, overlays, { collapsed: false }).addTo(map);
  let overlaysVisible = false;
  let legendVisible = false;

  const overlaysToggle = L.control.layers(undefined, undefined, { position: "topright" });
  overlaysToggle.onAdd = () => {
    const btn = L.DomUtil.create("button", "map-btn layers-toggle-btn") as HTMLButtonElement;
    btn.type = "button";
    btn.textContent = "Relieves";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("title", "Mostrar u ocultar panel de capas de relieve");

    L.DomEvent.disableClickPropagation(btn);
    L.DomEvent.on(btn, "click", () => {
      overlaysVisible = !overlaysVisible;

      const layersEl = (layersControl as any)._container as HTMLElement | undefined;
      if (layersEl) {
        layersEl.classList.toggle("is-open", overlaysVisible);
        layersEl.style.display = overlaysVisible ? "" : "none";
      }

      btn.setAttribute("aria-pressed", overlaysVisible ? "true" : "false");
      btn.classList.toggle("capas-ocultas", !overlaysVisible);
    });

    return btn;
  };
  overlaysToggle.addTo(map);

  const legendToggle = L.control.layers(undefined, undefined, { position: "topright" });
  legendToggle.onAdd = () => {
    const btn = L.DomUtil.create("button", "map-btn legend-toggle-btn") as HTMLButtonElement;
    btn.type = "button";
    btn.textContent = "Leyenda";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("title", "Mostrar u ocultar la leyenda");

    L.DomEvent.disableClickPropagation(btn);
    L.DomEvent.on(btn, "click", () => {
      legendVisible = !legendVisible;
      applyLegendVisibility(legendVisible);
      btn.setAttribute("aria-pressed", legendVisible ? "true" : "false");
      btn.classList.toggle("capas-ocultas", !legendVisible);
    });

    return btn;
  };
  legendToggle.addTo(map);

  let applyLegendVisibility: (visible: boolean) => void = () => {};

  const scale = L.control.scale({ imperial: false }).addTo(map);

  const legend = createLegendControl("bottomright");
  legend.control.addTo(map);

  applyLegendVisibility = (visible: boolean) => {
    const legendEl = (legend.control as any)._container as HTMLElement | undefined;
    if (legendEl) legendEl.style.display = visible ? "" : "none";
  };

  // Ambos ocultos por defecto
  const layersEl = (layersControl as any)._container as HTMLElement | undefined;
  if (layersEl) {
    layersEl.classList.remove("is-open");
    layersEl.style.display = "none";
  }
  applyLegendVisibility(false);

  const cleanupLegend = bindLegendToLayerControl({
    map,
    overlays,
    legendByName: LEGEND_BY_OVERLAY_NAME,
    setActive: (items) => legend.setActive(items),
  });

  // El mapa base se sincroniza con tema global claro/oscuro del sitio.
  const applyBase = (mode: ThemeMode) => {
    const resolved = resolveTheme(mode);

    const wantedLabel = resolved === "dark" ? LABELS.base.dark : LABELS.base.light;
    const unwantedLabel = resolved === "dark" ? LABELS.base.light : LABELS.base.dark;

    const wanted = baseLayers[wantedLabel] as L.TileLayer;
    const unwanted = baseLayers[unwantedLabel] as L.TileLayer;

    if (!map.hasLayer(wanted)) wanted.addTo(map);
    if (map.hasLayer(unwanted)) map.removeLayer(unwanted);
  };

  applyBase(readThemeFromHtml());

  const followTheme = options.followTheme ?? true;
  const cleanupTheme = followTheme ? watchThemeChanges(applyBase) : undefined;

  const destroy = () => {
    cleanupTheme?.();
    cleanupLegend?.();

    map.removeControl(layersControl);
    map.removeControl(overlaysToggle);
    map.removeControl(legendToggle);
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
