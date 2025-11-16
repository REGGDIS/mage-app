// src/pages/ProjectsListPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarProyectos } from "../services/proyectosService.js";
import { useAuth } from "../hooks/useAuth.js";

const formatDate = (value) => {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("es-CL");
  } catch {
    return value;
  }
};

const ProjectsListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await listarProyectos();
        setProyectos(data || []);
      } catch (err) {
        console.error("Error cargando proyectos", err);
        setError("No se pudo cargar la lista de proyectos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleNuevoProyecto = () => {
    navigate("/app/nuevo-proyecto");
  };

  const handleVerAnalisis = (nombreProyecto) => {

    const encoded = encodeURIComponent(nombreProyecto);
    navigate(`/app/proyectos/${encoded}`);
  };

  const puedeCrear =
    user && (user.roleName === "SuperAdmin" || user.roleName === "Gestor de Riesgos");

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Proyectos de Gestión de Riesgos</h1>

        {puedeCrear && (
          <button className="btn btn-primary" onClick={handleNuevoProyecto}>
            + Nuevo proyecto
          </button>
        )}
      </div>

      {loading && <p>Cargando proyectos...</p>}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && proyectos.length === 0 && (
        <div className="alert alert-info" role="alert">
          No hay proyectos registrados todavía.
        </div>
      )}

      {!loading && !error && proyectos.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del proyecto</th>
                <th>Estado</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th>Responsable (ID)</th>
                <th style={{ width: "150px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.estado}</td>
                  <td>{formatDate(p.fecha_inicio)}</td>
                  <td>{formatDate(p.fecha_fin)}</td>
                  <td>{p.responsable_id ?? "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleVerAnalisis(p.nombre)}
                    >
                      Ver análisis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectsListPage;
