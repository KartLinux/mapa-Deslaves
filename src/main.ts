// src/main.ts
import "./styles/main.css";
import "leaflet/dist/leaflet.css";
import "./styles/mapLegend.css";

import App from "./App.svelte";
import { mount } from "svelte";

mount(App, {
  target: document.getElementById("app")!,
});
