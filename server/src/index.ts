import express from "express";
import cors from "cors";
import { env } from "./lib/env.js";
import { connectDb } from "./lib/db.js";
import { templatesRouter } from "./routes/templates.js";
import { projectsRouter } from "./routes/projects.js";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin.includes("*") ? true : env.corsOrigin,
  }),
);
app.use(express.json({ limit: "25mb" }));

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, uptime: process.uptime() }),
);
app.use("/api/templates", templatesRouter);
app.use("/api/projects", projectsRouter);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("[api]", err);
    res.status(500).json({ error: err.message });
  },
);

connectDb()
  .then(() => {
    app.listen(env.port, () =>
      console.log(`[api] listening on http://localhost:${env.port}`),
    );
  })
  .catch((err) => {
    console.error("[api] failed to start", err);
    process.exit(1);
  });
