import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPendingEncuestas, deletePendingEncuesta, countPendingEncuestas, updateEncuestaStatus } from '../services/idb.service.js';
import { encuestasService } from '../services/encuestas.service.js';
import { apiFetch } from '../services/api.js';
import Badge from '../components/ui/Badge';
import ActionButton from '../components/ui/ActionButton';
import Swal from 'sweetalert2';

export default function Inicio() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [recientes, setRecientes] = useState([]);
  const [syncing, setSyncing] = useState(false);

  const loadPendingCount = useCallback(async () => {
    try {
      const count = await countPendingEncuestas();
      setPendingCount(count);
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadPendingCount();

    apiFetch('/rutas-visitas/recientes')
      .then(setRecientes)
      .catch(() => setRecientes([]));
  }, [loadPendingCount]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const pending = await getPendingEncuestas();
      if (pending.length === 0) {
        Swal.fire({ icon: 'info', title: 'Sin pendientes', text: 'No hay encuestas pendientes de sincronizar.', confirmButtonColor: '#3b82f6' });
        return;
      }

      let success = 0;
      let failed = 0;

      for (const encuesta of pending) {
        try {
          const fd = new FormData();
          fd.append('id_sujeto', encuesta.id_sujeto);
          fd.append('id_tipo_documento', encuesta.id_tipo_documento);
          fd.append('id_acta', encuesta.id_acta);
          if (encuesta.id_rutas) fd.append('id_rutas', encuesta.id_rutas);
          if (encuesta.latitud != null) fd.append('latitud', encuesta.latitud);
          if (encuesta.longitud != null) fd.append('longitud', encuesta.longitud);
          if (encuesta.archivos) {
            encuesta.archivos.forEach((file) => fd.append('evidencias', file));
          }
          await encuestasService.crearDocumento(fd);
          await updateEncuestaStatus(encuesta.id, 'synced');
          await deletePendingEncuesta(encuesta.id);
          success++;
        } catch (_) {
          await updateEncuestaStatus(encuesta.id, 'error');
          failed++;
        }
      }

      await loadPendingCount();
      Swal.fire({
        icon: failed === 0 ? 'success' : 'warning',
        title: 'Sincronización completa',
        text: `${success} enviada(s) correctamente${failed > 0 ? `, ${failed} fallaron (sin conexión aún).` : '.'}`,
        confirmButtonColor: '#3b82f6',
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message, confirmButtonColor: '#ef4444' });
    } finally {
      setSyncing(false);
    }
  };

  const estadoColor = (estado) => {
    if (estado === 'Completado') return 'success';
    if (estado === 'En Progreso') return 'primary';
    if (estado === 'Pendiente') return 'warning';
    return 'neutral';
  };

  const initialsOf = (nombre = '', apellido = '') =>
    `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

  return (
    <>
      {/* Perfil */}
      <section className="p-4 mt-2">
        <div className="bg-surface-container dark:bg-surface-container-dark rounded-xl p-5 shadow-sm border border-surface-container-highest dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-primary/10 rounded-full p-1 border-2 border-primary">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold select-none">
                  {initialsOf(user?.nombre, user?.apellido)}
                </div>
              </div>
              {pendingCount > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 border-2 border-surface-container dark:border-surface-container-dark rounded-full flex items-center justify-center">
                  <span className="text-[9px] text-white font-bold">{pendingCount}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <p className="text-on-surface-variant dark:text-slate-400 text-xs font-semibold uppercase tracking-widest">Bienvenido de nuevo</p>
              <p className="text-on-surface dark:text-white text-xl font-bold leading-tight">
                {user ? `${user.nombre} ${user.apellido}` : '—'}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="neutral">ID: {user?.numero_identificacion ?? '—'}</Badge>
                <Badge variant="primary">{user?.nombre_rol ?? '—'}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-surface-container-highest dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              {pendingCount > 0 ? (
                <>
                  <span className="material-symbols-outlined text-amber-500 text-sm">cloud_off</span>
                  <p className="text-amber-600 dark:text-amber-400 text-xs font-medium">{pendingCount} encuesta(s) pendiente(s)</p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-emerald-500 text-sm">cloud_done</span>
                  <p className="text-on-surface-variant dark:text-slate-400 text-xs font-medium">Todo sincronizado</p>
                </>
              )}
            </div>
            <ActionButton variant="ghost" className="!px-2 !py-1 !text-xs" onClick={handleSync} disabled={syncing}>
              {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
            </ActionButton>
          </div>
        </div>
      </section>

      {/* Módulos */}
      <main className="px-4">
        <h2 className="text-on-surface dark:text-white text-lg font-bold mb-4 px-1">Módulos Principales</h2>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col gap-4 bg-surface-container dark:bg-surface-container-dark p-5 rounded-xl border border-surface-container-highest dark:border-slate-800 shadow-sm hover:border-primary transition-colors text-left group">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">assignment</span>
            </div>
            <div>
              <h3 className="text-on-surface dark:text-white font-bold text-sm leading-snug">Mis Encuestas</h3>
              <p className="text-on-surface-variant dark:text-slate-400 text-xs mt-1">Borradores y completadas</p>
            </div>
          </button>
          <button className="flex flex-col gap-4 bg-surface-container dark:bg-surface-container-dark p-5 rounded-xl border border-surface-container-highest dark:border-slate-800 shadow-sm hover:border-primary transition-colors text-left group">
            <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">map</span>
            </div>
            <div>
              <h3 className="text-on-surface dark:text-white font-bold text-sm leading-snug">Zonas Asignadas</h3>
              <p className="text-on-surface-variant dark:text-slate-400 text-xs mt-1">Ver mapa de trabajo</p>
            </div>
          </button>
        </div>

        {/* Actividad reciente */}
        <div className="mt-8 bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-primary font-bold text-sm uppercase tracking-wider">Actividad Reciente</h4>
          </div>
          <div className="space-y-3">
            {recientes.length === 0 ? (
              <p className="text-xs text-on-surface-variant dark:text-slate-500 text-center py-4">Sin actividad reciente</p>
            ) : (
              recientes.slice(0, 5).map((visita) => (
                <div key={visita.id_rutas} className="flex items-center gap-3 bg-surface-container/50 dark:bg-surface-container-dark/50 p-3 rounded-lg">
                  <span className="material-symbols-outlined text-slate-400">description</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-on-surface dark:text-white">{visita.sujeto?.razon_social ?? 'Visita'}</p>
                    <p className="text-[10px] text-on-surface-variant dark:text-slate-400">{visita.fecha_programada}</p>
                  </div>
                  <Badge variant={estadoColor(visita.estado)}>{visita.estado?.toUpperCase()}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </>
  );
}
