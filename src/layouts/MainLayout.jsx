import React from 'react';
import { Outlet, Link } from 'react-router-dom';
// Si usas React Router, puedes cambiar los <a> por <Link>
export default function MainLayout() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-surface dark:bg-surface-dark overflow-x-hidden font-display text-on-surface dark:text-white antialiased">
      
      {/* Top Header - Persistente */}
      <header className="flex items-center bg-surface-container dark:bg-surface-container-dark p-4 border-b border-surface-container-highest dark:border-slate-800 sticky top-0 z-10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary rounded-lg text-white">
          <span className="material-symbols-outlined">analytics</span>
        </div>
        <div className="ml-3 flex-1">
          <h1 className="text-lg font-bold leading-tight tracking-tight">Censo 2024</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold uppercase tracking-wider">En línea</span>
        </div>
      </header>

      {/* Contenido Dinámico (Páginas) */}
      <div className="flex-1 pb-24">
        <Outlet />
      </div>

      {/* Bottom Navigation Bar - Modificado según tus requerimientos */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-container dark:bg-surface-container-dark border-t border-surface-container-highest dark:border-slate-800 px-6 pb-6 pt-3 flex justify-between items-center z-20">
        
        <Link to="/" className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined fill-[1]">home</span>
          <span className="text-[10px] font-bold">Inicio</span>
        </Link>
        
        <Link to="/calendario" className="flex flex-col items-center gap-1 text-on-surface-variant dark:text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">route</span>
          <span className="text-[10px] font-bold text-center">Rutas</span>
        </Link>

        {/* ¡BOTÓN PRINCIPAL CONECTADO! */}
        <div className="relative -mt-12">
          <Link to="/nueva-encuesta" className="bg-primary text-white h-14 w-14 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center border-4 border-surface dark:border-surface-dark">
            <span className="material-symbols-outlined text-3xl">add</span>
          </Link>
        </div>
        
        <Link to="/reportes" className="flex flex-col items-center gap-1 text-on-surface-variant dark:text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">bar_chart</span>
          <span className="text-[10px] font-bold">Reportes</span>
        </Link>
        
        <Link to="/configuracion" className="flex flex-col items-center gap-1 text-on-surface-variant dark:text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold">Ajustes</span>
        </Link>

      </nav>
    </div>
  );
}