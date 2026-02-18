// src/map/theme.ts
import { MAP_THEME_ATTR, SYSTEM_DARK_QUERY, type ThemeMode } from "./mapConfig";

export function readThemeFromHtml(): ThemeMode {
  const raw = document.documentElement.getAttribute(MAP_THEME_ATTR);
  return raw === "light" || raw === "dark" || raw === "auto" ? raw : "auto";
}

export function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode !== "auto") return mode;
  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? "dark" : "light";
}

export function setThemeOnHtml(mode: ThemeMode) {
  document.documentElement.setAttribute(MAP_THEME_ATTR, mode);
}

export function watchThemeChanges(onChange: (mode: ThemeMode) => void) {
  const notify = () => onChange(readThemeFromHtml());

  // 1) Cambios en atributo data-theme
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "attributes" && m.attributeName === MAP_THEME_ATTR) {
        notify();
        break;
      }
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [MAP_THEME_ATTR],
  });

  // 2) Cambios del sistema (solo importa si estás en auto)
  const media = window.matchMedia(SYSTEM_DARK_QUERY);
  const handler = () => notify();
  media.addEventListener("change", handler);

  // Ejecuta 1 vez
  notify();

  return () => {
    observer.disconnect();
    media.removeEventListener("change", handler);
  };
}
