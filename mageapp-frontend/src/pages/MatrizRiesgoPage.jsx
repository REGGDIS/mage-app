import React, { useEffect, useState } from "react";
import { getMatrizDeRiesgo } from "../services/proyectosService.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";

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
          err.response?.data?.error ||
          "Error al cargar la Matriz de Riesgo.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h3 className="mb-3">Matriz de Riesgo</h3>
      <p className="text-muted">
        Proyecto: <strong>Aplicación propia - MageApp</strong>
      </p>

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
                <th className="text-center">Tratamiento</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.riesgo_id}>
                  <td>{row.activo}</td>
                  <td className="text-center">{row.inh_prob}</td>
                  <td className="text-center">{row.inh_impacto}</td>
                  <td className="text-center">{row.inh_nivel}</td>
                  <td className="text-center">{row.res_prob}</td>
                  <td className="text-center">{row.res_impacto}</td>
                  <td className="text-center">{row.res_nivel}</td>
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
