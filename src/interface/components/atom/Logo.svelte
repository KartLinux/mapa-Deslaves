<script lang="ts">
  export let texto = "Geoportal Nacional de Riesgos";
</script>

<span class="logo" aria-label={texto}>
  <span class="insignia" aria-hidden="true">
    <span></span>
  </span>
  <span class="texto">
    <strong>Geoportal</strong>
    <small>{texto}</small>
  </span>
</span>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    user-select: none;
  }

  .insignia {
    position: relative;
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    border-radius: 14px;
    background: linear-gradient(135deg, var(--color--primary), var(--color--accent));
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .insignia span {
    position: absolute;
    inset: 8px;
    border: 2px solid rgba(255, 255, 255, 0.92);
    border-radius: 10px 10px 14px 14px;
    transform: rotate(45deg);
  }

  .texto {
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1;
  }

  .texto strong {
    font-size: 15px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color--text);
  }

  .texto small {
    margin-top: 5px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color--text-soft);
    max-width: 22ch;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 1180px) {
    .texto small {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .logo {
      gap: 10px;
    }

    .insignia {
      width: 38px;
      height: 38px;
      border-radius: 12px;
    }

    .insignia span {
      inset: 7px;
    }

    .texto strong {
      font-size: 13px;
    }

    .texto small {
      display: none;
    }
  }
</style>
