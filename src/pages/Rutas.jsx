import { useState, useEffect } from 'react';
import { rutasService } from '../services/rutas.service.js';

const DIAS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

const estadoStyle = {
  'En Progreso': 'border-primary text-primary bg-primary/10',
  'Pendiente':   'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  'Completado':  'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  'Futuro':      'border-slate-400 text-slate-500 bg-slate-50 dark:bg-slate-800/30',
};

const borderStyle = {
  'En Progreso': 'border-primary',
  'Pendiente':   'border-amber-500',
  'Completado':  'border-emerald-500',
  'Futuro':      'border-slate-400',
};

export default function Rutas() {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [expandedId, setExpandedId] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setExpandedId(null);
    rutasService.getTurnosByFecha(toDateStr(selectedDate))
      .then(setTurnos)
      .catch((err) => {
        setError(err.message);
        setTurnos([]);
      })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const selectDay = (day) => {
    setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
  };

  const isSelected = (day) =>
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === viewDate.getMonth() &&
    selectedDate.getFullYear() === viewDate.getFullYear();

  const isToday = (day) =>
    today.getDate() === day &&
    today.getMonth() === viewDate.getMonth() &&
    today.getFullYear() === viewDate.getFullYear();

  const allVisitas = turnos.flatMap((t) => (t.rutas_visitas ?? []).map((v) => ({ ...v, turno: t })));

  return (
    <div className="flex flex-col w-full">
      <header className="sticky top-0 z-10 bg-surface dark:bg-surface-dark border-b border-surface-container-highest dark:border-slate-800 px-4 py-4 flex items-center justify-center">
        <h1 className="text-lg font-bold text-on-surface dark:text-white tracking-tight">Agenda de Rutas</h1>
      </header>

      <main className="px-4 py-2 space-y-6">

        {/* Calendario */}
        <section className="bg-surface-container dark:bg-surface-container-dark mt-4 shadow-sm border border-surface-container-highest dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest dark:hover:bg-slate-700 text-on-surface-variant dark:text-slate-300">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <p className="text-sm font-bold text-on-surface dark:text-white">
              {MESES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </p>
            <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest dark:hover:bg-slate-700 text-on-surface-variant dark:text-slate-300">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-7 text-center mb-2">
            {DIAS.map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-on-surface-variant/50 dark:text-slate-500">{d}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="h-8" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const tod = isToday(day);
              return (
                <button
                  key={day}
                  onClick={() => selectDay(day)}
                  className={`h-8 w-full flex items-center justify-center text-sm font-medium rounded-full transition-colors ${
                    selected
                      ? 'bg-primary text-white font-bold'
                      : tod
                      ? 'border border-primary text-primary'
                      : 'text-on-surface dark:text-slate-300 hover:bg-surface-container-highest dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </section>

        {/* Lista de visitas */}
        <section>
          <h3 className="text-on-surface dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
            {selectedDate.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            {!loading && (
              <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                {allVisitas.length} {allVisitas.length === 1 ? 'sitio' : 'sitios'}
              </span>
            )}
          </h3>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-surface-container dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <span className="material-symbols-outlined text-rose-500">wifi_off</span>
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}

          {!loading && !error && allVisitas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 opacity-50">
              <span className="material-symbols-outlined text-4xl text-slate-400">event_busy</span>
              <p className="text-sm text-on-surface-variant dark:text-slate-400">Sin visitas para esta fecha</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-3">
              {allVisitas.map((visita) => (
                <div
                  key={visita.id_rutas}
                  className="flex flex-col bg-surface-container dark:bg-surface-container-dark rounded-xl shadow-sm border border-surface-container-highest dark:border-slate-800 overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-300"
                  onClick={() => setExpandedId(expandedId === visita.id_rutas ? null : visita.id_rutas)}
                >
                  <div className={`p-4 flex justify-between items-start border-l-4 ${borderStyle[visita.estado] ?? 'border-slate-400'}`}>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">storefront</span>
                      </div>
                      <div>
                        <p className="text-on-surface dark:text-white text-sm font-bold leading-tight">{visita.sujeto?.razon_social}</p>
                        <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">
                          {visita.turno?.hora_inicio} – {visita.turno?.hora_fin} • {visita.sujeto?.barrio}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${estadoStyle[visita.estado] ?? estadoStyle['Futuro']}`}>
                        {visita.estado}
                      </span>
                      <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${expandedId === visita.id_rutas ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </div>
                  </div>

                  {expandedId === visita.id_rutas && (
                    <div className="px-4 pb-4 pt-2 bg-primary/5 dark:bg-slate-800/30 border-t border-surface-container-highest dark:border-slate-800">
                      <div className="space-y-3 mt-2">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-slate-500 text-sm mt-0.5">location_on</span>
                          <div>
                            <p className="text-xs font-bold text-on-surface dark:text-white">Ubicación</p>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400">{visita.sujeto?.direccion_fisica}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-slate-500 text-sm mt-0.5">corporate_fare</span>
                          <div>
                            <p className="text-xs font-bold text-on-surface dark:text-white">NIT</p>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400">{visita.sujeto?.nit ?? '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-slate-500 text-sm mt-0.5">map</span>
                          <div>
                            <p className="text-xs font-bold text-on-surface dark:text-white">Zona</p>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400">{visita.sujeto?.zona} – {visita.sujeto?.barrio}</p>
                          </div>
                        </div>
                        <button className="w-full mt-3 bg-primary text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                          <span className="material-symbols-outlined text-sm">play_circle</span>
                          Iniciar Inspección
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
