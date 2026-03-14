<script lang="ts">
  export let text: string = '';
  export let variant: 'primary' | 'danger' | 'warning' | 'success' | 'info' = 'primary';
</script>

<span class="badge badge--{variant}">{text}</span>

<style>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}
.badge--primary { background: rgba(37,99,235,0.12); color: #2564eb; }
.badge--danger { background: rgba(239,68,68,0.12); color: #ef4444; }
.badge--warning { background: rgba(245,158,11,0.12); color: #d97706; }
.badge--success { background: rgba(16,185,129,0.12); color: #10b981; }
.badge--info { background: rgba(59,130,246,0.12); color: #3b82f6; }
</style>
