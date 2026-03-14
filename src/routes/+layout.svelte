<script lang="ts">
  import { onMount } from 'svelte';
  import Header from '$lib/components/organisms/Header.svelte';
  import Footer from '$lib/components/organisms/Footer.svelte';
  import '../app.css';

  onMount(() => {
    const saved = localStorage.getItem('tema');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  });
</script>

<Header />
<main>
  <slot />
</main>
<Footer />

<style>
  main {
    flex: 1;
    min-height: 0;
  }
</style>
