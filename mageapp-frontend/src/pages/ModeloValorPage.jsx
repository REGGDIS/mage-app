import React, { useEffect, useState } from "react";
import { getModeloDeValor } from "../services/proyectosService.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";

const ModeloValorPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setError("");
      setLoading(true);
      try {
        const rows = await getModeloDeValor();
        setData(rows);
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          "Error al cargar el Modelo de Valor.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h3 className="mb-3">Modelo de Valor (CIDAT)</h3>
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
                <th className="text-center">C</th>
                <th className="text-center">I</th>
                <th className="text-center">D</th>
                <th className="text-center">A</th>
                <th className="text-center">T</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.activo_id}>
                  <td>{row.activo}</td>
                  <td className="text-center">
                    {row.valor_confidencialidad}
                  </td>
                  <td className="text-center">{row.valor_integridad}</td>
                  <td className="text-center">
                    {row.valor_disponibilidad}
                  </td>
                  <td className="text-center">
                    {row.valor_autenticidad}
                  </td>
                  <td className="text-center">
                    {row.valor_trazabilidad}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default ModeloValorPage;
