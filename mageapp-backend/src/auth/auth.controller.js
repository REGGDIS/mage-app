import { pool } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const signAccess = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || "15m" });

const randomToken = (len = 48) => crypto.randomBytes(len).toString("hex");

export const register = async (req, res) => {
    try {
        const { nombre_completo, email, password } = req.body;
        const [e] = await pool.query("SELECT id FROM usuarios WHERE email=?", [email]);
        if (e.length) return res.status(400).json({ error: "Email ya registrado" });

        const hash = await bcrypt.hash(password, 10);
        const [rol] = await pool.query("SELECT id FROM roles WHERE nombre='Gestor de Riesgos' LIMIT 1");
        const rolId = rol.length ? rol[0].id : null;

        const [ins] = await pool.query(
            "INSERT INTO usuarios (nombre_completo, email, password_hash, rol_id) VALUES (?,?,?,?)",
            [nombre_completo, email, hash, rolId]
        );
        res.json({ id: ins.insertId, email });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await pool.query("SELECT * FROM usuarios WHERE email=?", [email]);
        if (!rows.length) return res.status(401).json({ error: "Credenciales inválidas" });

        const user = rows[0];
        const ok = await bcrypt.compare(password, user.password_hash || "");
        if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

        const accessToken = signAccess({ sub: user.id, rol_id: user.rol_id });

        const refreshToken = randomToken();
        const exp = new Date(); exp.setDate(exp.getDate() + Number(process.env.REFRESH_EXPIRES_DAYS || 7));
        const hash = await bcrypt.hash(refreshToken, 10);
        await pool.query(
            "INSERT INTO refresh_tokens (usuario_id, token_hash, expira_en) VALUES (?,?,?)",
            [user.id, hash, exp]
        );

        res.json({ accessToken, refreshToken });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

export const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: "Falta refreshToken" });
        const [rows] = await pool.query("SELECT * FROM refresh_tokens WHERE revocado=0 AND expira_en > NOW()");
        let match = null;
        for (const r of rows) {
            if (await bcrypt.compare(refreshToken, r.token_hash)) { match = r; break; }
        }
        if (!match) return res.status(401).json({ error: "Refresh inválido" });

        const [u] = await pool.query("SELECT id, rol_id FROM usuarios WHERE id=?", [match.usuario_id]);
        const tok = signAccess({ sub: u[0].id, rol_id: u[0].rol_id });
        res.json({ accessToken: tok });
    } catch (err) { res.status(500).json({ error: err.message }); }
};
