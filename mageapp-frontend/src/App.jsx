// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import ModeloValorPage from "./pages/ModeloValorPage.jsx";
import MatrizRiesgoPage from "./pages/MatrizRiesgoPage.jsx";
import MapaRiesgosPage from "./pages/MapaRiesgosPage.jsx";
import NewProjectPage from "./pages/NewProjectPage.jsx";
import ProjectsListPage from "./pages/ProjectsListPage.jsx";
import ProjectDetailPage from "./pages/ProjectDetailPage.jsx";
import PlanTratamientoPage from "./pages/PlanTratamientoPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

import AppLayout from "./layouts/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const App = () => {
  return (
    <Routes>
      {/* Login público */}
      <Route path="/login" element={<LoginPage />} />

      {/* Zona protegida */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Entrada por defecto: Dashboard */}
        <Route index element={<DashboardPage />} />

        {/* Nueva pantalla para crear proyectos */}
        <Route path="nuevo-proyecto" element={<NewProjectPage />} />

        {/* Lista de proyectos */}
        <Route path="proyectos" element={<ProjectsListPage />} />
        <Route path="proyectos/:nombre" element={<ProjectDetailPage />} />

        {/* Plan de tratamiento por ID de proyecto */}
        <Route
          path="proyectos/:id/plan-tratamiento"
          element={<PlanTratamientoPage />}
        />

        {/* Páginas existentes de consulta “global” */}
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
