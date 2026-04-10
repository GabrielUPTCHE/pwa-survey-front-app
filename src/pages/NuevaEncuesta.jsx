// src/pages/NuevaEncuesta.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// ==========================================
// SERVICIO DE INDEXED-DB (Guardado Offline)
// ==========================================
const saveEncuestaOffline = (encuestaData) => {
  return new Promise((resolve, reject) => {
    // Abrimos o creamos una base de datos llamada 'CensoDB'
    const request = indexedDB.open('CensoDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Creamos una tabla (Object Store) para las encuestas pendientes
      if (!db.objectStoreNames.contains('encuestas_pendientes')) {
        db.createObjectStore('encuestas_pendientes', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['encuestas_pendientes'], 'readwrite');
      const store = transaction.objectStore('encuestas_pendientes');
      
      // Guardamos la encuesta (Textos + Objetos File)
      const addRequest = store.add(encuestaData);
      
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = (e) => reject(e.target.error);
    };

    request.onerror = (event) => reject(event.target.error);
  });
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function NuevaEncuesta() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  
  // Estado de textos
  const [formData, setFormData] = useState({
    identificacion: '',
    idActa: 'ACTA-2024-001',
    firmaToken: ''
  });

  // Estado de archivos (Arreglo de objetos File)
  const [archivos, setArchivos] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejo de selección de archivos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Filtramos para asegurar límite de tamaño o tipo si lo deseas
    setArchivos(prev => [...prev, ...files]);
  };

  // Eliminar un archivo de la lista antes de enviar
  const removeFile = (index) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Preparamos los datos
    // Usamos FormData porque ahora enviamos archivos binarios
    const payload = new FormData();
    payload.append('identificacion', formData.identificacion);
    payload.append('idActa', formData.idActa);
    payload.append('firmaToken', formData.firmaToken);
    
    archivos.forEach((file) => {
      payload.append('evidencias', file);
    });

    try {
      // 2. Intentamos enviar al servidor directamente
      // NOTA: Quita el 'Content-Type' headers, fetch lo pone automáticamente en FormData
      const response = await fetch('/api/nueva-encuesta', {
        method: 'POST',
        body: payload 
      });

      if (response.ok) {
        MySwal.fire({
          icon: 'success',
          title: '¡Enviado!',
          text: 'La encuesta y sus archivos se han guardado en el servidor.',
          confirmButtonColor: '#3b82f6'
        });
        
        // Limpiamos
        setFormData({ identificacion: '', idActa: 'ACTA-2024-001', firmaToken: '' });
        setArchivos([]);
      } else {
        throw new Error('Error al enviar al servidor');
      }

    } catch (error) {
      console.log('Error detectado (Posiblemente Offline):', error);
      
      // 3. FALLA LA RED -> Guardamos en IndexedDB
      if (!navigator.onLine || error.message.includes('Failed to fetch')) {
        
        try {
          // Preparamos un objeto puro de JS para IndexedDB (soporta guardar Files nativamente)
          const offlineData = {
            identificacion: formData.identificacion,
            idActa: formData.idActa,
            firmaToken: formData.firmaToken,
            archivos: archivos, // Guardamos los File() directamente
            fechaGuardado: new Date().toISOString()
          };

          await saveEncuestaOffline(offlineData);

          MySwal.fire({
            icon: 'info',
            title: 'Guardado Offline Seguro',
            text: 'Sin conexión estable. La encuesta y los archivos están seguros en tu teléfono. Recuerda sincronizarlos luego.',
            confirmButtonColor: '#3b82f6'
          });
          
          // Limpiamos la UI para que puedan seguir trabajando
          setFormData({ identificacion: '', idActa: 'ACTA-2024-001', firmaToken: '' });
          setArchivos([]);

        } catch (idbError) {
          console.error("Error al guardar en IndexedDB:", idbError);
          MySwal.fire({ icon: 'error', title: 'Error de Almacenamiento', text: 'No se pudo guardar la encuesta localmente. Espacio insuficiente?' });
        }

      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema procesando la encuesta en el servidor.',
          confirmButtonColor: '#ef4444'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-surface dark:bg-surface-dark text-on-surface dark:text-white font-display">
      
      {/* Header Específico */}
      <header className="sticky top-0 z-10 bg-surface-container dark:bg-surface-container-dark border-b border-surface-container-highest dark:border-slate-800 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          type="button"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight">Nueva Encuesta</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-8">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-6 mt-2">
          
          {/* Text Inputs (Sin cambios, solo acortados visualmente) */}
          <section className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">Número de Identificación</label>
              <input name="identificacion" value={formData.identificacion} onChange={handleChange} required className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" type="text" />
            </div>
            <div className="flex flex-col gap-2 opacity-80">
              <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">ID del Acta</label>
              <div className="flex items-center w-full h-14 px-4 rounded-xl border border-surface-container-highest dark:border-slate-700 bg-surface dark:bg-slate-900 text-slate-500">
                <span className="material-symbols-outlined mr-2 text-sm">lock</span>
                <span>{formData.idActa}</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">URL Firma Digital / Token</label>
              <div className="relative">
                <input name="firmaToken" value={formData.firmaToken} onChange={handleChange} required className="w-full h-14 px-4 pr-12 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none" type="text" />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary">draw</span>
              </div>
            </div>
          </section>

          {/* SECCIÓN DE EVIDENCIAS REALES */}
          <section className="space-y-4">
            <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">Subir Evidencias</label>
            
            {/* Botón/Zona de carga (Actúa como label para el input oculto) */}
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-primary/30 rounded-2xl p-6 bg-primary/5 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:bg-primary/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-1">
                <span className="material-symbols-outlined text-3xl">add_a_photo</span>
              </div>
              <p className="font-medium text-on-surface dark:text-slate-100">Toca para agregar fotos o PDFs</p>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple 
                accept="image/*,.pdf"
                className="hidden" 
              />
            </div>

            {/* Vista previa de los archivos seleccionados */}
            {archivos.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Archivos Adjuntos ({archivos.length})</p>
                <div className="flex flex-col gap-2">
                  {archivos.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-highest dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="material-symbols-outlined text-primary text-xl shrink-0">
                          {file.type.includes('image') ? 'image' : 'description'}
                        </span>
                        <span className="text-sm font-medium truncate w-48">{file.name}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeFile(index)}
                        className="text-rose-500 p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-full transition-colors"
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Botón de Enviar */}
          <div className="pt-6">
            <button 
              disabled={loading}
              type="submit"
              className={`w-full bg-primary hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : (
                <span className="material-symbols-outlined">cloud_upload</span>
              )}
              {loading ? 'Guardando...' : 'Guardar Encuesta'}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}