import React, { useEffect, useState } from "react";
import { getMatrizDeRiesgo } from "../services/proyectosService.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";

// Escala visual: mapea cualquier número a 1–5 y aplica color
const getRiskScaleStyle = (value) => {
  const n = Number(value);
  const baseStyle = { textAlign: "center" };

  if (Number.isNaN(n)) return baseStyle;

  // Mapeo por rangos:
  // ≤1 → 1, ≤2 → 2, ≤3 → 3, ≤4 → 4, >4 → 5
  let level;
  if (n <= 1) level = 1;
  else if (n <= 2) level = 2;
  else if (n <= 3) level = 3;
  else if (n <= 4) level = 4;
  else level = 5;

  // 🎨 Colores ajustados (los que ya tenías)
  const colors = {
    1: "#198754", // verde (bajo)
    2: "#6ff261",
    3: "#ffc107", // amarillo
    4: "#fd7e14",
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

// Clasificación textual del riesgo residual según res_nivel
const getResidualLabel = (value) => {
  const v = Number(value);
  if (!v || Number.isNaN(v)) return "Sin evaluar";

  if (v <= 2) return "Bajo (Aceptable)";
  if (v === 3) return "Medio (Seguimiento)";
  return "Alto (No aceptable)";
};

const MatrizRiesgoPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setError("");
      setLoading(true);
      try {
        const rows = await getMatrizDeRiesgo();
        setData(rows);
      } catch (err) {
        const msg =
          err.response?.data?.error || "Error al cargar la Matriz de Riesgo.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      {/* Cabecera + botón imprimir (no sale en PDF) */}
      <div className="d-flex justify-content-between align-items-center mb-3 no-print">
        <div>
          <h3 className="mb-0">Matriz de Riesgo</h3>
          <p className="text-muted mb-0">
            Proyecto: <strong>Aplicación propia - MageApp</strong>
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => window.print()}
        >
          Imprimir
        </button>
      </div>

      <ErrorAlert message={error} />
      {loading && <LoadingSpinner />}

      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Activo</th>
                <th className="text-center">Prob. Inh.</th>
                <th className="text-center">Impacto Inh.</th>
                <th className="text-center">Nivel Inh.</th>
                <th className="text-center">Prob. Res.</th>
                <th className="text-center">Impacto Res.</th>
                <th className="text-center">Nivel Res.</th>
                <th className="text-center">Riesgo residual</th>
                <th className="text-center">Tratamiento</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.riesgo_id}>
                  <td>{row.activo}</td>
                  <td style={getRiskScaleStyle(row.inh_prob)}>
                    {row.inh_prob}
                  </td>
                  <td style={getRiskScaleStyle(row.inh_impacto)}>
                    {row.inh_impacto}
                  </td>
                  <td style={getRiskScaleStyle(row.inh_nivel)}>
                    {row.inh_nivel}
                  </td>
                  <td style={getRiskScaleStyle(row.res_prob)}>
                    {row.res_prob}
                  </td>
                  <td style={getRiskScaleStyle(row.res_impacto)}>
                    {row.res_impacto}
                  </td>
                  <td style={getRiskScaleStyle(row.res_nivel)}>
                    {row.res_nivel}
                  </td>
                  <td className="text-center">
                    {getResidualLabel(row.res_nivel)}
                  </td>
                  <td className="text-center">{row.tratamiento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default MatrizRiesgoPage;
