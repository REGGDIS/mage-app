// src/services/proyectosService.js
import apiClient from "./apiClient.js";

const PROJECT_NAME = "Aplicación propia - MageApp";

const getEncodedProjectName = () => encodeURIComponent(PROJECT_NAME);

/* =========================
   LECTURA – VISTAS (ya existía)
   ========================= */

export const getModeloDeValor = async () => {
    const nombre = getEncodedProjectName();
    const response = await apiClient.get(
        `/api/proyectos/${nombre}/modelodevalor`,
        {
            params: { like: 1 },
        }
    );
    return response.data;
};

export const getMatrizDeRiesgo = async () => {
    const nombre = getEncodedProjectName();
    const response = await apiClient.get(
        `/api/proyectos/${nombre}/matrizderiesgo`,
        {
            params: { like: 1 },
        }
    );
    return response.data;
};

export const getMapaDeRiesgos = async () => {
    const nombre = getEncodedProjectName();
    const response = await apiClient.get(
        `/api/proyectos/${nombre}/mapaderiesgos`,
        {
            params: { like: 1 },
        }
    );
    return response.data;
};

/* =========================
   ESCRITURA – NUEVOS ENDPOINTS
   ========================= */

// POST /api/proyectos
export const crearProyecto = (proyecto) => {
    return apiClient.post("/api/proyectos", proyecto);
};

// POST /api/proyectos/:id/activos
export const registrarActivos = (proyectoId, activos) => {
    return apiClient.post(`/api/proyectos/${proyectoId}/activos`, activos);
};

// POST /api/proyectos/:id/riesgos
export const registrarRiesgos = (proyectoId, riesgos) => {
    return apiClient.post(`/api/proyectos/${proyectoId}/riesgos`, riesgos);
};

// POST /api/proyectos/:id/mapa-riesgos
export const registrarMapaRiesgos = (proyectoId, mapa) => {
    return apiClient.post(`/api/proyectos/${proyectoId}/mapa-riesgos`, mapa);
};

// 🔹 Endpoint que guarda TODO en una sola transacción
export const crearProyectoCompleto = (payload) =>
    apiClient.post("/api/proyectos/completo", payload);

// GET /api/proyectos
export const listarProyectos = () => {
    return apiClient.get("/api/proyectos");
};

// GET /api/proyectos/:nombre/modelodevalor
export const obtenerModeloDeValorPorProyecto = (nombreProyecto) => {
    const encoded = encodeURIComponent(nombreProyecto);
    return apiClient.get(`/api/proyectos/${encoded}/modelodevalor`);
};

// GET /api/proyectos/:nombre/matrizderiesgo
export const obtenerMatrizDeRiesgoPorProyecto = (nombreProyecto) => {
    const encoded = encodeURIComponent(nombreProyecto);
    return apiClient.get(`/api/proyectos/${encoded}/matrizderiesgo`);
};

// GET /api/proyectos/:nombre/mapaderiesgos
export const obtenerMapaDeRiesgosPorProyecto = (nombreProyecto) => {
    const encoded = encodeURIComponent(nombreProyecto);
    return apiClient.get(`/api/proyectos/${encoded}/mapaderiesgos`);
};

/* =========================
   LECTURA – PLAN DE TRATAMIENTO / SALVAGUARDAS
   ========================= */

// GET /api/proyectos/:id/salvaguardas
export const obtenerPlanTratamientoPorProyecto = async (proyectoId) => {
    const response = await apiClient.get(
        `/api/proyectos/${proyectoId}/salvaguardas`
    );
    return response.data;
};

/* =========================
   Catálogo de controles y alta de salvaguardas
   ========================= */

// GET /api/proyectos/controles/catalogo
export const listarControles = async () => {
    const response = await apiClient.get("/api/proyectos/controles/catalogo");
    return response.data;
};

// POST /api/proyectos/:proyectoId/riesgos/:riesgoId/salvaguardas
export const agregarSalvaguardaARiesgo = async (
    proyectoId,
    riesgoId,
    payload
) => {
    const response = await apiClient.post(
        `/api/proyectos/${proyectoId}/riesgos/${riesgoId}/salvaguardas`,
        payload
    );
    return response.data;
};
