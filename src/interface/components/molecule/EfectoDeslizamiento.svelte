<!-- src/interface/componentes/molecule/EfectoDeslizamiento.svelte -->
<script lang="ts">
  export let alto = 36;
  export let piezas = 14;

  const bloques = Array.from({ length: piezas }, (_, i) => {
    const delay = (i * 0.5) % 4;
    const dur = 3 + (i % 3) * 0.8;
    return { i, delay, dur };
  });
</script>

<div class="desprendimiento" style={`--alto:${alto}px`} aria-hidden="true">
  <div class="fila">
    {#each bloques as b (b.i)}
      <span
        class="bloque"
        style={`
          animation-delay:${b.delay}s;
          animation-duration:${b.dur}s;
        `}
      />
    {/each}
  </div>
</div>

<style>
  .desprendimiento {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;

    height: var(--alto);
    pointer-events: none;
    overflow: visible;
  }

  /* fila perfectamente uniforme */
  .fila {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .bloque {
    flex: 1; /* uno al lado del otro */
    height: 100%;

    background: linear-gradient(
  to bottom,
  var(--color--background) 0%,
  var(--color--background) 45%,
  var(--color--border) 100%
);


    animation-name: caer;
    animation-timing-function: cubic-bezier(.2,.8,.2,1);
    animation-iteration-count: infinite;
  }

  @keyframes caer {
    0% {
      transform: translateY(0);
      opacity: 1;
    }
    75% {
      transform: translateY(0);
      opacity: 1;
    }
    100% {
      transform: translateY(60px);
      opacity: 0;
    }
  }

  @media (max-width: 700px) {
    .desprendimiento {
      height: 26px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .bloque {
      animation: none;
      opacity: 0.3;
    }
  }
</style>
