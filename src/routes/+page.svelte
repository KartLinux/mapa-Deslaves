<script lang="ts">
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import FeaturedEvents from '$lib/components/organisms/FeaturedEvents.svelte';
  import StatCard from '$lib/components/molecules/StatCard.svelte';
  import { sumField, groupBy } from '$lib/data/csvParser';

  export let data: PageData;
  $: eventos = data.eventos ?? [];
  $: totalImpactados = sumField(eventos, 'totalImpactados');
  $: provincias = Object.keys(groupBy(eventos, e => e.provincia)).length;
  $: años = new Set(eventos.map(e => e.año).filter(Boolean));
</script>

<svelte:head>
  <title>Geoportal SNGR - Eventos Adversos Ecuador</title>
</svelte:head>

<div class="home">
  <!-- Hero -->
  <section class="hero">
    <div class="hero-content">
      <h1>🌍 Geoportal Nacional de<br/>Eventos Adversos</h1>
      <p>Sistema de información geoespacial para el monitoreo y análisis de eventos adversos en Ecuador. Datos oficiales del SNGR.</p>
      <div class="cta-buttons">
        <button class="btn-primary" on:click={() => goto('/geoportal')}>🗺️ Ver Mapa</button>
        <button class="btn-secondary" on:click={() => goto('/dashboard')}>📊 Ver Dashboard</button>
      </div>
    </div>
  </section>

  <!-- Stats row -->
  <section class="stats-section page-container">
    <div class="stats-grid">
      <StatCard title="Eventos Registrados" value={eventos.length} icon="📋" color="#2564eb" />
      <StatCard title="Personas Impactadas" value={totalImpactados} icon="👥" color="#ef4444" />
      <StatCard title="Provincias" value={provincias} icon="🗺️" color="#10b981" />
      <StatCard title="Años de Registros" value={años.size} icon="📅" color="#8b5cf6" />
    </div>
  </section>

  <!-- Featured events -->
  <section class="page-container">
    <FeaturedEvents {eventos} />
  </section>

  <!-- About SNGR -->
  <section class="about page-container">
    <div class="about-card card">
      <h2>¿Qué es el SNGR?</h2>
      <p>El <strong>Servicio Nacional de Gestión de Riesgos y Emergencias (SNGR)</strong> es el organismo rector de la gestión de riesgos en Ecuador. Su misión es reducir la vulnerabilidad ante desastres naturales y de origen antrópico, coordinando acciones de prevención, respuesta y recuperación.</p>
      <p>Este geoportal ofrece acceso público a la información de eventos adversos registrados por el SNGR a nivel nacional, incluyendo deslizamientos, inundaciones, sismos, erupciones volcánicas y otros fenómenos.</p>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <h2>Explora los datos en detalle</h2>
    <div class="cta-buttons">
      <button class="btn-primary" on:click={() => goto('/geoportal')}>🗺️ Abrir Geoportal</button>
      <button class="btn-secondary" on:click={() => goto('/dashboard')}>📊 Ver Estadísticas</button>
    </div>
  </section>
</div>

<style>
.home { display: flex; flex-direction: column; }
.hero {
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  color: white; padding: 80px 16px; text-align: center;
}
.hero-content { max-width: 700px; margin: 0 auto; }
h1 { font-size: clamp(1.8rem, 5vw, 2.8rem); font-weight: 800; margin-bottom: 16px; color: white; line-height: 1.2; }
.hero p { font-size: 1.1rem; color: #cbd5e1; margin-bottom: 32px; }
.cta-buttons { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-primary {
  background: #2564eb; color: white; border: none; border-radius: 10px;
  padding: 14px 28px; font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: opacity 0.15s;
}
.btn-primary:hover { opacity: 0.88; }
.btn-secondary {
  background: rgba(255,255,255,0.12); color: white; border: 1px solid rgba(255,255,255,0.3);
  border-radius: 10px; padding: 14px 28px; font-size: 1rem; font-weight: 700; cursor: pointer;
  transition: background 0.15s;
}
.btn-secondary:hover { background: rgba(255,255,255,0.2); }
.stats-section { padding: 40px 16px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.about { padding: 40px 16px; }
.cta-section {
  background: var(--color--surface-2); padding: 60px 16px; text-align: center;
}
.cta-section h2 { margin-bottom: 24px; }
.cta-section .btn-primary { background: var(--color--primary); }
.cta-section .btn-secondary {
  background: transparent; color: var(--color--text);
  border: 1px solid var(--color--border);
}
</style>
