import React, { useEffect, useState } from "react";
import { getMapaDeRiesgos } from "../services/proyectosService.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorAlert from "../components/ErrorAlert.jsx";

const MapaRiesgosPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setError("");
      setLoading(true);
      try {
        const rows = await getMapaDeRiesgos();
        setData(rows);
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          "Error al cargar el Mapa de Riesgos.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <h3 className="mb-3">Mapa de Riesgos</h3>
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
                <th>Amenazas</th>
                <th>Vulnerabilidades</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.riesgo_id}>
                  <td>{row.activo}</td>
                  <td>{row.amenazas ?? "—"}</td>
                  <td>{row.vulnerabilidades ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default MapaRiesgosPage;
