<!-- src/interface/componentes/atomos/Logo.svelte -->
<script lang="ts">
  export let texto = "Desicion Support System";
</script>

<span class="logo" aria-label={texto}>
  <span class="marca">{texto}</span>
</span>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    user-select: none;
  }

  .marca {
    font-weight: 800;
    letter-spacing: 0.4px;
    color: var(--color--text);
  }
</style>
