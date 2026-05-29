import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reportesService } from '../services/reportes.service.js';

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Marcador circular sin assets de imagen (evita el bug de iconos de Leaflet con bundlers).
function pinIcon(num) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#1c74e9;color:#fff;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.4);border:2px solid #fff"><span style="transform:rotate(45deg);font-size:12px;font-weight:700">${num}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="flex-1 bg-surface-container dark:bg-surface-container-dark rounded-xl border border-surface-container-highest dark:border-slate-800 p-4">
      <div className={`flex items-center gap-2 ${color}`}>
        <span className="material-symbols-outlined text-lg">{icon}</span>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 font-medium uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default function Reportes() {
  const today = new Date();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    reportesService.getReporteDiario(toDateStr(today))
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Limpia el mapa al desmontar.
  useEffect(() => () => {
    mapInstance.current?.remove();
    mapInstance.current = null;
  }, []);

  // Inicializa el mapa (cuando el contenedor ya está montado) y pinta los puntos.
  useEffect(() => {
    if (!mapRef.current) return; // el contenedor solo existe tras cargar los datos

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, { zoomControl: true }).setView([5.6349, -73.5685], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(mapInstance.current);
      layerRef.current = L.layerGroup().addTo(mapInstance.current);
    }

    const map = mapInstance.current;
    const layer = layerRef.current;
    layer.clearLayers();

    // Recalcula el tamaño tras montar el contenedor (evita el mapa en blanco).
    setTimeout(() => map.invalidateSize(), 100);

    const puntos = data?.puntos ?? [];
    if (puntos.length === 0) return;

    const latlngs = [];
    puntos.forEach((p, i) => {
      const ll = [p.lat, p.lng];
      latlngs.push(ll);
      L.marker(ll, { icon: pinIcon(i + 1) })
        .bindPopup(`<b>${p.nombre ?? 'Visita'}</b>${p.hora ? `<br/>${p.hora}` : ''}${p.direccion ? `<br/><span style="color:#64748b">${p.direccion}</span>` : ''}`)
        .addTo(layer);
    });

    // Línea del recorrido si hay 2+ puntos.
    if (latlngs.length >= 2) {
      L.polyline(latlngs, { color: '#1c74e9', weight: 3, opacity: 0.5, dashArray: '6 6' }).addTo(layer);
    }

    map.fitBounds(L.latLngBounds(latlngs).pad(0.25), { maxZoom: 16 });
    setTimeout(() => map.invalidateSize(), 100);
  }, [data]);

  return (
    <div className="flex flex-col w-full">
      <header className="sticky top-0 z-[500] bg-surface dark:bg-surface-dark border-b border-surface-container-highest dark:border-slate-800 px-4 py-4 flex items-center justify-center">
        <h1 className="text-lg font-bold text-on-surface dark:text-white tracking-tight">Reportes del Día</h1>
      </header>

      <main className="px-4 py-4 space-y-5">
        <p className="text-sm text-on-surface-variant dark:text-slate-400 capitalize">
          {today.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

        {loading && (
          <div className="flex justify-center py-10">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
            <span className="material-symbols-outlined text-rose-500">wifi_off</span>
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Conteos */}
            <div className="flex gap-3">
              <StatCard label="Completadas" value={data.completadas} color="text-emerald-600 dark:text-emerald-400" icon="task_alt" />
              <StatCard label="Faltan" value={data.faltan} color="text-amber-600 dark:text-amber-400" icon="pending_actions" />
              <StatCard label="Total" value={data.total} color="text-primary" icon="map" />
            </div>

            {/* Barra de progreso */}
            <div>
              <div className="flex justify-between text-xs text-on-surface-variant dark:text-slate-400 mb-1 font-medium">
                <span>Progreso del día</span>
                <span>{data.total > 0 ? Math.round((data.completadas / data.total) * 100) : 0}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-surface-container-highest dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${data.total > 0 ? (data.completadas / data.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Mapa del recorrido */}
            <div>
              <h3 className="text-sm font-bold text-on-surface dark:text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-primary">route</span>
                Recorrido de hoy
                <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                  {data.puntos.length} {data.puntos.length === 1 ? 'parada' : 'paradas'}
                </span>
              </h3>
              <div className="relative rounded-xl overflow-hidden border border-surface-container-highest dark:border-slate-800">
                <div ref={mapRef} className="h-72 w-full bg-surface-container dark:bg-slate-800" />
                {data.puntos.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface/80 dark:bg-surface-dark/80 pointer-events-none">
                    <span className="material-symbols-outlined text-4xl text-slate-400">location_off</span>
                    <p className="text-sm text-on-surface-variant dark:text-slate-400">Aún no hay visitas registradas hoy</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
