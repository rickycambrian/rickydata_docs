import cors from "cors";
import express, { type Request, type Response, type NextFunction } from "express";
import pino from "pino";
import { env } from "./config.js";
import { runMigrations } from "./db/migrate.js";
import { healthRouter } from "./routes/health.js";
import { internalRouter } from "./routes/internal.js";
import { publicRouter } from "./routes/public.js";

const logger = pino({ name: "rickydata-docs-api" });
const app = express();

app.disable("x-powered-by");
app.use((req, _res, next) => {
  logger.info({ method: req.method, path: req.path }, "incoming request");
  next();
});
app.use(cors({ origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN }));
app.use(express.json({ limit: "2mb" }));

app.use(healthRouter);
app.use("/api/public", publicRouter);
app.use("/api/internal", internalRouter);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  logger.error({ err: error }, "Unhandled error");
  res.status(500).json({ error: message });
});

async function bootstrap(): Promise<void> {
  await runMigrations();
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "Docs API listening");
  });
}

bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to start docs API");
  process.exit(1);
});
