import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

function resolveMigrationDir(): string {
  const candidates = [
    join(__dirname, "../../sql/migrations"), // local/dev with ts-node or test runners
    join(__dirname, "../../../sql/migrations"), // compiled layout in Docker image
    join(process.cwd(), "apps/docs-api/sql/migrations")
  ];

  const found = candidates.find((dir) => existsSync(dir));
  if (!found) {
    throw new Error(`Migration directory not found. Checked: ${candidates.join(", ")}`);
  }

  return found;
}

export async function runMigrations(): Promise<void> {
  const migrationDir = resolveMigrationDir();
  const files = readdirSync(migrationDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(migrationDir, file), "utf8");
    await pool.query(sql);
  }
}
