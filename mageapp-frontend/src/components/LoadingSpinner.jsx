import React from "react";

const LoadingSpinner = () => (
  <div className="d-flex justify-content-center my-4">
    <div className="spinner-border" role="status" aria-label="Cargando">
      <span className="visually-hidden">Cargando...</span>
    </div>
  </div>
);

export default LoadingSpinner;
