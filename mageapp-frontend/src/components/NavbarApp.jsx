import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const NavbarApp = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Reglas simples de permisos
  const canCreateProject =
    user && (user.roleName === "SuperAdmin" || user.roleName === "Gestor de Riesgos");

  console.log("[NavbarApp] user:", user);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <span className="navbar-brand">
          MageApp – Aplicación propia - MageApp
        </span>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMageApp"
          aria-controls="navbarMageApp"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMageApp">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Sólo Gestor/SuperAdmin ven este item */}
            {canCreateProject && (
              <li className="nav-item">
                <NavLink
                  to="/app/nuevo-proyecto"
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active" : "")
                  }
                >
                  Nuevo proyecto
                </NavLink>
              </li>
            )}

            {/* 👇 Nuevo: listado de proyectos (lo ven todos los usuarios logueados) */}
            <li className="nav-item">
              <NavLink
                to="/app/proyectos"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                Proyectos
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/app/modelo-valor"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                Modelo de Valor
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/app/matriz-riesgo"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                Matriz de Riesgo
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/app/mapa-riesgos"
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                Mapa de Riesgos
              </NavLink>
            </li>
          </ul>

          <button
            className="btn btn-outline-light btn-sm"
            type="button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarApp;
