// src/tests/tileSmokeTest.ts
import { TILE_URLS } from "../modules/map/mapConfig";

type TestResult = {
  name: string;
  url: string;
  ok: boolean;
  status?: number;
  contentType?: string | null;
  error?: string;
};

const SAMPLE = {
  // un tile típico “seguro” (zoom bajo)
  z: 1,
  x: 0,
  y: 0,
  s: "a",
  r: "", // para Carto {r} puede ser "" o "@2x"
};

// arma un URL real a partir de template {s}/{z}/{x}/{y}
function buildTileUrl(template: string) {
  return template
    .replace("{s}", SAMPLE.s)
    .replace("{z}", String(SAMPLE.z))
    .replace("{x}", String(SAMPLE.x))
    .replace("{y}", String(SAMPLE.y))
    .replace("{r}", SAMPLE.r);
}

// RainViewer requiere ts (aprox) y params
function buildRainViewerUrl() {
  const now = Math.floor(Date.now() / 1000);
  const ts = Math.floor(now / 600) * 600;

  return TILE_URLS.rainviewerRadar
    .replace("{ts}", String(ts))
    .replace("{z}", String(SAMPLE.z))
    .replace("{x}", String(SAMPLE.x))
    .replace("{y}", String(SAMPLE.y))
    .replace("{color}", "2")
    .replace("{smooth}", "1")
    .replace("{snow}", "1");
}

async function headOrGet(url: string) {
  // HEAD no siempre está permitido en CDNs, por eso hacemos GET y abortamos rápido.
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      signal: controller.signal,
      cache: "no-store",
    });
    return res;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function runTileSmokeTest(): Promise<TestResult[]> {
  const targets: Array<{ name: string; url: string }> = [
    { name: "osm", url: buildTileUrl(TILE_URLS.osm) },
    { name: "cartoDark", url: buildTileUrl(TILE_URLS.cartoDark) },
    { name: "topo", url: buildTileUrl(TILE_URLS.topo) },
    { name: "rios", url: buildTileUrl(TILE_URLS.rios) },
    { name: "rainviewerRadar", url: buildRainViewerUrl() },
    // WMS: probamos con GetCapabilities (es lo más estándar)
    { name: "igmWms:GetCapabilities", url: `${TILE_URLS.igmWms}?service=WMS&request=GetCapabilities` },
  ];

  const results: TestResult[] = [];

  for (const t of targets) {
    try {
      const res = await headOrGet(t.url);
      results.push({
        name: t.name,
        url: t.url,
        ok: res.ok,
        status: res.status,
        contentType: res.headers.get("content-type"),
      });
    } catch (e: any) {
      results.push({
        name: t.name,
        url: t.url,
        ok: false,
        error: e?.name === "AbortError" ? "Timeout (abort)" : String(e),
      });
    }
  }

  return results;
}
