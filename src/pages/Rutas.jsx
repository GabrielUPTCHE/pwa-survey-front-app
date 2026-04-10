import React, { useState, useEffect } from 'react';

export default function Rutas() {
  // Estado para controlar qué tarjeta está expandida (acordeón)
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visitas, setVisitas] = useState([]);

  // Datos de ejemplo (fallback)
  const fallbackVisitas = [
    {
      id: 1,
      hora: "09:00 AM",
      nombre: "Panadería El Trigo Dorado",
      estado: "En Progreso",
      barrio: "Sector Centro - Manzana A",
      ubicacion: "Calle 45 # 12-34",
      tipo: "Comercial - Alimentos",
      icono: "bakery_dining",
      activa: true,
    },
    {
      id: 2,
      hora: "11:30 AM",
      nombre: "Ferretería Tuerca y Tornillo",
      estado: "Pendiente",
      barrio: "Zona Industrial - Bodega 4",
      ubicacion: "Av. Principal # 8-22",
      tipo: "Comercial - Materiales",
      icono: "hardware",
      activa: true,
    },
    {
      id: 3,
      hora: "02:00 PM",
      nombre: "Droguería La Salud",
      estado: "Futuro",
      barrio: "Barrio Los Pinos",
      ubicacion: "Cra 15 # 22-10",
      tipo: "Comercial - Farmacia",
      icono: "local_pharmacy",
      activa: false,
    }
  ];

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        // Intentamos cargar de la API. 
        // Gracias al Service Worker (StaleWhileRevalidate), esto devolverá 
        // la versión cacheada casi instantáneamente si estamos offline.
        const response = await fetch('/api/rutas');
        if (response.ok) {
          const data = await response.json();
          setVisitas(data);
        } else {
          setVisitas(fallbackVisitas);
        }
      } catch (error) {
        console.log("Cargando datos desde el caché o fallback...");
        setVisitas(fallbackVisitas);
      } finally {
        setLoading(false);
      }
    };

    fetchRutas();
  }, []);

  // Función para abrir/cerrar detalles
  const toggleDetalles = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Header Específico de la sección */}
      <header className="sticky top-0 z-10 bg-surface dark:bg-surface-dark border-b border-surface-container-highest dark:border-slate-800 px-4 py-4 flex items-center justify-center">
        <h1 className="text-lg font-bold text-on-surface dark:text-white tracking-tight">Agenda de Rutas</h1>
      </header>

      <main className="px-4 py-2 space-y-6">
        
        {/* Componente del Calendario */}
        <section className="bg-surface-container dark:bg-surface-container-dark mt-4 shadow-sm border border-surface-container-highest dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest dark:hover:bg-slate-700 text-on-surface-variant dark:text-slate-300">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <p className="text-sm font-bold text-on-surface dark:text-white">Octubre 2024</p>
            <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-surface-container-highest dark:hover:bg-slate-700 text-on-surface-variant dark:text-slate-300">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          
          <div className="grid grid-cols-7 text-center mb-2">
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((dia, i) => (
              <span key={i} className="text-[10px] font-bold text-on-surface-variant/50 dark:text-slate-500">{dia}</span>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-y-2">
            <div className="h-8"></div><div className="h-8"></div><div className="h-8"></div>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
              <button 
                key={num}
                className={`h-8 w-full flex items-center justify-center text-sm ${
                  num === 5 
                    ? "font-bold text-white relative" 
                    : "font-medium text-on-surface dark:text-slate-300 hover:bg-surface-container-highest dark:hover:bg-slate-800 rounded-full"
                }`}
              >
                {num === 5 && <div className="absolute inset-1 bg-primary rounded-full -z-10"></div>}
                {num}
              </button>
            ))}
          </div>
        </section>

        {/* Lista de Sitios a Visitar */}
        <section>
          <h3 className="text-on-surface dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
            Ruta de Hoy
            {!loading && (
              <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                {visitas.length} Sitios
              </span>
            )}
          </h3>

          <div className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-50">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
                <p className="text-sm">Cargando agenda...</p>
              </div>
            ) : (
              visitas.map((visita) => (
                <div 
                  key={visita.id} 
                  className={`flex flex-col bg-surface-container dark:bg-surface-container-dark rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${
                    visita.activa 
                      ? "border-surface-container-highest dark:border-slate-800 cursor-pointer hover:border-primary/50" 
                      : "border-transparent opacity-60 grayscale pointer-events-none"
                  }`}
                >
                  <div 
                    onClick={() => visita.activa && toggleDetalles(visita.id)}
                    className={`p-4 flex justify-between items-start border-l-4 ${
                      visita.estado === 'En Progreso' ? 'border-primary' : visita.estado === 'Pendiente' ? 'border-amber-500' : 'border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">{visita.icono}</span>
                      </div>
                      <div>
                        <p className="text-on-surface dark:text-white text-sm font-bold leading-tight">{visita.nombre}</p>
                        <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">{visita.hora} • {visita.barrio}</p>
                      </div>
                    </div>
                    
                    {visita.activa ? (
                      <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${expandedId === visita.id ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-400">lock</span>
                    )}
                  </div>

                  {expandedId === visita.id && (
                    <div className="px-4 pb-4 pt-2 bg-primary/5 dark:bg-slate-800/30 border-t border-surface-container-highest dark:border-slate-800">
                      <div className="space-y-3 mt-2">
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-slate-500 text-sm mt-0.5">location_on</span>
                          <div>
                            <p className="text-xs font-bold text-on-surface dark:text-white">Ubicación</p>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400">{visita.ubicacion}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-slate-500 text-sm mt-0.5">storefront</span>
                          <div>
                            <p className="text-xs font-bold text-on-surface dark:text-white">Tipo de Negocio</p>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400">{visita.tipo}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-slate-500 text-sm mt-0.5">schedule</span>
                          <div>
                            <p className="text-xs font-bold text-on-surface dark:text-white">Horario Programado</p>
                            <p className="text-xs text-on-surface-variant dark:text-slate-400">De {visita.hora} a {visita.hora.replace("09:00 AM", "11:00 AM").replace("11:30 AM", "01:00 PM")}</p>
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
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}