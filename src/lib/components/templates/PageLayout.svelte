<script lang="ts">
  // Wrapper template - Header and Footer are already in +layout.svelte
</script>

<div class="page-wrapper">
  <slot />
</div>

<style>
.page-wrapper {
  width: 100%;
  min-height: 100%;
}
</style>
