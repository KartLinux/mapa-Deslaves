<script lang="ts">
  import type { Evento } from '$lib/data/types';
  import EventCard from '../molecules/EventCard.svelte';
  export let eventos: Evento[] = [];
  $: top6 = [...eventos].sort((a, b) => b.totalImpactados - a.totalImpactados).slice(0, 6);
</script>

<section class="featured">
  <h2 class="section-title">Eventos Históricos Destacados</h2>
  <div class="grid">
    {#each top6 as evento (evento.id)}
      <EventCard {evento} />
    {/each}
  </div>
</section>

<style>
.featured { padding: 40px 0; }
.grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
</style>
