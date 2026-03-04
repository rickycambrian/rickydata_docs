import { Pool } from "pg";
import { env } from "../config.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000
});

export async function healthcheckDb(): Promise<boolean> {
  const result = await pool.query("SELECT 1 as ok");
  return result.rows[0]?.ok === 1;
}
