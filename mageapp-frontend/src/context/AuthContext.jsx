// src/context/AuthContext.jsx
import React, { createContext, useState, useMemo, useCallback } from "react";
import apiClient from "../services/apiClient.js";

/* eslint-disable react-refresh/only-export-components */
export const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = "mageapp_accessToken";
const REFRESH_TOKEN_KEY = "mageapp_refreshToken";

const ROLE_MAP = {
  1: "SuperAdmin",
  2: "Gestor de Riesgos",
  3: "Auditor",
};

function decodeToken(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const payload = JSON.parse(json);

    const rolId = payload.rol_id ?? payload.rolId ?? null;

    return {
      id: payload.sub ?? null,
      rol_id: rolId,
      roleName: rolId ? ROLE_MAP[rolId] || null : null,
      raw: payload,
    };
  } catch (e) {
    console.error("[Auth] Error decodificando token:", e);
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(ACCESS_TOKEN_KEY) || null;
  });

  const user = useMemo(() => decodeToken(token), [token]);
  const isAuthenticated = !!token;

  const login = useCallback(async (email, password) => {
    const response = await apiClient.post("/api/auth/login", {
      email,
      password,
    });

    const { accessToken, refreshToken } = response.data;

    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      setToken(accessToken);
    }

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    return response.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      login,
      logout,
    }),
    [token, user, isAuthenticated, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
