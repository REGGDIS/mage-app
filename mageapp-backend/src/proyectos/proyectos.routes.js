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
} from "./proyectos.controller.js";

const r = Router();

r.get("/", requireAuth, listProyectos);

// NUEVOS ENDPOINTS CRUD BÁSICOS
r.post("/", requireAuth, createProyecto);
r.post("/:id/activos", requireAuth, createActivos);
r.post("/:id/riesgos", requireAuth, createRiesgos);
r.post("/:id/mapa-riesgos", requireAuth, createMapaRiesgos);

// ENDPOINT COMPLETO (proyecto + activos + matriz + mapa)
r.post("/completo", requireAuth, createProyectoCompleto);

// Endpoints de consulta existentes
r.get("/:nombre/modelodevalor", requireAuth, getModeloDeValor);
r.get("/:nombre/matrizderiesgo", requireAuth, getMatrizDeRiesgo);
r.get("/:nombre/mapaderiesgos", requireAuth, getMapaDeRiesgos);

export default r;
