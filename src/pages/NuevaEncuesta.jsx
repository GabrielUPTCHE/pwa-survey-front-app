// src/pages/NuevaEncuesta.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NuevaEncuesta() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen w-full bg-surface dark:bg-surface-dark text-on-surface dark:text-white font-display">
      
      {/* Header Específico con Botón de Atrás */}
      <header className="sticky top-0 z-10 bg-surface-container dark:bg-surface-container-dark border-b border-surface-container-highest dark:border-slate-800 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight">Nueva Encuesta</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-8">
        <div className="max-w-md mx-auto p-4 space-y-6 mt-2">
          
          {/* Sección de Identificación */}
          <section className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">Número de Identificación</label>
              <input 
                className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400" 
                placeholder="Ingrese el número de documento" 
                type="text"
              />
            </div>
            
            <div className="flex flex-col gap-2 opacity-80">
              <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">ID del Acta</label>
              <div className="flex items-center w-full h-14 px-4 rounded-xl border border-surface-container-highest dark:border-slate-700 bg-surface dark:bg-slate-900 text-slate-500 cursor-not-allowed">
                <span className="material-symbols-outlined mr-2 text-sm">lock</span>
                <span>ACTA-2024-001</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 opacity-80">
              <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">URL Documento Generado</label>
              <div className="flex items-center w-full h-14 px-4 rounded-xl border border-surface-container-highest dark:border-slate-700 bg-surface dark:bg-slate-900 text-slate-500 cursor-not-allowed overflow-hidden">
                <span className="material-symbols-outlined mr-2 text-sm">link</span>
                <span className="truncate text-sm">https://census-docs.gov/v1/generated/report_001.pdf</span>
              </div>
            </div>
          </section>

          {/* Sección de Firma */}
          <section className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">URL Firma Digital</label>
              <div className="relative">
                <input 
                  className="w-full h-14 px-4 pr-12 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400" 
                  placeholder="Enlace de firma o token" 
                  type="text"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary">draw</span>
              </div>
            </div>
          </section>

          {/* Sección de Evidencias */}
          <section className="space-y-4">
            <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">Subir Evidencias</label>
            <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 bg-primary/5 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:bg-primary/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-on-surface dark:text-slate-100">Presiona para subir o arrastra archivos</p>
                <p className="text-xs text-on-surface-variant">Soporta JPG, PNG y PDF (Máx. 10MB)</p>
              </div>
            </div>
            
            {/* Etiquetas de Archivos */}
            <div className="flex gap-3 px-1">
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-container dark:bg-slate-800 border border-surface-container-highest dark:border-slate-700 rounded-lg text-xs font-medium">
                <span className="material-symbols-outlined text-orange-500 text-lg">image</span> JPG
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-container dark:bg-slate-800 border border-surface-container-highest dark:border-slate-700 rounded-lg text-xs font-medium">
                <span className="material-symbols-outlined text-blue-500 text-lg">image</span> PNG
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-surface-container dark:bg-slate-800 border border-surface-container-highest dark:border-slate-700 rounded-lg text-xs font-medium">
                <span className="material-symbols-outlined text-red-500 text-lg">picture_as_pdf</span> PDF
              </div>
            </div>
          </section>

          {/* Botón de Enviar */}
          <div className="pt-6">
            <button className="w-full bg-primary hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95">
              <span className="material-symbols-outlined">send</span>
              Guardar Encuesta
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}