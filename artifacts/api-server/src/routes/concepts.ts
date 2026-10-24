import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { GetConceptParams } from "@workspace/api-zod";

const router: IRouter = Router();

interface ConceptRow {
  id: number;
  slug: string;
  title: string;
  category: string;
  level: string;
  description: string;
  content: string;
  key_points: string;
  has_animation: number;
  has_simulation: number;
  has_dashboard: number;
  related_concepts: string;
}

function parseStringArray(value: string): string[] {
  const parsed: unknown = JSON.parse(value);
  if (
    !Array.isArray(parsed) ||
    !parsed.every((item) => typeof item === "string")
  ) {
    throw new Error("Invalid concept list stored in the database");
  }
  return parsed;
}

router.get("/concepts", (_req, res): void => {
  const concepts = db
    .prepare("SELECT * FROM concepts ORDER BY id")
    .all() as unknown as ConceptRow[];

  res.json(
    concepts.map((concept) => ({
      id: concept.id,
      slug: concept.slug,
      title: concept.title,
      category: concept.category,
      level: concept.level,
      description: concept.description,
      hasAnimation: Boolean(concept.has_animation),
      hasSimulation: Boolean(concept.has_simulation),
      hasDashboard: Boolean(concept.has_dashboard),
    })),
  );
});

router.get("/concepts/:slug", (req, res): void => {
  const parsed = GetConceptParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const concept = db
    .prepare("SELECT * FROM concepts WHERE slug = ?")
    .get(parsed.data.slug) as unknown as ConceptRow | undefined;

  if (!concept) {
    res.status(404).json({ error: "Concept not found" });
    return;
  }

  res.json({
    id: concept.id,
    slug: concept.slug,
    title: concept.title,
    category: concept.category,
    level: concept.level,
    description: concept.description,
    content: concept.content,
    keyPoints: parseStringArray(concept.key_points),
    hasAnimation: Boolean(concept.has_animation),
    hasSimulation: Boolean(concept.has_simulation),
    hasDashboard: Boolean(concept.has_dashboard),
    relatedConcepts: parseStringArray(concept.related_concepts),
  });
});

export default router;
