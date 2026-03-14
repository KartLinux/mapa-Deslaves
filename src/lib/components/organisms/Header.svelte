<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  let menuOpen = false;

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/geoportal', label: 'Geoportal' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/nosotros', label: 'Nosotros' },
    { href: '/contacto', label: 'Contacto' },
  ];

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('tema', next);
  }

  function navigate(href: string) {
    menuOpen = false;
    goto(href);
  }
</script>

<header class="header">
  <div class="container">
    <a class="brand" href="/" on:click|preventDefault={() => navigate('/')}>
      🛡️ <span>Geoportal SNGR</span>
    </a>

    <nav class="nav desktop-nav">
      {#each navLinks as link}
        <a
          class="nav-link"
          class:active={page.url.pathname === link.href}
          href={link.href}
          on:click|preventDefault={() => navigate(link.href)}
        >{link.label}</a>
      {/each}
    </nav>

    <div class="actions">
      <button class="theme-btn" on:click={toggleTheme} aria-label="Cambiar tema">🌙</button>
      <button class="hamburger" on:click={() => menuOpen = !menuOpen} aria-label="Menú">
        {menuOpen ? '✕' : '☰'}
      </button>
    </div>
  </div>

  {#if menuOpen}
    <nav class="mobile-nav">
      {#each navLinks as link}
        <a
          class="mobile-link"
          class:active={page.url.pathname === link.href}
          href={link.href}
          on:click|preventDefault={() => navigate(link.href)}
        >{link.label}</a>
      {/each}
    </nav>
  {/if}
</header>

<style>
.header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(var(--color--text-rgb, 15,23,42), 0.04);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color--border);
}
.container {
  width: min(1200px, calc(100% - 32px)); margin: 0 auto;
  display: flex; align-items: center; gap: 16px; height: 60px;
}
.brand {
  display: flex; align-items: center; gap: 8px; font-weight: 800;
  font-size: 1.1rem; text-decoration: none; color: var(--color--text);
  white-space: nowrap;
}
.nav { display: flex; align-items: center; gap: 4px; flex: 1; }
.nav-link {
  padding: 6px 14px; border-radius: 8px; text-decoration: none;
  font-size: 0.92rem; font-weight: 600; color: var(--color--text-muted);
  transition: color 0.15s, background 0.15s;
}
.nav-link:hover, .nav-link.active {
  color: var(--color--primary);
  background: rgba(var(--color--primary-rgb), 0.08);
}
.actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.theme-btn, .hamburger {
  background: none; border: 1px solid var(--color--border); border-radius: 8px;
  padding: 6px 10px; cursor: pointer; font-size: 1rem;
  color: var(--color--text);
}
.hamburger { display: none; }
.mobile-nav {
  display: flex; flex-direction: column; padding: 12px;
  border-top: 1px solid var(--color--border);
  background: var(--color--surface);
}
.mobile-link {
  padding: 12px 16px; border-radius: 8px; text-decoration: none;
  font-weight: 600; color: var(--color--text);
}
.mobile-link.active { color: var(--color--primary); }
@media (max-width: 700px) {
  .desktop-nav { display: none; }
  .hamburger { display: block; }
}
</style>
