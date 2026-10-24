import { Router, type IRouter } from "express";
import { db } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats", (_req, res): void => {
  const [{ count: totalConcepts }] = db
    .prepare("SELECT COUNT(*) AS count FROM concepts")
    .all() as Array<{ count: number }>;

  const categories = db
    .prepare(
      "SELECT category, COUNT(*) AS count FROM concepts GROUP BY category",
    )
    .all() as Array<{ category: string; count: number }>;

  const questionsAnswered = db
    .prepare("SELECT value FROM site_stats WHERE key = ?")
    .get("questions_answered") as { value: number } | undefined;

  const topicsCount: Record<string, number> = {};
  for (const row of categories) {
    topicsCount[row.category] = row.count;
  }

  res.json({
    totalConcepts,
    totalCategories: categories.length,
    totalQuestionsAnswered: questionsAnswered?.value ?? 0,
    topicsCount,
  });
});

export default router;
