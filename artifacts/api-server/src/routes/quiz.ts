import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  GetQuizQuestionsQueryParams,
  SubmitQuizAnswerBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

interface QuizQuestionRow {
  id: number;
  question: string;
  options: string;
  correct_option: number;
  explanation: string;
  topic: string;
  difficulty: string;
}

function parseOptions(value: string): string[] {
  const parsed: unknown = JSON.parse(value);
  if (
    !Array.isArray(parsed) ||
    !parsed.every((option) => typeof option === "string")
  ) {
    throw new Error("Invalid quiz options stored in the database");
  }
  return parsed;
}

router.get("/quiz", (req, res): void => {
  const parsed = GetQuizQuestionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { topic, difficulty } = parsed.data;
  const requestedLimit = parsed.data.limit ?? 10;
  if (!Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
    res.status(400).json({ error: "limit must be a positive integer" });
    return;
  }
  const limit = Math.min(requestedLimit, 100);
  const questions = db
    .prepare(
      `SELECT id, question, options, topic, difficulty, explanation
       FROM quiz_questions
       WHERE (? IS NULL OR topic = ?)
         AND (? IS NULL OR difficulty = ?)
       ORDER BY id
       LIMIT ?`,
    )
    .all(
      topic ?? null,
      topic ?? null,
      difficulty ?? null,
      difficulty ?? null,
      limit,
    ) as Omit<QuizQuestionRow, "correct_option">[];

  res.json(
    questions.map((question) => ({
      id: question.id,
      question: question.question,
      options: parseOptions(question.options),
      topic: question.topic,
      difficulty: question.difficulty,
      explanation: question.explanation || null,
    })),
  );
});

router.post("/quiz/submit", (req, res): void => {
  const parsed = SubmitQuizAnswerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { questionId, selectedOption } = parsed.data;
  const id = questionId;

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  const question = db
    .prepare("SELECT * FROM quiz_questions WHERE id = ?")
    .get(id) as QuizQuestionRow | undefined;

  if (!question) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  const options = parseOptions(question.options);
  if (selectedOption < 0 || selectedOption >= options.length) {
    res
      .status(400)
      .json({ error: "selectedOption is outside the answer options" });
    return;
  }

  db.prepare(
    "UPDATE site_stats SET value = value + 1 WHERE key = 'questions_answered'",
  ).run();

  res.json({
    correct: selectedOption === question.correct_option,
    correctOption: question.correct_option,
    explanation: question.explanation || "No explanation available.",
  });
});

export default router;
