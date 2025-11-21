// src/components/NavbarApp.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

const NavbarApp = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Roles
  const isSuperAdmin = user?.roleName === "SuperAdmin";
  const isGestor = user?.roleName === "Gestor de Riesgos";
  const isAuditor = user?.roleName === "Auditor";

  const canCreateProject = isSuperAdmin || isGestor;
  const canSeeProjects = !!user; // cualquier usuario logueado
  const canSeeDashboard = !!user; // cualquier usuario logueado

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <span className="navbar-brand">MageApp – Gestión de Riesgos</span>

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
            {/* Inicio / Dashboard: todos los roles logueados */}
            {canSeeDashboard && (
              <li className="nav-item">
                <NavLink
                  to="/app"
                  end
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active" : "")
                  }
                >
                  Inicio
                </NavLink>
              </li>
            )}

            {/* Proyectos: todos los roles logueados */}
            {canSeeProjects && (
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
            )}

            {/* Sólo Gestor / SuperAdmin pueden crear */}
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

            {/* Se eliminan del navbar:
                - Modelo de Valor
                - Matriz de Riesgo
                - Mapa de Riesgos
               porque ahora se accede al análisis desde la lista de proyectos */}
          </ul>

          {/* Saludo según rol */}
          {user && (
            <span className="navbar-text me-3">
              {isSuperAdmin && "Bienvenido, Admin"}
              {isGestor && "Bienvenido, Gestor de Riesgos"}
              {isAuditor && "Bienvenido, Auditor"}
              {!isSuperAdmin && !isGestor && !isAuditor && "Bienvenido, Usuario"}
            </span>
          )}

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
