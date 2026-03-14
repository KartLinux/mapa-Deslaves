<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';
</script>

<button class="btn btn--{variant} btn--{size}" {disabled} {type} on:click>
  <slot />
</button>

<style>
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border: none; border-radius: 8px; cursor: pointer; font-weight: 600;
  transition: opacity 0.15s, transform 0.1s; text-decoration: none;
}
.btn:hover:not(:disabled) { opacity: 0.88; }
.btn:active:not(:disabled) { transform: scale(0.97); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn--primary { background: var(--color--primary); color: var(--color--primary-contrast); }
.btn--secondary { background: var(--color--surface-2); color: var(--color--text); border: 1px solid var(--color--border); }
.btn--ghost { background: transparent; color: var(--color--primary); }
.btn--sm { padding: 6px 14px; font-size: 0.85rem; }
.btn--md { padding: 10px 20px; font-size: 1rem; }
.btn--lg { padding: 14px 28px; font-size: 1.1rem; }
</style>
