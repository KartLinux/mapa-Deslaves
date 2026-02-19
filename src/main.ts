// src/main.ts
import "./interface/styles/main.css";
import "leaflet/dist/leaflet.css";
import "./interface/styles/mapLegend.css";

import App from "./interface/pages/start/App.svelte";
import { mount } from "svelte";

const guardado = localStorage.getItem("tema");
if (guardado === "light" || guardado === "dark") {
  document.documentElement.setAttribute("data-theme", guardado);
} else {
  document.documentElement.setAttribute("data-theme", "light");
}

mount(App, {
  target: document.getElementById("app")!,
});
