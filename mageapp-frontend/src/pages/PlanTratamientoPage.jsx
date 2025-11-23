// src/pages/PlanTratamientoPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  obtenerPlanTratamientoPorProyecto,
  listarControles,
  agregarSalvaguardaARiesgo,
} from "../services/proyectosService.js";

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

// Estilo de nivel (1–5) similar a la matriz de riesgo
const getRiskScaleStyle = (value) => {
  const n = Number(value);
  const baseStyle = { textAlign: "center" };

  if (Number.isNaN(n)) return baseStyle;

  let level;
  if (n <= 1) level = 1;
  else if (n <= 2) level = 2;
  else if (n <= 3) level = 3;
  else if (n <= 4) level = 4;
  else level = 5;

  const colors = {
    1: "#198754", // verde (bajo)
    2: "#6ff261", // verde claro
    3: "#ffc107", // amarillo
    4: "#fd7e14", // naranjo
    5: "#dc3545", // rojo (alto)
  };

  const textColors = {
    1: "#ffffff",
    2: "#0f5132",
    3: "#664d03",
    4: "#7c2d12",
    5: "#ffffff",
  };

  return {
    ...baseStyle,
    backgroundColor: colors[level],
    color: textColors[level],
    fontWeight: 600,
  };
};

// Clasificación textual del riesgo residual según nivel residual (res_nivel)
const getResidualLabel = (value) => {
  const v = Number(value);
  if (!v || Number.isNaN(v)) return "Sin evaluar";

  if (v <= 2) return "Bajo (Aceptable)";
  if (v === 3) return "Medio (Seguimiento)";
  return "Alto (No aceptable)";
};

