import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/Inicio";
import NuevaEncuesta from "./pages/NuevaEncuesta";
import Rutas from "./pages/Rutas";

export default function App() {
  return (
    <Router>
        <Routes>
          <Route element={<MainLayout />}>  
            <Route path="/" element={<HomePage />} />
            <Route path="/calendario" element={<Rutas />} />
          </Route>
          <Route path="/nueva-encuesta" element={<NuevaEncuesta />} />
        </Routes>
    </Router>
  );
}      