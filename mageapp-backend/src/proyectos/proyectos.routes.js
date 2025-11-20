import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import {
    getModeloDeValor,
    getMatrizDeRiesgo,
    getMapaDeRiesgos,
    createProyecto,
    createActivos,
    createRiesgos,
    createMapaRiesgos,
    createProyectoCompleto,
    listProyectos,
    getPlanTratamientoByProyecto,
    listControles,
    addSalvaguardaToRiesgo,
    deleteProyecto,
} from "./proyectos.controller.js";

const r = Router();

r.get("/", requireAuth, listProyectos);

// Eliminar proyecto
r.delete("/:id", requireAuth, deleteProyecto);

// NUEVOS ENDPOINTS CRUD BÁSICOS
r.post("/", requireAuth, createProyecto);
r.post("/:id/activos", requireAuth, createActivos);
r.post("/:id/riesgos", requireAuth, createRiesgos);
r.post("/:id/mapa-riesgos", requireAuth, createMapaRiesgos);

// ENDPOINT COMPLETO (proyecto + activos + matriz + mapa)
r.post("/completo", requireAuth, createProyectoCompleto);

// Catalogo de controles (salvaguardas)
r.get("/controles/catalogo", requireAuth, listControles);

// PLAN DE TRATAMIENTO / SALVAGUARDAS (solo lectura)
r.get("/:id/salvaguardas", requireAuth, getPlanTratamientoByProyecto);

// Añadir salvaguarda a un riesgo de un proyecto
r.post(
    "/:proyectoId/riesgos/:riesgoId/salvaguardas",
    requireAuth,
    addSalvaguardaToRiesgo
);

// Endpoints de consulta existentes
r.get("/:nombre/modelodevalor", requireAuth, getModeloDeValor);
r.get("/:nombre/matrizderiesgo", requireAuth, getMatrizDeRiesgo);
r.get("/:nombre/mapaderiesgos", requireAuth, getMapaDeRiesgos);

export default r;
