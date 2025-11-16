// src/pages/ProjectDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  obtenerModeloDeValorPorProyecto,
  obtenerMatrizDeRiesgoPorProyecto,
  obtenerMapaDeRiesgosPorProyecto,
} from "../services/proyectosService.js";

const ProjectDetailPage = () => {
  const { nombre } = useParams(); // viene codificado en la URL
  const navigate = useNavigate();

  const projectName = decodeURIComponent(nombre || "");

  const [modelo, setModelo] = useState([]);
  const [matriz, setMatriz] = useState([]);
  const [mapa, setMapa] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("modelo"); // "modelo" | "matriz" | "mapa"

  useEffect(() => {
    if (!projectName) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          modeloResp,
          matrizResp,
          mapaResp,
        ] = await Promise.all([
          obtenerModeloDeValorPorProyecto(projectName),
          obtenerMatrizDeRiesgoPorProyecto(projectName),
          obtenerMapaDeRiesgosPorProyecto(projectName),
        ]);

        setModelo(modeloResp.data || []);
        setMatriz(matrizResp.data || []);
        setMapa(mapaResp.data || []);
      } catch (err) {
        console.error("Error cargando análisis del proyecto", err);
        setError("No se pudo cargar el análisis de riesgos de este proyecto.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [projectName]);

  const handleBack = () => {
    navigate("/app/proyectos");
  };

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h3 mb-1">Análisis de riesgos</h1>
          <p className="mb-0 text-muted">
            Proyecto: <strong>{projectName}</strong>
          </p>
        </div>

        <button className="btn btn-outline-secondary btn-sm" onClick={handleBack}>
          ← Volver a proyectos
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={
              "nav-link" + (activeTab === "modelo" ? " active" : "")
            }
            onClick={() => setActiveTab("modelo")}
          >
            Modelo de Valor (CIDAT)
          </button>
        </li>
        <li className="nav-item">
          <button
            className={
              "nav-link" + (activeTab === "matriz" ? " active" : "")
            }
            onClick={() => setActiveTab("matriz")}
          >
            Matriz de Riesgo
          </button>
        </li>
        <li className="nav-item">
          <button
            className={
              "nav-link" + (activeTab === "mapa" ? " active" : "")
            }
            onClick={() => setActiveTab("mapa")}
          >
            Mapa de Riesgos
          </button>
        </li>
      </ul>

      {loading && <p>Cargando análisis...</p>}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {activeTab === "modelo" && (
            <div className="table-responsive">
              <table className="table table-striped table-sm align-middle">
                <thead>
                  <tr>
                    <th>Activo</th>
                    <th>C</th>
                    <th>I</th>
                    <th>D</th>
                    <th>A</th>
                    <th>T</th>
                  </tr>
                </thead>
                <tbody>
                  {modelo.map((row, idx) => (
                    <tr key={idx}>
                      {/* Ajusta los nombres de campos según la vista modelodevalor */}
                      <td>{row.activo}</td>
                      <td>{row.valor_confidencialidad}</td>
                      <td>{row.valor_integridad}</td>
                      <td>{row.valor_disponibilidad}</td>
                      <td>{row.valor_autenticidad}</td>
                      <td>{row.valor_trazabilidad}</td>
                    </tr>
                  ))}
                  {modelo.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted">
                        No hay datos de modelo de valor para este proyecto.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "matriz" && (
            <div className="table-responsive">
              <table className="table table-striped table-sm align-middle">
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
                  </tr>
                </thead>
                <tbody>
                  {matriz.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.activo}</td>
                      <td>{row.inh_prob}</td>
                      <td>{row.inh_impacto}</td>
                      <td>{row.inh_nivel}</td>
                      <td>{row.res_prob}</td>
                      <td>{row.res_impacto}</td>
                      <td>{row.res_nivel}</td>
                      <td>{row.tratamiento}</td>
                    </tr>
                  ))}
                  {matriz.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center text-muted">
                        No hay datos de matriz de riesgo para este proyecto.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "mapa" && (
            <div className="table-responsive">
              <table className="table table-striped table-sm align-middle">
                <thead>
                  <tr>
                    <th>Activo</th>
                    <th>Amenazas</th>
                    <th>Vulnerabilidades</th>
                  </tr>
                </thead>
                <tbody>
                  {mapa.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.activo}</td>
                      <td>{row.amenazas}</td>
                      <td>{row.vulnerabilidades}</td>
                    </tr>
                  ))}
                  {mapa.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center text-muted">
                        No hay datos de mapa de riesgos para este proyecto.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectDetailPage;
