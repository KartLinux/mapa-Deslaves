// src/main.ts
import "./styles/main.css";
import "leaflet/dist/leaflet.css";
import { runTileSmokeTest } from "./test/tileSmokeTest";
import { initMap } from "./map/initMap";
import "./styles/mapLegend.css"

// crea el mapa
async function bootstrap() {
  // Esperamos a que el mapa se inicialice correctamente
  await initMap("map", { followTheme: true });
}

bootstrap();

runTileSmokeTest().then((results) => {
  console.table(results);
});