const PlanTratamientoPage = () => {
  const { id } = useParams(); // id del proyecto
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [controles, setControles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado para el formulario de nueva salvaguarda
  const [showForm, setShowForm] = useState(false);
  const [selectedRiesgo, setSelectedRiesgo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [form, setForm] = useState({
    control_id: "",
    accion: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado_plan: "Pendiente",
    efectividad_control: "",
    estado_control: "Propuesto",
  });

  // Función para recargar el plan de tratamiento desde el backend
  const recargarPlan = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await obtenerPlanTratamientoPorProyecto(id);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando plan de tratamiento", err);
      setError("No se pudo cargar el plan de tratamiento.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar plan + catálogo de controles al montar / cambiar proyecto
  useEffect(() => {
    const loadData = async () => {
      await recargarPlan();
      try {
        const dataControles = await listarControles();
        setControles(Array.isArray(dataControles) ? dataControles : []);
      } catch (err) {
        console.error("Error cargando catálogo de controles", err);
        // No rompemos la página si falla el catálogo; solo dejamos el select vacío
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleVolver = () => {
    navigate("/app/proyectos");
  };

  const handleAbrirForm = (riesgo) => {
    setSelectedRiesgo(riesgo);
    setForm({
      control_id: "",
      accion: "",
      fecha_inicio: "",
      fecha_fin: "",
      estado_plan: "Pendiente",
      efectividad_control: "",
      estado_control: "Propuesto",
    });
    setSaveError("");
    setShowForm(true);
  };

  const handleCancelarForm = () => {
    setShowForm(false);
    setSelectedRiesgo(null);
    setSaveError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRiesgo) return;

    if (!form.control_id) {
      setSaveError("Debes seleccionar un control.");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      await agregarSalvaguardaARiesgo(id, selectedRiesgo.riesgo_id, {
        control_id: Number(form.control_id),
        accion: form.accion || null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
        estado_plan: form.estado_plan,
        efectividad_control: form.efectividad_control
          ? Number(form.efectividad_control)
          : null,
        estado_control: form.estado_control,
      });

      // Recargamos la tabla de plan de tratamiento
      await recargarPlan();
      setShowForm(false);
      setSelectedRiesgo(null);
    } catch (err) {
      console.error("Error guardando salvaguarda", err);
      setSaveError("No se pudo guardar la salvaguarda.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mt-4">
      {/* Encabezado */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h4 mb-0">Plan de Tratamiento / Salvaguardas</h1>
          <small className="text-muted">Proyecto ID: {id}</small>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-secondary"
          onClick={handleVolver}
        >
          ← Volver a proyectos
        </button>
      </div>

      {/* Estados de carga / error */}
      {loading && <p>Cargando salvaguardas...</p>}

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="alert alert-info" role="alert">
          Este proyecto aún no tiene salvaguardas ni plan de tratamiento asociados.
        </div>
      )}

      {/* Tabla de plan de tratamiento */}
      {!loading && !error && items.length > 0 && (
        <div className="card">
          <div className="card-body">
            <h2 className="h5 card-title mb-3">Detalle de salvaguardas</h2>
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th>Riesgo</th>
                    <th>Nivel residual</th>
                    <th>Riesgo residual</th>
                    <th>Salvaguarda (control)</th>
                    <th>Acción</th>
                    <th>Norma / Referencia</th>
                    <th>Responsable</th>
                    <th>Plazo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const key = `${item.riesgo_id || "r"}-${
                      item.control_id || "c"
                    }-${index}`;

                    return (
                      <tr key={key}>
                        <td>
                          {item.riesgo_nombre ||
                            (item.riesgo_id
                              ? `Riesgo #${item.riesgo_id}`
                              : "-")}
                        </td>
                        <td style={getRiskScaleStyle(item.nivel_residual)}>
                          {item.nivel_residual ?? "-"}
                        </td>
                        <td>{getResidualLabel(item.nivel_residual)}</td>
                        <td>{item.control_nombre || "-"}</td>
                        <td>{item.accion || "-"}</td>
                        <td>{item.norma || item.control_codigo || "-"}</td>
                        <td>{item.responsable || "-"}</td>
                        <td>{formatDate(item.plazo || item.fecha_fin)}</td>
                        <td>{item.estado || "-"}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() =>
                              handleAbrirForm({
                                riesgo_id: item.riesgo_id,
                                riesgo_nombre: item.riesgo_nombre,
                              })
                            }
                          >
                            Añadir salvaguarda
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-muted small mb-0">
              * Esta vista funciona como Plan de Tratamiento: muestra los riesgos,
              su nivel residual después de aplicar salvaguardas y una
              clasificación (bajo/medio/alto), junto con responsables, plazos y
              estado de las acciones.
            </p>
          </div>
        </div>
      )}

      {/* Formulario para añadir salvaguarda */}
      {showForm && selectedRiesgo && (
        <div className="card mt-4">
          <div className="card-body">
            <h2 className="h5 card-title mb-3">
              Añadir salvaguarda al riesgo:{" "}
              {selectedRiesgo.riesgo_nombre ||
                `Riesgo #${selectedRiesgo.riesgo_id}`}
            </h2>

            {saveError && (
              <div className="alert alert-danger" role="alert">
                {saveError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="control_id">
                    Control (salvaguarda)
                  </label>
                  <select
                    id="control_id"
                    name="control_id"
                    className="form-select"
                    value={form.control_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Selecciona un control --</option>
                    {controles.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                        {c.iso_27001_ref ? ` (${c.iso_27001_ref})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label" htmlFor="estado_plan">
                    Estado del plan
                  </label>
                  <select
                    id="estado_plan"
                    name="estado_plan"
                    className="form-select"
                    value={form.estado_plan}
                    onChange={handleChange}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En progreso">En progreso</option>
                    <option value="Implementado">Implementado</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label" htmlFor="efectividad_control">
                    Efectividad (1–5)
                  </label>
                  <input
                    type="number"
                    id="efectividad_control"
                    name="efectividad_control"
                    className="form-control"
                    min="1"
                    max="5"
                    value={form.efectividad_control}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="accion">
                  Acción de tratamiento
                </label>
                <textarea
                  id="accion"
                  name="accion"
                  className="form-control"
                  rows="3"
                  value={form.accion}
                  onChange={handleChange}
                  placeholder="Describe brevemente la acción a realizar (ej. implementar WAF, configurar backups diarios, etc.)"
                />
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label" htmlFor="fecha_inicio">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    id="fecha_inicio"
                    name="fecha_inicio"
                    className="form-control"
                    value={form.fecha_inicio}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label" htmlFor="fecha_fin">
                    Fecha fin (plazo)
                  </label>
                  <input
                    type="date"
                    id="fecha_fin"
                    name="fecha_fin"
                    className="form-control"
                    value={form.fecha_fin}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label" htmlFor="estado_control">
                    Estado del control
                  </label>
                  <select
                    id="estado_control"
                    name="estado_control"
                    className="form-select"
                    value={form.estado_control}
                    onChange={handleChange}
                  >
                    <option value="Propuesto">Propuesto</option>
                    <option value="Diseñado">Diseñado</option>
                    <option value="Implementado">Implementado</option>
                    <option value="En revisión">En revisión</option>
                  </select>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar salvaguarda"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleCancelarForm}
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanTratamientoPage;
