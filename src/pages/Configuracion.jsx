import { useState } from 'react';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service.js';

export default function Configuracion() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initialsOf = (nombre = '', apellido = '') =>
    `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Swal.fire({ icon: 'success', title: 'Contraseña actualizada', text: 'Tu contraseña se cambió correctamente.', confirmButtonColor: '#3b82f6' });
    } catch (err) {
      setError(err.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: 'question',
      title: 'Cerrar sesión',
      text: '¿Seguro que deseas salir?',
      showCancelButton: true,
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
    });
    if (result.isConfirmed) logout();
  };

  const inputClass =
    'w-full h-12 px-4 rounded-xl border border-primary/20 bg-surface-container dark:bg-slate-800 text-on-surface dark:text-white focus:ring-2 focus:ring-primary outline-none transition';

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-6">
      <h1 className="text-on-surface dark:text-white text-lg font-bold px-1">Ajustes</h1>

      {/* Perfil */}
      <section className="bg-surface-container dark:bg-surface-container-dark rounded-xl p-5 shadow-sm border border-surface-container-highest dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold select-none shrink-0">
            {initialsOf(user?.nombre, user?.apellido)}
          </div>
          <div className="flex flex-col">
            <p className="text-on-surface dark:text-white text-xl font-bold leading-tight">
              {user ? `${user.nombre} ${user.apellido}` : '—'}
            </p>
            <span className="mt-1 self-start bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
              {user?.nombre_rol ?? '—'}
            </span>
          </div>
        </div>

        <dl className="mt-5 pt-4 border-t border-surface-container-highest dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400 text-xl">badge</span>
            <div>
              <dt className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant dark:text-slate-400">Identificación</dt>
              <dd className="text-sm font-medium text-on-surface dark:text-white">{user?.numero_identificacion ?? '—'}</dd>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400 text-xl">mail</span>
            <div>
              <dt className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant dark:text-slate-400">Correo</dt>
              <dd className="text-sm font-medium text-on-surface dark:text-white break-all">{user?.correo ?? '—'}</dd>
            </div>
          </div>
        </dl>
      </section>

      {/* Cambiar contraseña */}
      <section className="bg-surface-container dark:bg-surface-container-dark rounded-xl p-5 shadow-sm border border-surface-container-highest dark:border-slate-800">
        <h2 className="text-on-surface dark:text-white text-sm font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">lock_reset</span>
          Cambiar contraseña
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            required
            autoComplete="current-password"
            placeholder="Contraseña actual"
            className={inputClass}
          />
          <input
            type="password"
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder="Nueva contraseña"
            className={inputClass}
          />
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder="Confirmar nueva contraseña"
            className={inputClass}
          />

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <span className="material-symbols-outlined text-rose-500 text-lg shrink-0">error</span>
              <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>{loading ? 'sync' : 'save'}</span>
            {loading ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </section>

      {/* Cerrar sesión */}
      <button
        onClick={handleLogout}
        className="w-full h-12 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors active:scale-95"
      >
        <span className="material-symbols-outlined">logout</span>
        Cerrar sesión
      </button>
    </div>
  );
}
