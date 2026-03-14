import { writable, derived } from 'svelte/store';
import type { Evento } from './types';
import { sumField } from './csvParser';

export const eventosStore = writable<Evento[]>([]);

export const filtros = writable({
  provincia: '',
  canton: '',
  tipoEvento: '',
  categoriaEvento: '',
  nivelEvento: '',
  añoDesde: '',
  añoHasta: '',
  textoBusqueda: ''
});

export const eventosFiltrados = derived([eventosStore, filtros], ([$eventos, $filtros]) => {
  return $eventos.filter(e => {
    if ($filtros.provincia && e.provincia !== $filtros.provincia) return false;
    if ($filtros.canton && e.canton !== $filtros.canton) return false;
    if ($filtros.tipoEvento && e.tipoEvento !== $filtros.tipoEvento) return false;
    if ($filtros.categoriaEvento && e.categoriaEvento !== $filtros.categoriaEvento) return false;
    if ($filtros.nivelEvento && e.nivelEvento !== $filtros.nivelEvento) return false;
    if ($filtros.añoDesde && e.año < parseInt($filtros.añoDesde)) return false;
    if ($filtros.añoHasta && e.año > parseInt($filtros.añoHasta)) return false;
    if ($filtros.textoBusqueda) {
      const q = $filtros.textoBusqueda.toLowerCase();
      if (!e.provincia.toLowerCase().includes(q) &&
          !e.canton.toLowerCase().includes(q) &&
          !e.tipoEvento.toLowerCase().includes(q) &&
          !e.descripcion.toLowerCase().includes(q)) return false;
    }
    return true;
  });
});

export const estadisticas = derived(eventosFiltrados, ($eventos) => ({
  total: $eventos.length,
  heridos: sumField($eventos, 'heridos'),
  afectadosDirectos: sumField($eventos, 'afectadosDirectos'),
  totalImpactados: sumField($eventos, 'totalImpactados'),
  viviendasAfectadas: sumField($eventos, 'viviendasAfectadas'),
  viviendasDestruidas: sumField($eventos, 'viviendasDestruidas'),
  muertosDesaparecidos: sumField($eventos, 'muertosDesaparecidos'),
  personasEvacuadas: sumField($eventos, 'personasEvacuadas'),
}));
