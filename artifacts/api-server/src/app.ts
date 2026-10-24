import { existsSync } from "node:fs";
import { resolve } from "node:path";
import express, { type ErrorRequestHandler, type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const allowedOrigins =
  process.env.CORS_ORIGIN?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? [];
const frontendDirectories = [
  resolve(process.cwd(), "../all-about-iot/dist/public"),
  resolve(process.cwd(), "artifacts/all-about-iot/dist/public"),
];
const frontendDirectory = frontendDirectories.find((directory) =>
  existsSync(resolve(directory, "index.html")),
);

app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  next();
});
if (allowedOrigins.length > 0) {
  app.use(cors({ origin: allowedOrigins }));
}
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

if (process.env.NODE_ENV === "production" && !frontendDirectory) {
  throw new Error(
    "Production frontend build is missing. Run pnpm run build before starting the server.",
  );
}

if (frontendDirectory) {
  app.use(express.static(frontendDirectory, { index: false }));
}

app.use((req, res) => {
  if (req.method === "GET" && req.accepts("html") && frontendDirectory) {
    res.sendFile(resolve(frontendDirectory, "index.html"));
    return;
  }

  res.status(404).json({ error: "Not found" });
});

const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  logger.error({ err: error }, "Request failed");
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status <= 599
      ? error.status
      : 500;

  res.status(status).json({
    error:
      status === 413
        ? "Request body too large"
        : status === 400
          ? "Invalid request"
          : "Internal server error",
  });
};

app.use(errorHandler);

export default app;
