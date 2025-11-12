import { pool } from "../db.js";

// Normaliza nombre recibido (decodifica, convierte '+' en espacio y recorta)
const getNombre = (req) => {
    const raw = req.params.nombre ?? "";
    let s;
    try { s = decodeURIComponent(raw); }
    catch { s = raw; }
    s = s.replace(/\+/g, " "); // en path params, '+' suele llegar literal
    return s.trim();
};

// Helper para armar SQL tolerante con opción LIKE
const buildSql = (vista, like) => like
    ? `SELECT * FROM ${vista}
     WHERE proyecto LIKE CONCAT('%', TRIM(?), '%') COLLATE utf8mb4_general_ci`
    : `SELECT * FROM ${vista}
     WHERE TRIM(proyecto) = TRIM(?) COLLATE utf8mb4_general_ci`;

export const getModeloDeValor = async (req, res) => {
    try {
        const nombre = getNombre(req);
        const like = req.query.like === "1";
        const sql = buildSql("modelodevalor", like);
        const [rows] = await pool.query(sql, [nombre]);
        res.json(rows);
    } catch (err) {
        console.error("[getModeloDeValor]", err);
        res.status(500).json({ error: "Error obteniendo modelo de valor" });
    }
};

export const getMatrizDeRiesgo = async (req, res) => {
    try {
        const nombre = getNombre(req);
        const like = req.query.like === "1";
        const sql = buildSql("matrizderiesgo", like);
        const [rows] = await pool.query(sql, [nombre]);
        res.json(rows);
    } catch (err) {
        console.error("[getMatrizDeRiesgo]", err);
        res.status(500).json({ error: "Error obteniendo matriz de riesgo" });
    }
};

export const getMapaDeRiesgos = async (req, res) => {
    try {
        const nombre = getNombre(req);
        const like = req.query.like === "1";
        const sql = buildSql("mapaderiesgos", like);
        const [rows] = await pool.query(sql, [nombre]);
        res.json(rows);
    } catch (err) {
        console.error("[getMapaDeRiesgos]", err);
        res.status(500).json({ error: "Error obteniendo mapa de riesgos" });
    }
};
