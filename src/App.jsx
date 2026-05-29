import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import HomePage from './pages/Inicio';
import NuevaEncuesta from './pages/NuevaEncuesta';
import Rutas from './pages/Rutas';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/calendario" element={<Rutas />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/reportes" element={<Reportes />} />
            </Route>

            <Route path="/nueva-encuesta" element={<NuevaEncuesta />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
