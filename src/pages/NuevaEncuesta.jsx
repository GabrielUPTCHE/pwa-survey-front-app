import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { saveEncuestaOffline } from '../services/idb.service.js';
import { sujetosService } from '../services/sujetos.service.js';
import { encuestasService } from '../services/encuestas.service.js';

const MySwal = withReactContent(Swal);

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function NuevaEncuesta() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Sujeto search
  const [sujetoQuery, setSujetoQuery] = useState('');
  const [sujetoResults, setSujetoResults] = useState([]);
  const [selectedSujeto, setSelectedSujeto] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedQuery = useDebounce(sujetoQuery, 400);

  // Tipos de documento
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [idTipoDocumento, setIdTipoDocumento] = useState('');

  // Archivos
  const [archivos, setArchivos] = useState([]);

  // Geolocalización
  const [geoCoords, setGeoCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState('pending');

  useEffect(() => {
    encuestasService.getTiposDocumento()
      .then(setTiposDocumento)
      .catch(() => setTiposDocumento([]));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSujetoResults([]);
      return;
    }
    setSearchLoading(true);
    sujetosService.searchSujetos(debouncedQuery)
      .then(setSujetoResults)
      .catch(() => setSujetoResults([]))
      .finally(() => setSearchLoading(false));
  }, [debouncedQuery]);

  const selectSujeto = (sujeto) => {
    setSelectedSujeto(sujeto);
    setSujetoQuery(sujeto.razon_social);
    setSujetoResults([]);
  };

  const handleFileChange = (e) => {
    setArchivos((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSujeto) {
      MySwal.fire({ icon: 'warning', title: 'Selecciona un sujeto', text: 'Busca y selecciona el establecimiento antes de continuar.', confirmButtonColor: '#3b82f6' });
      return;
    }
    if (!idTipoDocumento) {
      MySwal.fire({ icon: 'warning', title: 'Selecciona el tipo de documento', confirmButtonColor: '#3b82f6' });
      return;
    }

    setLoading(true);
    const idActa = `ACTA-${Date.now()}`;

    const fd = new FormData();
    fd.append('id_sujeto', selectedSujeto.id_sujeto);
    fd.append('id_tipo_documento', idTipoDocumento);
    fd.append('id_acta', idActa);
    archivos.forEach((file) => fd.append('evidencias', file));

    try {
      await encuestasService.crearDocumento(fd);
      MySwal.fire({ icon: 'success', title: '¡Enviado!', text: 'La encuesta se guardó en el servidor.', confirmButtonColor: '#3b82f6' });
      resetForm();
    } catch (error) {
      if (!navigator.onLine || error instanceof TypeError) {
        try {
          await saveEncuestaOffline({
            id_sujeto: selectedSujeto.id_sujeto,
            id_tipo_documento: idTipoDocumento,
            id_acta: idActa,
            archivos,
            sujeto_nombre: selectedSujeto.razon_social,
            fechaGuardado: new Date().toISOString(),
          });
          MySwal.fire({ icon: 'info', title: 'Guardado Offline', text: 'Sin conexión. La encuesta está segura en tu dispositivo y se sincronizará luego.', confirmButtonColor: '#3b82f6' });
          resetForm();
        } catch (idbError) {
          MySwal.fire({ icon: 'error', title: 'Error de almacenamiento', text: 'No se pudo guardar la encuesta localmente.', confirmButtonColor: '#ef4444' });
        }
      } else {
        MySwal.fire({ icon: 'error', title: 'Error del servidor', text: error.message, confirmButtonColor: '#ef4444' });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSujeto(null);
    setSujetoQuery('');
    setIdTipoDocumento('');
    setArchivos([]);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-surface dark:bg-surface-dark text-on-surface dark:text-white font-display">
      <header className="sticky top-0 z-10 bg-surface-container dark:bg-surface-container-dark border-b border-surface-container-highest dark:border-slate-800 px-4 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} type="button" className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10 text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold tracking-tight">Nueva Encuesta</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-8">
        {/* Geo status chip */}
        <div className="max-w-md mx-auto px-4 pt-3">
          {geoStatus === 'pending' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <span className="material-symbols-outlined animate-spin text-blue-500 text-sm">sync</span>
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Obteniendo ubicación...</p>
            </div>
          )}
          {geoStatus === 'granted' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Ubicación lista</p>
            </div>
          )}
          {(geoStatus === 'denied' || geoStatus === 'error') && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <span className="material-symbols-outlined text-rose-500 text-sm">location_off</span>
              <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">Permiso de ubicación denegado. Actívalo en los ajustes del dispositivo.</p>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-6 mt-2">

          {/* Búsqueda de sujeto */}
          <section className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">Establecimiento</label>
            <div className="relative">
              <input
                value={sujetoQuery}
                onChange={(e) => { setSujetoQuery(e.target.value); setSelectedSujeto(null); }}
                placeholder="Buscar por nombre, NIT o barrio..."
                className="w-full h-14 px-4 pr-10 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
              />
              {searchLoading && (
                <span className="material-symbols-outlined animate-spin absolute right-4 top-1/2 -translate-y-1/2 text-primary">sync</span>
              )}
            </div>
            {sujetoResults.length > 0 && (
              <div className="border border-primary/20 rounded-xl overflow-hidden shadow-md">
                {sujetoResults.map((s) => (
                  <button
                    key={s.id_sujeto}
                    type="button"
                    onClick={() => selectSujeto(s)}
                    className="w-full text-left px-4 py-3 bg-surface-container dark:bg-slate-800 hover:bg-primary/10 dark:hover:bg-slate-700 border-b border-surface-container-highest dark:border-slate-700 last:border-0 transition-colors"
                  >
                    <p className="text-sm font-semibold text-on-surface dark:text-white">{s.razon_social}</p>
                    <p className="text-xs text-on-surface-variant dark:text-slate-400">{s.direccion_fisica} · {s.barrio}</p>
                  </button>
                ))}
              </div>
            )}
            {selectedSujeto && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{selectedSujeto.razon_social}</p>
              </div>
            )}
          </section>

          {/* Tipo de documento */}
          <section className="space-y-2">
            <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">Tipo de Documento</label>
            <select
              value={idTipoDocumento}
              onChange={(e) => setIdTipoDocumento(e.target.value)}
              required
              className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 text-on-surface dark:text-white focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="">Selecciona un tipo...</option>
              {tiposDocumento.map((t) => (
                <option key={t.id_tipo_documento} value={t.id_tipo_documento}>
                  {t.nombre_documento}
                </option>
              ))}
            </select>
          </section>

          {/* Archivos */}
          <section className="space-y-4">
            <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">Subir Evidencias</label>
            <div
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-primary/30 rounded-2xl p-6 bg-primary/5 flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:bg-primary/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-1">
                <span className="material-symbols-outlined text-3xl">add_a_photo</span>
              </div>
              <p className="font-medium text-on-surface dark:text-slate-100">Toca para agregar fotos o PDFs</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*,.pdf" className="hidden" />
            </div>
            {archivos.length > 0 && (
              <div className="space-y-2">
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
                      <button type="button" onClick={() => removeFile(index)} className="text-rose-500 p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="pt-6">
            <button
              disabled={loading}
              type="submit"
              className={`w-full bg-primary hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading
                ? <span className="material-symbols-outlined animate-spin">sync</span>
                : <span className="material-symbols-outlined">cloud_upload</span>}
              {loading ? 'Guardando...' : 'Guardar Encuesta'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
