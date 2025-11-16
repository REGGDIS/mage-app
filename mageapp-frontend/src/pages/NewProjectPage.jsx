// src/pages/NewProjectPage.jsx
import React, { useState } from "react";
import { crearProyectoCompleto } from "../services/proyectosService.js";
import { useAuth } from "../hooks/useAuth.js";

const emptyActivo = () => ({
  activo: "",
  valor_confidencialidad: 0,
  valor_integridad: 0,
  valor_disponibilidad: 0,
  valor_autenticidad: 0,
  valor_trazabilidad: 0,
});

const emptyRiesgo = () => ({
  activo: "",
  inh_prob: 0,
  inh_impacto: 0,
  inh_nivel: 0,
  res_prob: 0,
  res_impacto: 0,
  res_nivel: 0,
  tratamiento: "Reducir",
});

const emptyMapa = () => ({
  activo: "",
  amenazas: "",
  vulnerabilidades: "",
});

const NewProjectPage = () => {
  const { user } = useAuth();
  const isAllowed =
    user && (user.roleName === "SuperAdmin" || user.roleName === "Gestor de Riesgos");

  // TODOS los useState VAN AQUÍ
  const [proyecto, setProyecto] = useState({
    nombre: "",
    descripcion: "",
    responsable: "",
    estado: "En evaluación",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const [activos, setActivos] = useState([emptyActivo()]);
  const [riesgos, setRiesgos] = useState([]);
  const [mapaRiesgos, setMapaRiesgos] = useState([]);

  const [loading, setLoading] = useState(false);
  const [mensajeOk, setMensajeOk] = useState("");
  const [mensajeError, setMensajeError] = useState("");

  // return condicional
  if (!isAllowed) {
    return (
      <div className="mt-3">
        <h1 className="mb-3">Acceso restringido</h1>
        <div className="alert alert-warning">
          No tienes permisos para crear nuevos proyectos de gestión de riesgos.
          <br />
          Si necesitas registrar un proyecto, contacta con el Gestor de Riesgos o el SuperAdmin.
        </div>
      </div>
    );
  }

  /* =========================
     Handlers de formulario
     ========================= */

  const handleProyectoChange = (e) => {
    const { name, value } = e.target;
    setProyecto((prev) => ({ ...prev, [name]: value }));
  };

  const handleActivosChange = (index, e) => {
    const { name, value } = e.target;
    setActivos((prev) => {
      const copia = [...prev];
      copia[index] = {
        ...copia[index],
        [name]:
          name === "activo"
            ? value
            : value === ""
            ? 0
            : Number(value),
      };
      return copia;
    });
  };

  const handleRiesgosChange = (index, e) => {
    const { name, value } = e.target;
    setRiesgos((prev) => {
      const copia = [...prev];
      copia[index] = {
        ...copia[index],
        [name]:
          name === "activo" || name === "tratamiento"
            ? value
            : value === ""
            ? 0
            : Number(value),
      };
      return copia;
    });
  };

  const handleMapaChange = (index, e) => {
    const { name, value } = e.target;
    setMapaRiesgos((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [name]: value };
      return copia;
    });
  };

  const addActivo = () => setActivos((prev) => [...prev, emptyActivo()]);
  const removeActivo = (index) =>
    setActivos((prev) => prev.filter((_, i) => i !== index));

  const addRiesgo = () => setRiesgos((prev) => [...prev, emptyRiesgo()]);
  const removeRiesgo = (index) =>
    setRiesgos((prev) => prev.filter((_, i) => i !== index));

  const addMapa = () => setMapaRiesgos((prev) => [...prev, emptyMapa()]);
  const removeMapa = (index) =>
    setMapaRiesgos((prev) => prev.filter((_, i) => i !== index));

  /* =========================
     Envío
     ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensajeOk("");
    setMensajeError("");

    if (!proyecto.nombre.trim() || !proyecto.descripcion.trim()) {
      setMensajeError("Nombre y descripción del proyecto son obligatorios.");
      return;
    }

    const activosValidos = activos.filter((a) => a.activo.trim() !== "");
    if (activosValidos.length === 0) {
      setMensajeError("Debes ingresar al menos un activo en el modelo de valor.");
      return;
    }

    const riesgosValidos = riesgos.filter((r) => r.activo.trim() !== "");
    const mapaValidos = mapaRiesgos.filter(
      (m) =>
        m.activo.trim() !== "" ||
        m.amenazas.trim() !== "" ||
        m.vulnerabilidades.trim() !== ""
    );

    const payload = {
      proyecto,
      modeloDeValor: activosValidos,
      matrizDeRiesgo: riesgosValidos,
      mapaDeRiesgos: mapaValidos,
    };

    setLoading(true);
    try {
      console.log("PAYLOAD =>", payload);
      const resp = await crearProyectoCompleto(payload);
      const id = resp?.data?.proyecto_id;
      setMensajeOk(
        id
          ? `Proyecto guardado correctamente (ID ${id}).`
          : "Proyecto guardado correctamente."
      );

    } catch (err) {
      console.error("ERROR crearProyectoCompleto =>", err);
      const apiError = err?.response?.data?.error;
      setMensajeError(apiError || "Error al guardar el proyecto completo.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     Render
     ========================= */

  return (
    <div className="mt-3">
      <h1 className="mb-3">Nuevo Proyecto de Gestión de Riesgos</h1>
      <p className="text-muted">
        Completa los datos del proyecto y su análisis (modelo de valor CIDAT,
        matriz de riesgos y mapa de riesgos). Luego guarda todo en la base de
        datos para visualizarlo en las otras secciones.
      </p>

      {mensajeOk && (
        <div className="alert alert-success" role="alert">
          {mensajeOk}
        </div>
      )}
      {mensajeError && (
        <div className="alert alert-danger" role="alert">
          {mensajeError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Datos del proyecto */}
        <div className="card mb-4">
          <div className="card-header">Datos del proyecto</div>
          <div className="card-body row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre del proyecto *</label>
              <input
                type="text"
                name="nombre"
                className="form-control"
                value={proyecto.nombre}
                onChange={handleProyectoChange}
                placeholder="Ej: Sistema de Gestión Académica"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Responsable</label>
              <input
                type="text"
                name="responsable"
                className="form-control"
                value={proyecto.responsable}
                onChange={handleProyectoChange}
                placeholder="Ej: Área de TI"
              />
            </div>

            <div className="col-md-12">
              <label className="form-label">Descripción *</label>
              <textarea
                name="descripcion"
                className="form-control"
                rows="3"
                value={proyecto.descripcion}
                onChange={handleProyectoChange}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Fecha inicio</label>
              <input
                type="date"
                name="fecha_inicio"
                className="form-control"
                value={proyecto.fecha_inicio}
                onChange={handleProyectoChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Fecha fin</label>
              <input
                type="date"
                name="fecha_fin"
                className="form-control"
                value={proyecto.fecha_fin}
                onChange={handleProyectoChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Estado</label>
              <select
                name="estado"
                className="form-select"
                value={proyecto.estado}
                onChange={handleProyectoChange}
              >
                <option>En evaluación</option>
                <option>En curso</option>
                <option>Finalizado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modelo de Valor CIDAT */}
        <div className="card mb-4">
          <div className="card-header">
            Modelo de Valor (CIDAT) – Activos
          </div>
          <div className="card-body">
            <p className="text-muted">
              Asigna valores 1–5 para Confidencialidad (C), Integridad (I),
              Disponibilidad (D), Autenticidad (A) y Trazabilidad (T).
            </p>

            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Activo</th>
                    <th>C</th>
                    <th>I</th>
                    <th>D</th>
                    <th>A</th>
                    <th>T</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {activos.map((a, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          name="activo"
                          value={a.activo}
                          onChange={(e) => handleActivosChange(index, e)}
                          placeholder="Ej: Base de datos"
                        />
                      </td>
                      {[
                        "valor_confidencialidad",
                        "valor_integridad",
                        "valor_disponibilidad",
                        "valor_autenticidad",
                        "valor_trazabilidad",
                      ].map((field) => (
                        <td key={field}>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            className="form-control form-control-sm text-center"
                            name={field}
                            value={a[field]}
                            onChange={(e) => handleActivosChange(index, e)}
                          />
                        </td>
                      ))}
                      <td className="text-end">
                        {activos.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeActivo(index)}
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={addActivo}
            >
              + Agregar activo
            </button>
          </div>
        </div>

        {/* Matriz de Riesgo */}
        <div className="card mb-4">
          <div className="card-header">Matriz de Riesgo</div>
          <div className="card-body">
            <p className="text-muted">
              Probabilidad e impacto inherente y residual en escala 1–5.
            </p>

            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Activo</th>
                    <th>Prob. Inh.</th>
                    <th>Impacto Inh.</th>
                    <th>Nivel Inh.</th>
                    <th>Prob. Res.</th>
                    <th>Impacto Res.</th>
                    <th>Nivel Res.</th>
                    <th>Tratamiento</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {riesgos.map((r, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          name="activo"
                          className="form-control form-control-sm"
                          value={r.activo}
                          onChange={(e) => handleRiesgosChange(index, e)}
                        />
                      </td>
                      {[
                        "inh_prob",
                        "inh_impacto",
                        "inh_nivel",
                        "res_prob",
                        "res_impacto",
                        "res_nivel",
                      ].map((field) => (
                        <td key={field}>
                          <input
                            type="number"
                            min="0"
                            max="5"
                            name={field}
                            className="form-control form-control-sm text-center"
                            value={r[field]}
                            onChange={(e) => handleRiesgosChange(index, e)}
                          />
                        </td>
                      ))}
                      <td>
                        <input
                          type="text"
                          name="tratamiento"
                          className="form-control form-control-sm"
                          value={r.tratamiento}
                          onChange={(e) => handleRiesgosChange(index, e)}
                        />
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeRiesgo(index)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={addRiesgo}
            >
              + Agregar riesgo
            </button>
          </div>
        </div>

        {/* Mapa de Riesgos */}
        <div className="card mb-4">
          <div className="card-header">Mapa de Riesgos</div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Activo</th>
                    <th>Amenazas</th>
                    <th>Vulnerabilidades</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {mapaRiesgos.map((m, index) => (
                    <tr key={index}>
                      <td style={{ width: "20%" }}>
                        <input
                          type="text"
                          name="activo"
                          className="form-control form-control-sm"
                          value={m.activo}
                          onChange={(e) => handleMapaChange(index, e)}
                        />
                      </td>
                      <td>
                        <textarea
                          name="amenazas"
                          className="form-control form-control-sm"
                          rows="2"
                          value={m.amenazas}
                          onChange={(e) => handleMapaChange(index, e)}
                        />
                      </td>
                      <td>
                        <textarea
                          name="vulnerabilidades"
                          className="form-control form-control-sm"
                          rows="2"
                          value={m.vulnerabilidades}
                          onChange={(e) => handleMapaChange(index, e)}
                        />
                      </td>
                      <td className="text-end align-top">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeMapa(index)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={addMapa}
            >
              + Agregar fila
            </button>
          </div>
        </div>

        {/* Botón guardar */}
        <div className="d-flex justify-content-end mb-5">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar proyecto completo"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProjectPage;
