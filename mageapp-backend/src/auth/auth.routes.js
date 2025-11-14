import { Router } from "express";
import { register, login, refresh } from "./auth.controller.js";
const r = Router();
r.post("/register", register);
r.post("/login", login);
r.post("/refresh", refresh);
export default r;
