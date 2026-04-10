import React from 'react';
import ActionButton from '../components/ui/ActionButton';
import Badge from '../components/ui/Badge';

export default function Inicio() {
  return (
    <>
      {/* Sección de Perfil del Usuario */}
      <section className="p-4 mt-2">
        <div className="bg-surface-container dark:bg-surface-container-dark rounded-xl p-5 shadow-sm border border-surface-container-highest dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-primary/10 rounded-full p-1 border-2 border-primary">
                <img 
                  alt="Avatar del entrevistador" 
                  className="h-16 w-16 rounded-full object-cover" 
                  src="https://ui-avatars.com/api/?name=Marco+Antonio&background=1c74e9&color=fff" 
                />
              </div>
              <div className="absolute bottom-0 right-0 h-4 w-4 bg-emerald-500 border-2 border-surface-container dark:border-surface-container-dark rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <p className="text-on-surface-variant dark:text-slate-400 text-xs font-semibold uppercase tracking-widest">Bienvenido de nuevo</p>
              <p className="text-on-surface dark:text-white text-xl font-bold leading-tight">Marco Antonio Solís</p>
              
              {/* ¡USANDO EL COMPONENTE BADGE! */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="neutral">ID: 48293</Badge>
                <Badge variant="neutral">Zona Urbana 04</Badge>
              </div>
              
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-surface-container-highest dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-sm">sync</span>
              <p className="text-on-surface-variant dark:text-slate-400 text-xs font-medium">Sincronizado: hace 5 min</p>
            </div>
            
            {/* ¡USANDO EL ACTION BUTTON! (Variante Ghost para quitar el padding extra y fondo) */}
            <ActionButton variant="ghost" className="!px-2 !py-1 !text-xs">
              Sincronizar ahora
            </ActionButton>
            
          </div>
        </div>
      </section>

      {/* Grid de Módulos Principales */}
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

        {/* Sección de Acceso Rápido */}
        <div className="mt-8 bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-primary font-bold text-sm uppercase tracking-wider">Actividad Reciente</h4>
            
            {/* ¡OTRO ACTION BUTTON! */}
            <ActionButton variant="ghost" className="!p-1 !rounded-full">
               <span className="material-symbols-outlined">arrow_forward_ios</span>
            </ActionButton>
            
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-surface-container/50 dark:bg-surface-container-dark/50 p-3 rounded-lg">
              <span className="material-symbols-outlined text-slate-400">description</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-on-surface dark:text-white">Encuesta Residencial #102</p>
                <p className="text-[10px] text-on-surface-variant dark:text-slate-400">Completada hace 2 horas</p>
              </div>
              {/* ¡USANDO BADGE! */}
              <Badge variant="success">ENVIADO</Badge>
            </div>
            
            <div className="flex items-center gap-3 bg-surface-container/50 dark:bg-surface-container-dark/50 p-3 rounded-lg">
              <span className="material-symbols-outlined text-slate-400">description</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-on-surface dark:text-white">Registro Comercial - Panadería</p>
                <p className="text-[10px] text-on-surface-variant dark:text-slate-400">Guardado localmente</p>
              </div>
              {/* ¡USANDO BADGE! */}
              <Badge variant="warning">PENDIENTE</Badge>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}