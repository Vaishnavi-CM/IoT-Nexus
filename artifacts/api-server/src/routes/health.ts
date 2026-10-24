import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/healthz", async (_req, res): Promise<void> => {
  try {
    const result = db
      .prepare(
        `SELECT COUNT(*) AS count
         FROM sqlite_master
         WHERE type = 'table'
           AND name IN ('concepts', 'quiz_questions', 'chat_messages', 'site_stats')`,
      )
      .get() as { count: number };

    if (result.count !== 4) {
      res.status(503).json({
        status: "unavailable",
        error: "Database schema is missing.",
      });
      return;
    }

    const data = HealthCheckResponse.parse({ status: "ok" });
    res.json(data);
  } catch (error) {
    logger.error({ err: error }, "Health check failed");
    res.status(503).json({
      status: "unavailable",
      error: "Database is not available",
    });
  }
});

export default router;
