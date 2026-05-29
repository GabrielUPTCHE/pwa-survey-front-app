import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface dark:bg-surface-dark">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant dark:text-slate-400">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p className="text-sm font-medium">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};