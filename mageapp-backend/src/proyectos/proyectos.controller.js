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

export const createProyecto = async (req, res) => {
    const {
        nombre,
        descripcion,
        fecha_inicio,
        fecha_fin,
        responsable_id, // 👈 viene desde el body
        estado,
    } = req.body;

    if (!nombre || !descripcion) {
        return res
            .status(400)
            .json({ error: "Nombre y descripción son obligatorios" });
    }

    try {
        const [result] = await pool.query(
            `
      INSERT INTO proyectos
        (nombre, descripcion, fecha_inicio, fecha_fin, responsable_id, estado)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
            [
                nombre,
                descripcion,
                fecha_inicio || null,
                fecha_fin || null,
                responsable_id || null,       // 👈 FK al usuario responsable
                estado || "En análisis",      // valor por defecto coherente con la BD
            ]
        );

        res.status(201).json({ ok: true, proyecto_id: result.insertId });
    } catch (err) {
        console.error("[createProyecto]", err);
        res.status(500).json({ error: "Error creando proyecto" });
    }
};

export const createActivos = async (req, res) => {
    const { id } = req.params;        // id del proyecto
    const activos = req.body;         // array de activos

    if (!Array.isArray(activos) || activos.length === 0) {
        return res.status(400).json({ error: "Debes enviar al menos un activo" });
    }

    try {
        const sql = `
      INSERT INTO activos
        (proyecto_id, nombre, descripcion, tipo_activo,
         valor_confidencialidad, valor_integridad,
         valor_disponibilidad, valor_autenticidad, valor_trazabilidad)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        for (const a of activos) {
            await pool.query(sql, [
                id,
                a.nombre || a.activo,          // admitimos "nombre" o "activo"
                a.descripcion || null,
                a.tipo_activo || null,
                Number(a.valor_confidencialidad ?? 0),
                Number(a.valor_integridad ?? 0),
                Number(a.valor_disponibilidad ?? 0),
                Number(a.valor_autenticidad ?? 0),
                Number(a.valor_trazabilidad ?? 0),
            ]);
        }

        res.status(201).json({ ok: true, mensaje: "Activos registrados correctamente" });
    } catch (err) {
        console.error("[createActivos]", err);
        res.status(500).json({ error: "Error registrando activos" });
    }
};

export const createRiesgos = async (req, res) => {
    const { id } = req.params;    // id del proyecto
    const riesgos = req.body;

    if (!Array.isArray(riesgos) || riesgos.length === 0) {
        return res.status(400).json({ error: "Debes enviar al menos un riesgo" });
    }

    try {
        const sql = `
      INSERT INTO riesgos
        (proyecto_id, activo_id, nombre, descripcion,
         inh_prob, inh_impacto, inh_nivel,
         res_prob, res_impacto, res_nivel, tratamiento)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        for (const r of riesgos) {
            // 1) Resolver activo_id
            let activoId = r.activo_id;

            if (!activoId && r.activo) {
                const [rows] = await pool.query(
                    "SELECT id FROM activos WHERE proyecto_id = ? AND nombre = ? LIMIT 1",
                    [id, r.activo]
                );
                if (rows.length > 0) {
                    activoId = rows[0].id;
                }
            }

            if (!activoId) {
                throw new Error(`No se encontró activo para el riesgo '${r.nombre}'`);
            }

            await pool.query(sql, [
                id,
                activoId,
                r.nombre,
                r.descripcion || null,
                Number(r.inh_prob ?? 0),
                Number(r.inh_impacto ?? 0),
                Number(r.inh_nivel ?? 0),
                Number(r.res_prob ?? 0),
                Number(r.res_impacto ?? 0),
                Number(r.res_nivel ?? 0),
                r.tratamiento || "Reducir",
            ]);
        }

        res.status(201).json({ ok: true, mensaje: "Riesgos registrados correctamente" });
    } catch (err) {
        console.error("[createRiesgos]", err);
        res.status(500).json({ error: "Error registrando riesgos" });
    }
};

export const createMapaRiesgos = async (req, res) => {
    const { id } = req.params;      // proyecto_id
    const entradas = req.body;      // array

    if (!Array.isArray(entradas) || entradas.length === 0) {
        return res.status(400).json({
            error: "Debes enviar al menos una entrada para el mapa de riesgos",
        });
    }

    try {
        for (const e of entradas) {
            // 1) Localizar el riesgo por nombre dentro del proyecto
            const [riesgosRows] = await pool.query(
                "SELECT id FROM riesgos WHERE proyecto_id = ? AND nombre = ? LIMIT 1",
                [id, e.riesgo_nombre]
            );

            if (riesgosRows.length === 0) {
                console.warn(
                    `[createMapaRiesgos] No se encontró riesgo con nombre '${e.riesgo_nombre}' en proyecto ${id}`
                );
                continue;
            }

            const riesgoId = riesgosRows[0].id;

            // 2) Amenazas
            const amenazas = Array.isArray(e.amenazas) ? e.amenazas : [];
            for (const nombreAm of amenazas) {
                // Buscar o crear amenaza
                let amenazaId;
                const [amRows] = await pool.query(
                    "SELECT id FROM amenazas WHERE nombre = ? LIMIT 1",
                    [nombreAm]
                );
                if (amRows.length) {
                    amenazaId = amRows[0].id;
                } else {
                    const [insAm] = await pool.query(
                        "INSERT INTO amenazas (nombre) VALUES (?)",
                        [nombreAm]
                    );
                    amenazaId = insAm.insertId;
                }

                await pool.query(
                    "INSERT IGNORE INTO riesgo_amenaza (riesgo_id, amenaza_id) VALUES (?, ?)",
                    [riesgoId, amenazaId]
                );
            }

            // 3) Vulnerabilidades
            const vulnerabilidades = Array.isArray(e.vulnerabilidades)
                ? e.vulnerabilidades
                : [];

            for (const nombreV of vulnerabilidades) {
                let vulnId;
                const [vRows] = await pool.query(
                    "SELECT id FROM vulnerabilidades WHERE nombre = ? LIMIT 1",
                    [nombreV]
                );
                if (vRows.length) {
                    vulnId = vRows[0].id;
                } else {
                    const [insV] = await pool.query(
                        "INSERT INTO vulnerabilidades (nombre) VALUES (?)",
                        [nombreV]
                    );
                    vulnId = insV.insertId;
                }

                await pool.query(
                    "INSERT IGNORE INTO riesgo_vulnerabilidad (riesgo_id, vulnerabilidad_id) VALUES (?, ?)",
                    [riesgoId, vulnId]
                );
            }
        }

        res
            .status(201)
            .json({ ok: true, mensaje: "Mapa de riesgos registrado correctamente" });
    } catch (err) {
        console.error("[createMapaRiesgos]", err);
        res.status(500).json({ error: "Error registrando mapa de riesgos" });
    }
};

export const createProyectoCompleto = async (req, res) => {
    const { proyecto, modeloDeValor, matrizDeRiesgo, mapaDeRiesgos } = req.body || {};

    // === Validaciones básicas ===
    if (!proyecto || !proyecto.nombre || !proyecto.descripcion) {
        return res.status(400).json({
            error: "Faltan datos del proyecto (nombre y descripción son obligatorios)",
        });
    }

    if (!Array.isArray(modeloDeValor) || modeloDeValor.length === 0) {
        return res.status(400).json({
            error: "Debes incluir al menos un activo en modeloDeValor",
        });
    }

    const estado = proyecto.estado || "En análisis";

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 1) Insertar proyecto (usar responsable_id como en la BD)
        const responsableId = proyecto.responsable_id ?? null;

        const [projResult] = await conn.query(
            `
      INSERT INTO proyectos
        (nombre, descripcion, fecha_inicio, fecha_fin, responsable_id, estado)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
            [
                proyecto.nombre,
                proyecto.descripcion,
                proyecto.fecha_inicio || null,
                proyecto.fecha_fin || null,
                responsableId,
                estado,
            ]
        );

        const proyectoId = projResult.insertId;

        // 2) Insertar activos (modelo de valor CIDAT)
        const sqlActivo = `
      INSERT INTO activos
        (proyecto_id, nombre, descripcion, tipo_activo,
         valor_confidencialidad, valor_integridad,
         valor_disponibilidad, valor_autenticidad, valor_trazabilidad)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        for (const a of modeloDeValor) {
            const nombreActivo = a.nombre || a.activo;
            if (!nombreActivo) continue;

            await conn.query(sqlActivo, [
                proyectoId,
                nombreActivo,
                a.descripcion || null,
                a.tipo_activo || null,
                Number(a.valor_confidencialidad ?? 0),
                Number(a.valor_integridad ?? 0),
                Number(a.valor_disponibilidad ?? 0),
                Number(a.valor_autenticidad ?? 0),
                Number(a.valor_trazabilidad ?? 0),
            ]);
        }

        // 3) Insertar matriz de riesgos (si viene)
        if (Array.isArray(matrizDeRiesgo) && matrizDeRiesgo.length > 0) {
            const sqlRiesgo = `
        INSERT INTO riesgos
          (proyecto_id, activo_id, nombre, descripcion,
           inh_prob, inh_impacto, inh_nivel,
           res_prob, res_impacto, res_nivel, tratamiento)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            for (const r of matrizDeRiesgo) {
                const nombreActivo = r.activo;
                // si en el frontend no se tiene nombre de riesgo, se puede generar uno:
                const nombreRiesgo = r.nombre || r.riesgo || `Riesgo sobre ${nombreActivo || "activo"}`;
                if (!nombreActivo) continue;

                // Resolver activo_id por nombre dentro del proyecto
                const [actRows] = await conn.query(
                    "SELECT id FROM activos WHERE proyecto_id = ? AND nombre = ? LIMIT 1",
                    [proyectoId, nombreActivo]
                );

                if (!actRows.length) {
                    throw new Error(
                        `[createProyectoCompleto] No se encontró activo '${nombreActivo}' para el riesgo '${nombreRiesgo}' en proyecto ${proyectoId}`
                    );
                    continue;
                }

                const activoId = actRows[0].id;

                await conn.query(sqlRiesgo, [
                    proyectoId,
                    activoId,
                    nombreRiesgo,
                    r.descripcion || null,
                    Number(r.inh_prob ?? 0),
                    Number(r.inh_impacto ?? 0),
                    Number(r.inh_nivel ?? 0),
                    Number(r.res_prob ?? 0),
                    Number(r.res_impacto ?? 0),
                    Number(r.res_nivel ?? 0),
                    r.tratamiento || "Reducir",
                ]);
            }
        }

        // 4) Insertar mapa de riesgos (amenazas / vulnerabilidades) si viene
        if (Array.isArray(mapaDeRiesgos) && mapaDeRiesgos.length > 0) {
            for (const e of mapaDeRiesgos) {
                if (!e.activo) continue;

                // 4.1) Buscar el activo del proyecto por nombre
                const [actRows] = await conn.query(
                    "SELECT id FROM activos WHERE proyecto_id = ? AND nombre = ? LIMIT 1",
                    [proyectoId, e.activo]
                );

                if (!actRows.length) {
                    console.warn(
                        `[createProyectoCompleto] No se encontró activo '${e.activo}' en proyecto ${proyectoId} para mapa de riesgos`
                    );
                    continue;
                }

                const activoId = actRows[0].id;

                // 4.2) Buscar el riesgo asociado a ese activo dentro del proyecto
                const [riesRows] = await conn.query(
                    "SELECT id FROM riesgos WHERE proyecto_id = ? AND activo_id = ? LIMIT 1",
                    [proyectoId, activoId]
                );

                if (!riesRows.length) {
                    console.warn(
                        `[createProyectoCompleto] No se encontró riesgo para activo '${e.activo}' en proyecto ${proyectoId}`
                    );
                    continue;
                }

                const riesgoId = riesRows[0].id;

                // 4.3) Amenazas
                const amenazas = Array.isArray(e.amenazas)
                    ? e.amenazas
                    : (e.amenazas
                        ? e.amenazas.split(",").map((s) => s.trim()).filter(Boolean)
                        : []);

                for (const nombreAm of amenazas) {
                    if (!nombreAm) continue;

                    let amenazaId;
                    const [amRows] = await conn.query(
                        "SELECT id FROM amenazas WHERE nombre = ? LIMIT 1",
                        [nombreAm]
                    );
                    if (amRows.length) {
                        amenazaId = amRows[0].id;
                    } else {
                        const [insAm] = await conn.query(
                            "INSERT INTO amenazas (nombre) VALUES (?)",
                            [nombreAm]
                        );
                        amenazaId = insAm.insertId;
                    }

                    await conn.query(
                        "INSERT IGNORE INTO riesgo_amenaza (riesgo_id, amenaza_id) VALUES (?, ?)",
                        [riesgoId, amenazaId]
                    );
                }

                // 4.4) Vulnerabilidades
                const vulnerabilidades = Array.isArray(e.vulnerabilidades)
                    ? e.vulnerabilidades
                    : (e.vulnerabilidades
                        ? e.vulnerabilidades.split(",").map((s) => s.trim()).filter(Boolean)
                        : []);

                for (const nombreV of vulnerabilidades) {
                    if (!nombreV) continue;

                    let vulnId;
                    const [vRows] = await conn.query(
                        "SELECT id FROM vulnerabilidades WHERE nombre = ? LIMIT 1",
                        [nombreV]
                    );
                    if (vRows.length) {
                        vulnId = vRows[0].id;
                    } else {
                        const [insV] = await conn.query(
                            "INSERT INTO vulnerabilidades (nombre) VALUES (?)",
                            [nombreV]
                        );
                        vulnId = insV.insertId;
                    }

                    await conn.query(
                        "INSERT IGNORE INTO riesgo_vulnerabilidad (riesgo_id, vulnerabilidad_id) VALUES (?, ?)",
                        [riesgoId, vulnId]
                    );
                }
            }
        }

        // 5) Todo OK
        await conn.commit();

        return res.status(201).json({
            ok: true,
            proyecto_id: proyectoId,
            mensaje: "Proyecto y análisis de riesgos guardados correctamente",
        });
    } catch (err) {
        if (conn) {
            try {
                await conn.rollback();
            } catch (_) { }
        }
        console.error("[createProyectoCompleto] Error:", err);
        return res.status(500).json({
            error: "Error guardando proyecto completo en la base de datos",
            detail: err.message,
        });
    } finally {
        if (conn) conn.release();
    }
};

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

export const listProyectos = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `
      SELECT
        id,
        nombre,
        descripcion,
        fecha_inicio,
        fecha_fin,
        responsable_id,
        estado
      FROM proyectos
      ORDER BY id DESC
      `
        );

        res.json(rows);
    } catch (err) {
        console.error("[listProyectos]", err);
        res.status(500).json({ error: "Error obteniendo lista de proyectos" });
    }
};
