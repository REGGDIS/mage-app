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

// Decide qué mostrar en la columna Responsable
const getResponsableTexto = (p) => {
  // 1) Texto libre guardado en la columna proyectos.responsable
  if (p.responsable && p.responsable.trim() !== "") return p.responsable;

  // 2) Nombre del usuario (JOIN con tabla usuarios)
  if (p.responsable_nombre && p.responsable_nombre.trim() !== "")
    return p.responsable_nombre;

  // 3) Fallback: ID del usuario
  if (p.responsable_id != null) return `Usuario #${p.responsable_id}`;

  // 4) Sin responsable
  return "-";
};

const ProjectsListPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Reglas de rol ---
  const isSuperAdmin = user?.roleName === "SuperAdmin";
  const isGestor = user?.roleName === "Gestor de Riesgos";
  const isAuditor = user?.roleName === "Auditor";

  const puedeCrear = isSuperAdmin || isGestor;

  // Filtro por rol:
  // - SuperAdmin y Auditor: ven todos
  // - Gestor: sólo proyectos donde es responsable + proyectos sin responsable
  const proyectosFiltrados = React.useMemo(() => {
    if (!user) return [];
    if (isSuperAdmin || isAuditor) return proyectos;

    if (isGestor) {
      return proyectos.filter(
        (p) => p.responsable_id === user.id || p.responsable_id == null
      );
    }

    // Otros roles (por si acaso)
    return [];
  }, [proyectos, user, isSuperAdmin, isAuditor, isGestor]);

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

  // 👇 Nuevo handler para el plan de tratamiento
  const handleVerPlanTratamiento = (proyectoId) => {
    navigate(`/app/proyectos/${proyectoId}/plan-tratamiento`);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-0">Proyectos de Gestión de Riesgos</h1>
          {user && (
            <small className="text-muted">
              Vista para: {user.roleName}
              {isGestor && " (sólo tus proyectos y sin responsable)"}
              {isSuperAdmin && " (todos los proyectos)"}
              {isAuditor && " (lectura de todos los proyectos)"}
            </small>
          )}
        </div>

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

      {!loading && !error && proyectosFiltrados.length === 0 && (
        <div className="alert alert-info" role="alert">
          No hay proyectos visibles para tu rol todavía.
        </div>
      )}

      {!loading && !error && proyectosFiltrados.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del proyecto</th>
                <th>Estado</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th>Responsable</th>
                <th style={{ width: "230px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectosFiltrados.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.estado}</td>
                  <td>{formatDate(p.fecha_inicio)}</td>
                  <td>{formatDate(p.fecha_fin)}</td>
                  <td>{getResponsableTexto(p)}</td>
                  <td>
                    <div className="btn-group" role="group">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => handleVerAnalisis(p.nombre)}
                      >
                        Ver análisis
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleVerPlanTratamiento(p.id)}
                      >
                        Plan de tratamiento
                      </button>
                    </div>
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
