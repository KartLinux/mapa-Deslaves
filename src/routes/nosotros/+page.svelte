<svelte:head>
  <title>Nosotros - SNGR Ecuador</title>
</svelte:head>

<div class="page-container">
  <h1>🏛️ Sobre el SNGR</h1>

  <div class="card" style="margin-bottom: 24px">
    <h2>Misión</h2>
    <p>El Servicio Nacional de Gestión de Riesgos y Emergencias (SNGR) tiene como misión liderar, coordinar y ejecutar la política pública de gestión de riesgos para reducir la vulnerabilidad de la sociedad ecuatoriana ante desastres naturales y de origen antrópico.</p>
  </div>

  <div class="card" style="margin-bottom: 24px">
    <h2>¿Qué es este Geoportal?</h2>
    <p>Este geoportal es una herramienta de visualización y análisis de los eventos adversos registrados en Ecuador. Permite a ciudadanos, investigadores y tomadores de decisiones acceder a información geoespacial sobre desastres naturales, con datos históricos desde 2010 hasta la actualidad.</p>
  </div>

  <div class="card" style="margin-bottom: 24px">
    <h2>Fuentes de Datos</h2>
    <ul>
      <li>Sistema de información del SNGR (datos primarios)</li>
      <li>Instituto Geográfico Militar (IGM) - capas cartográficas</li>
      <li>INAMHI - datos hidrometeorológicos</li>
      <li>OpenStreetMap - cartografía base</li>
      <li>SoilGrids / ISRIC - texturas de suelo</li>
      <li>FAO - agua superficial global</li>
    </ul>
  </div>

  <div class="card">
    <h2>Metodología</h2>
    <p>Los datos son recopilados a partir de reportes oficiales del SNGR, validados y geocodificados para su visualización en el geoportal. Los niveles de eventos (1-4) reflejan la magnitud e impacto del evento según la clasificación oficial del SNGR.</p>
  </div>
</div>

<style>
h1 { margin-bottom: 24px; }
ul { padding-left: 20px; color: var(--color--text); }
li { margin-bottom: 8px; }
</style>
