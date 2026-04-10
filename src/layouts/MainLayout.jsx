import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';

export default function MainLayout() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getNavLinkClass = ({ isActive }) => 
    `flex flex-col items-center gap-1 transition-colors ${
      isActive ? 'text-primary' : 'text-on-surface-variant dark:text-slate-400 hover:text-primary'
    }`;

  const getIconClass = (isActive) => 
    `material-symbols-outlined ${isActive ? 'fill-[1]' : ''}`;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-surface dark:bg-surface-dark overflow-x-hidden font-display text-on-surface dark:text-white antialiased">
      
      {/* Top Header */}
      <header className="flex items-center bg-surface-container dark:bg-surface-container-dark p-4 border-b border-surface-container-highest dark:border-slate-800 sticky top-0 z-10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary rounded-lg text-white">
          <span className="material-symbols-outlined text-2xl">analytics</span>
        </div>
        <div className="ml-3 flex-1">
          <h1 className="text-lg font-bold leading-tight tracking-tight">Censo 2024</h1>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
          isOnline 
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
        }`}>
          <span className={`h-2 w-2 rounded-full animate-pulse ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          <span className="text-xs font-bold uppercase tracking-wider">
            {isOnline ? 'En línea' : 'Sin conexión'}
          </span>
        </div>
      </header>

      {/* Contenido Dinámico (Páginas) */}
      <div className="flex-1 pb-28"> {/* Aumenté un poco el padding inferior para acomodar el safe-area */}
        <Outlet />
      </div>

      {/* Bottom Navigation Bar */}
      {/* Se agregó soporte para env(safe-area-inset-bottom) en el padding bottom */}
      <nav 
        className="fixed bottom-0 left-0 right-0 bg-surface-container dark:bg-surface-container-dark border-t border-surface-container-highest dark:border-slate-800 px-6 pt-3 flex justify-between items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        
        {/* ¡AQUÍ ESTÁ LA CORRECCIÓN! (Atributo 'end') */}
        <NavLink to="/" end className={getNavLinkClass}>
          {({ isActive }) => (
            <>
              <span className={getIconClass(isActive)}>home</span>
              <span className="text-[10px] font-bold">Inicio</span>
            </>
          )}
        </NavLink>
        
        <NavLink to="/calendario" className={getNavLinkClass}>
          {({ isActive }) => (
            <>
              <span className={getIconClass(isActive)}>route</span>
              <span className="text-[10px] font-bold text-center">Rutas</span>
            </>
          )}
        </NavLink>

        {/* Botón Principal de Nueva Encuesta */}
        <div className="relative -mt-12">
          {/* Se agregó aria-label por accesibilidad */}
          <Link 
            to="/nueva-encuesta" 
            aria-label="Crear nueva encuesta"
            className="bg-primary text-white h-14 w-14 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center border-4 border-surface dark:border-surface-dark transition-transform active:scale-90"
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </Link>
        </div>
        
        <NavLink to="/reportes" className={getNavLinkClass}>
          {({ isActive }) => (
            <>
              <span className={getIconClass(isActive)}>bar_chart</span>
              <span className="text-[10px] font-bold">Reportes</span>
            </>
          )}
        </NavLink>
        
        <NavLink to="/configuracion" className={getNavLinkClass}>
          {({ isActive }) => (
            <>
              <span className={getIconClass(isActive)}>settings</span>
              <span className="text-[10px] font-bold">Ajustes</span>
            </>
          )}
        </NavLink>

      </nav>
    </div>
  );
}