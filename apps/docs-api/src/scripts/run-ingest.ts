import { runFullIngest } from "../services/ingest/service.js";
import { pool } from "../db/pool.js";

async function main(): Promise<void> {
  const reposArg = process.argv.find((arg) => arg.startsWith("--repos="));
  const repos = reposArg
    ? reposArg.replace("--repos=", "").split(",").map((item) => item.trim()).filter(Boolean)
    : undefined;

  const results = await runFullIngest(repos);
  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
