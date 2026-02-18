// src/main.ts
import "./interface/styles/main.css";
import "leaflet/dist/leaflet.css";
import "./interface/styles/mapLegend.css";

import App from "./interface/pages/start/App.svelte";
import { mount } from "svelte";

mount(App, {
  target: document.getElementById("app")!,
});
