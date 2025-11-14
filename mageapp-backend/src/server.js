import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import authRoutes from "./auth/auth.routes.js";
import proyectosRoutes from "./proyectos/proyectos.routes.js";

const app = express();

// Seguridad y utilidades
app.use(helmet());

// CORS flexible para cualquier puerto localhost en desarrollo
app.use(
    cors({
        origin: [/^http:\/\/localhost:\d+$/],
        credentials: true,
    })
);

app.use(express.json());

// Ping de salud
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Rutas de la API
app.get("/", (_req, res) => res.json({ ok: true, name: "MageApp API" }));
app.use("/api/auth", authRoutes);
app.use("/api/proyectos", proyectosRoutes);

// 404 para rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: "Not found", path: req.originalUrl });
});

// Manejo global de errores (por si alguna ruta hace next(err))
app.use((err, _req, res, _next) => {
    console.error("[API ERROR]", err);
    res.status(500).json({ error: "Internal error" });
});

// Arranque
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log("API http://localhost:" + PORT);
});
