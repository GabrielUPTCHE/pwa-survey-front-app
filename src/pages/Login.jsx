import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service.js';

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ numero_identificacion: '', contraseña: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userData = await authService.login(form);
      login(userData);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface dark:bg-surface-dark px-6 font-display">
      <div className="w-full max-w-sm">

        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-white text-4xl">analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface dark:text-white tracking-tight">Censo 2024</h1>
          <p className="text-sm text-on-surface-variant dark:text-slate-400 mt-1">Ingresa con tu número de identificación</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">
              Número de Identificación
            </label>
            <input
              name="numero_identificacion"
              value={form.numero_identificacion}
              onChange={handleChange}
              required
              autoComplete="username"
              inputMode="numeric"
              className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 text-on-surface dark:text-white focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="Ej: 1234567890"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-on-surface-variant dark:text-slate-300 ml-1">
              Contraseña
            </label>
            <input
              name="contraseña"
              value={form.contraseña}
              onChange={handleChange}
              required
              type="password"
              autoComplete="current-password"
              className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 text-on-surface dark:text-white focus:ring-2 focus:ring-primary outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <span className="material-symbols-outlined text-rose-500 text-lg shrink-0">error</span>
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-95 mt-2 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined">login</span>
            )}
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
