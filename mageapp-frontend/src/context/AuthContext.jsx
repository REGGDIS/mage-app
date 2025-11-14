/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useMemo } from "react";
import apiClient from "../services/apiClient.js";

export const AuthContext = createContext(null);

const ACCESS_TOKEN_KEY = "mageapp_accessToken";
const REFRESH_TOKEN_KEY = "mageapp_refreshToken";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  });

  const isAuthenticated = !!token;

  const login = async (email, password) => {
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
  };

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      login,
      logout,
    }),
    [token, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
