import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface dark:bg-surface-dark">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant dark:text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="text-sm font-medium">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.id_roles)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface dark:bg-surface-dark px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="material-symbols-outlined text-6xl text-rose-400">lock</span>
          <h2 className="text-xl font-bold text-on-surface dark:text-white">Sin acceso</h2>
          <p className="text-sm text-on-surface-variant dark:text-slate-400">
            Tu rol no tiene permisos para ver esta sección.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleRoute;