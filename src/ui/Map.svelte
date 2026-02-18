<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { MapController } from "../map/initMap";
  import { initMap } from "../map/initMap";

  let controller: MapController | null = null;

  onMount(async () => {
    controller = await initMap("map", { followTheme: true });
  });

  onDestroy(() => {
    controller?.destroy();
  });
</script>

<div id="map" class="map"></div>

<style>
  .map {
    height: 100vh;
    width: 100%;
  }
</style>
