import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import ModeloValorPage from "./pages/ModeloValorPage.jsx";
import MatrizRiesgoPage from "./pages/MatrizRiesgoPage.jsx";
import MapaRiesgosPage from "./pages/MapaRiesgosPage.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="modelo-valor" replace />} />
        <Route path="modelo-valor" element={<ModeloValorPage />} />
        <Route path="matriz-riesgo" element={<MatrizRiesgoPage />} />
        <Route path="mapa-riesgos" element={<MapaRiesgosPage />} />
      </Route>

      {/* Cualquier otra ruta redirige a /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
