// src/map/initMap.ts
import L from "leaflet";
import { buildBaseLayers, buildOverlays } from "./layers";
import { LABELS, MAP_DEFAULTS, type ThemeMode, LEGEND_BY_OVERLAY_NAME } from "./mapConfig";
import { readThemeFromHtml, resolveTheme, setThemeOnHtml, watchThemeChanges } from "./theme";
import { createLegendControl, bindLegendToLayerControl } from "./legend";

export type MapController = {
  getMap: () => L.Map;
  setTheme: (mode: ThemeMode) => void;
  destroy: () => void;
};

type InitOptions = Partial<{
  center: L.LatLngExpression;
  zoom: number;
  followTheme: boolean; // si true: se actualiza al cambiar data-theme o tema sistema
}>;

export async function initMap(containerId: string, options: InitOptions = {}): Promise<MapController> {
  const map = L.map(containerId, {
    center: options.center ?? MAP_DEFAULTS.center,
    zoom: options.zoom ?? MAP_DEFAULTS.zoom,
  });

  const baseLayers = buildBaseLayers();
  const overlays = await buildOverlays();
  //====================================================================
  // Debug de errores de tiles (solo desarrollo)
  const enableTileDebug = true;
  if (enableTileDebug) {
    const attachTileError = (layers: Record<string, L.Layer>, groupName: string) => {
      Object.entries(layers).forEach(([name, layer]) => {
        // Solo TileLayer y WMS emiten tileerror
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
  //====================================================================
  // Control de capas
  const layersControl = L.control.layers(baseLayers, overlays, { collapsed: false }).addTo(map);
  // Botón toggle para mostrar/ocultar capas en móvil
  const layersToggle = L.control({ position: "topright" });

  layersToggle.onAdd = () => {
    const btn = L.DomUtil.create("button", "map-btn");
    btn.type = "button";
    btn.textContent = "Capas";

    L.DomEvent.disableClickPropagation(btn);
    L.DomEvent.on(btn, "click", () => {
      const el = (layersControl as any)._container as HTMLElement | undefined;
      if (!el) return;
      el.classList.toggle("is-open");
    });

    return btn;
  };

  layersToggle.addTo(map);

  // Escala
  const scale = L.control.scale({ imperial: false }).addTo(map);
  // --------------------
  // Leyenda (solo capas que tienen leyenda definida)
  // --------------------
  const legend = createLegendControl("bottomright");
  legend.control.addTo(map);

  const cleanupLegend = bindLegendToLayerControl({
    map,
    overlays,
    legendByName: LEGEND_BY_OVERLAY_NAME,
    setActive: (items) => legend.setActive(items),
  });

  // Helper: aplica la capa base según modo resuelto
  const applyBase = (mode: ThemeMode) => {
    const resolved = resolveTheme(mode);

    const wantedLabel = resolved === "dark" ? LABELS.base.dark : LABELS.base.light;
    const unwantedLabel = resolved === "dark" ? LABELS.base.light : LABELS.base.dark;

    const wanted = baseLayers[wantedLabel] as L.TileLayer;
    const unwanted = baseLayers[unwantedLabel] as L.TileLayer;

    if (!map.hasLayer(wanted)) wanted.addTo(map);
    if (map.hasLayer(unwanted)) map.removeLayer(unwanted);
  };

  // Tema inicial (desde html)
  applyBase(readThemeFromHtml());

  // Opcional: seguir cambios del tema
  const followTheme = options.followTheme ?? true;
  const cleanupTheme = followTheme ? watchThemeChanges(applyBase) : undefined;

  const setTheme = (mode: ThemeMode) => {
    // Control externo: cambias el atributo y el watcher hará lo demás (si followTheme=true)
    setThemeOnHtml(mode);
    if (!followTheme) applyBase(mode); // si no hay watcher, aplica directo
  };

  const destroy = () => {
    cleanupTheme?.();
    cleanupLegend?.();

    // remover controles
    map.removeControl(layersControl);
    map.removeControl(scale);
    map.removeControl(legend.control);

    // remover layers (por limpieza)
    Object.values(baseLayers).forEach((l) => map.hasLayer(l) && map.removeLayer(l));
    Object.values(overlays).forEach((l) => map.hasLayer(l) && map.removeLayer(l));

    map.remove();
  };
  // Botón de cambio de tema
  const themeToggle =L.control({ position: "topright" });

  themeToggle.onAdd = () => {
    const btn = L.DomUtil.create("button", "map-btn");
    btn.type = "button";

    const get = () =>
      (document.documentElement.getAttribute("data-theme") as ThemeMode) ?? "auto";

    const next = (m: ThemeMode): ThemeMode =>
      m === "auto" ? "light" : m === "light" ? "dark" : "auto";

    const label = (m: ThemeMode) =>
      m === "light" ? "☀️" : m === "dark" ? "🌙" : "🖥️";

    const sync = () => {
      const m = get();
      btn.textContent = `Tema ${label(m)}`;
    };

    L.DomEvent.disableClickPropagation(btn);

    L.DomEvent.on(btn, "click", () => {
      const n = next(get());
      setTheme(n);
      sync();
    });

    sync();
    return btn;
  };

  themeToggle.addTo(map);

  return {
    getMap: () => map,
    setTheme,
    destroy,
  };
}
