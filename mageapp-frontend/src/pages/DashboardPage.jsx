// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarProyectos } from "../services/proyectosService.js";
import { useAuth } from "../hooks/useAuth.js";

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Reglas de rol (mismas que en ProjectsListPage) ---
  const isSuperAdmin = user?.roleName === "SuperAdmin";
  const isGestor = user?.roleName === "Gestor de Riesgos";
  // const isAuditor = user?.roleName === "Auditor";

  const puedeCrear = isSuperAdmin || isGestor;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await listarProyectos();
        setProyectos(data || []);
      } catch (err) {
        console.error("Error cargando proyectos en dashboard", err);
        setError("No se pudo cargar el resumen de proyectos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalProyectos = proyectos.length;
  const proyectosEnEvaluacion = proyectos.filter(
    (p) => p.estado === "En evaluación"
  ).length;
  const proyectosEnAnalisis = proyectos.filter(
    (p) => p.estado === "En análisis"
  ).length;

  const handleIrProyectos = () => navigate("/app/proyectos");
  const handleIrModeloValor = () => navigate("/app/modelo-valor");
  const handleIrMatrizRiesgo = () => navigate("/app/matriz-riesgo");
  const handleIrMapaRiesgos = () => navigate("/app/mapa-riesgos");
  const handleNuevoProyecto = () => navigate("/app/nuevo-proyecto");

  return (
    <div className="container mt-4">
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Dashboard de Gestión de Riesgos</h1>
          {user && (
            <small className="text-muted">
              Bienvenido, {user.name || user.username} ({user.roleName})
            </small>
          )}
        </div>

        {puedeCrear && (
          <button className="btn btn-primary" onClick={handleNuevoProyecto}>
            + Nuevo proyecto
          </button>
        )}
      </div>

      {/* Mensajes de estado */}
      {loading && <p>Cargando resumen...</p>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Contenido principal */}
      {!loading && !error && (
        <>
          {/* Tarjetas de resumen */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h2 className="h6 text-muted">Proyectos totales</h2>
                  <p className="display-6 mb-0">{totalProyectos}</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h2 className="h6 text-muted">En evaluación</h2>
                  <p className="display-6 mb-0">{proyectosEnEvaluacion}</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h2 className="h6 text-muted">En análisis</h2>
                  <p className="display-6 mb-0">{proyectosEnAnalisis}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h5 mb-3">Accesos rápidos</h2>
              <div className="d-flex flex-wrap gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleIrProyectos}
                >
                  Ver proyectos
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleIrModeloValor}
                >
                  Modelo de Valor
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleIrMatrizRiesgo}
                >
                  Matriz de Riesgo
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleIrMapaRiesgos}
                >
                  Mapa de Riesgos
                </button>
              </div>
            </div>
          </div>

          {/* Últimos proyectos */}
          <div className="card">
            <div className="card-body">
              <h2 className="h5 mb-3">Últimos proyectos creados</h2>
              {proyectos.length === 0 ? (
                <p className="text-muted mb-0">
                  Aún no hay proyectos registrados.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Responsable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proyectos.slice(0, 5).map((p) => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.nombre}</td>
                          <td>{p.estado}</td>
                          <td>{p.responsable || p.responsable_nombre || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
