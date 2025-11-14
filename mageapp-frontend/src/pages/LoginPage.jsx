import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import ErrorAlert from "../components/ErrorAlert.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/app/modelo-valor", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Error al iniciar sesión. Verifica tus credenciales.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <h2 className="mb-4 text-center">Login – MageApp</h2>
          <ErrorAlert message={error} />

          <form onSubmit={handleSubmit} className="card card-body">
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <button type="submit" className="btn btn-primary w-100">
                Iniciar sesión
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
