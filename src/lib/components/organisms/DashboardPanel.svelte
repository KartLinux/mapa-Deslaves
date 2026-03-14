<script lang="ts">
  import { onMount } from 'svelte';
  import type { Evento } from '$lib/data/types';
  import { groupBy, sumField } from '$lib/data/csvParser';
  import StatCard from '../molecules/StatCard.svelte';

  export let eventos: Evento[] = [];

  let canvas1: HTMLCanvasElement;
  let canvas2: HTMLCanvasElement;
  let canvas3: HTMLCanvasElement;
  let canvas4: HTMLCanvasElement;
  let ChartClass: typeof import('chart.js').Chart | null = null;

  let chart1: import('chart.js').Chart | null = null;
  let chart2: import('chart.js').Chart | null = null;
  let chart3: import('chart.js').Chart | null = null;
  let chart4: import('chart.js').Chart | null = null;

  $: totalImpactados = sumField(eventos, 'totalImpactados');
  $: totalHeridos = sumField(eventos, 'heridos');
  $: totalEvacuados = sumField(eventos, 'personasEvacuadas');
  $: totalViviendas = sumField(eventos, 'viviendasAfectadas');

  function buildCharts() {
    if (!ChartClass || !canvas1) return;
    chart1?.destroy();
    chart2?.destroy();
    chart3?.destroy();
    chart4?.destroy();

    // Chart 1: eventos por tipo
    const byTipo = groupBy(eventos, e => e.tipoEvento);
    const tipoEntries = Object.entries(byTipo).sort((a, b) => b[1].length - a[1].length).slice(0, 8);
    chart1 = new ChartClass(canvas1, {
      type: 'bar',
      data: {
        labels: tipoEntries.map(([k]) => k),
        datasets: [{ label: 'Eventos', data: tipoEntries.map(([, v]) => v.length), backgroundColor: '#f97316' }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    // Chart 2: eventos por año
    const byAño = groupBy(eventos.filter(e => e.año > 2000), e => String(e.año));
    const años = Object.keys(byAño).sort();
    chart2 = new ChartClass(canvas2, {
      type: 'line',
      data: {
        labels: años,
        datasets: [{ label: 'Eventos', data: años.map(a => byAño[a]?.length ?? 0), borderColor: '#2564eb', backgroundColor: 'rgba(37,99,235,0.1)', fill: true, tension: 0.3 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } } }
    });

    // Chart 3: por categoría (doughnut)
    const byCat = groupBy(eventos, e => e.categoriaEvento || 'Sin categoría');
    const catEntries = Object.entries(byCat).sort((a, b) => b[1].length - a[1].length).slice(0, 7);
    chart3 = new ChartClass(canvas3, {
      type: 'doughnut',
      data: {
        labels: catEntries.map(([k]) => k),
        datasets: [{ data: catEntries.map(([, v]) => v.length), backgroundColor: ['#2564eb','#f97316','#ef4444','#10b981','#8b5cf6','#f59e0b','#06b6d4'] }]
      },
      options: { responsive: true }
    });

    // Chart 4: top 10 provincias por impactados
    const byProv = groupBy(eventos, e => e.provincia);
    const provEntries = Object.entries(byProv)
      .map(([k, v]) => [k, sumField(v, 'totalImpactados')] as [string, number])
      .sort((a, b) => b[1] - a[1]).slice(0, 10);
    chart4 = new ChartClass(canvas4, {
      type: 'bar',
      data: {
        labels: provEntries.map(([k]) => k),
        datasets: [{ label: 'Impactados', data: provEntries.map(([, v]) => v), backgroundColor: '#10b981' }]
      },
      options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } } }
    });
  }

  onMount(async () => {
    const mod = await import('chart.js/auto');
    ChartClass = mod.default;
    buildCharts();
  });

  $: if (ChartClass && canvas1) buildCharts();
</script>

<div class="dashboard">
  <div class="stats-row">
    <StatCard title="Total Eventos" value={eventos.length} icon="📊" color="#2564eb" />
    <StatCard title="Total Impactados" value={totalImpactados} icon="👥" color="#ef4444" />
    <StatCard title="Heridos" value={totalHeridos} icon="🏥" color="#f97316" />
    <StatCard title="Evacuados" value={totalEvacuados} icon="🚶" color="#10b981" />
    <StatCard title="Viviendas Afectadas" value={totalViviendas} icon="🏠" color="#8b5cf6" />
  </div>

  <div class="charts-grid">
    <div class="chart-card">
      <h3>Eventos por Tipo</h3>
      <canvas bind:this={canvas1}></canvas>
    </div>
    <div class="chart-card">
      <h3>Eventos por Año</h3>
      <canvas bind:this={canvas2}></canvas>
    </div>
    <div class="chart-card">
      <h3>Eventos por Categoría</h3>
      <canvas bind:this={canvas3}></canvas>
    </div>
    <div class="chart-card">
      <h3>Top 10 Provincias por Impactados</h3>
      <canvas bind:this={canvas4}></canvas>
    </div>
  </div>
</div>

<style>
.dashboard { padding: 24px 0; }
.stats-row {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px; margin-bottom: 32px;
}
.charts-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}
.chart-card {
  background: var(--color--surface); border: 1px solid var(--color--border);
  border-radius: 12px; padding: 20px; box-shadow: var(--sombra--suave);
}
h3 { margin: 0 0 16px; font-size: 0.95rem; }
</style>
