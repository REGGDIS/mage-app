import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { getModeloDeValor, getMatrizDeRiesgo, getMapaDeRiesgos } from "./proyectos.controller.js";

const r = Router();
r.get("/:nombre/modelodevalor", requireAuth, getModeloDeValor);
r.get("/:nombre/matrizderiesgo", requireAuth, getMatrizDeRiesgo);
r.get("/:nombre/mapaderiesgos", requireAuth, getMapaDeRiesgos);
export default r;
