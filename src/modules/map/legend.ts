// src/map/legend.ts
import L from "leaflet";

export type LegendItem = {
  title: string;
  // Puede ser URL o función que la construya (para no repetir strings)
  url: string | (() => string);
};

type LegendState = {
  container: HTMLDivElement;
  active: LegendItem[];
};

function getUrl(item: LegendItem) {
  return typeof item.url === "function" ? item.url() : item.url;
}

function render(state: LegendState) {
  const { container, active } = state;

  if (!active.length) {
    container.innerHTML = `
      <div class="map-legend__header">Leyenda</div>
      <div class="map-legend__empty">Activa una capa con leyenda</div>
    `;
    return;
  }

  const blocks = active
    .map((item) => {
      const src = getUrl(item);
      return `
        <div class="map-legend__item">
          <div class="map-legend__title">${item.title}</div>
          <img class="map-legend__img" src="${src}" alt="Leyenda: ${item.title}" />
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <div class="map-legend__header">Leyenda</div>
    <div class="map-legend__list">${blocks}</div>
  `;
}

export function createLegendControl(position: L.ControlPosition = "bottomright") {
  const state: LegendState = {
    container: document.createElement("div"),
    active: [],
  };

  const control = L.control({ position });

  control.onAdd = () => {
    state.container.className = "leaflet-control map-legend";
    L.DomEvent.disableClickPropagation(state.container);
    L.DomEvent.disableScrollPropagation(state.container);
    render(state);
    return state.container;
  };

  return {
    control,
    setActive: (items: LegendItem[]) => {
      state.active = items;
      render(state);
    },
  };
}

/**
 * Conecta overlayadd/overlayremove para mantener la leyenda sincronizada.
 * - legendByName: mapea el "nombre" del overlay (LABELS.overlays.xxx) a su leyenda
 */
export function bindLegendToLayerControl(opts: {
  map: L.Map;
  overlays: Record<string, L.Layer>;
  legendByName: Record<string, LegendItem | undefined>;
  setActive: (items: LegendItem[]) => void;
}) {
  const { map, overlays, legendByName, setActive } = opts;

  const getActiveLegendItems = () => {
    const items: LegendItem[] = [];

    Object.entries(overlays).forEach(([name, layer]) => {
      if (!map.hasLayer(layer)) return;
      const item = legendByName[name];
      if (item) items.push(item);
    });

    return items;
  };

  const update = () => setActive(getActiveLegendItems());

  const onAdd = () => update();
  const onRemove = () => update();

  map.on("overlayadd", onAdd);
  map.on("overlayremove", onRemove);

  // Estado inicial
  update();

  return () => {
    map.off("overlayadd", onAdd);
    map.off("overlayremove", onRemove);
  };
}
