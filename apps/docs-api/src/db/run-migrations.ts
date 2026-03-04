import { runMigrations } from "./migrate.js";
import { pool } from "./pool.js";

runMigrations()
  .catch((error) => {
    console.error("Migration error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
