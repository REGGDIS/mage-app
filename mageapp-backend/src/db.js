import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config({ path: "./.env" });

// Crear pool de conexiones
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,

  // Opcionales recomendados para dev/demo
  namedPlaceholders: true,  // permite usar :param en queries
  timezone: "Z",            // maneja DATETIME en UTC
  dateStrings: true,        // devuelve DATETIME como string
  supportBigNumbers: true,
  bigNumberStrings: true,   // evita pérdidas en BIGINT/DECIMAL
});

// Probar la conexión al arrancar (log rápido)
(async () => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    const ok = Number(rows[0].ok) === 1;   // normalizamos a número
    console.log("DB OK:", ok ? "conectada" : "desconocido");
  } catch (e) {
    console.error("DB ERROR:", e.message);
  }
})();

// Ping periódico (mantener viva la conexión en dev)
setInterval(async () => {
  try { await pool.query("SELECT 1"); } catch { }
}, 60_000);

// Cierre limpio del pool al terminar el proceso
process.on("SIGINT", async () => {
  try {
    await pool.end();
    console.log("DB pool cerrado correctamente");
  } catch (e) {
    console.error("Error cerrando DB pool:", e.message);
  } finally {
    process.exit(0);
  }
});
