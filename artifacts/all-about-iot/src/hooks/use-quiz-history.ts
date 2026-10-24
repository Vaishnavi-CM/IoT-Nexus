import { useState, useCallback } from "react";

const STORAGE_KEY = "iot_quiz_history";
const MAX_HISTORY = 20;

export interface QuizAttempt {
  id: string;
  date: string; // ISO
  score: number;
  total: number;
  percentage: number;
  topic: string;
  difficulty: string;
}

function load(): QuizAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QuizAttempt[]) : [];
  } catch {
    return [];
  }
}

function save(attempts: QuizAttempt[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch {
    // ignore
  }
}

export function useQuizHistory() {
  const [history, setHistory] = useState<QuizAttempt[]>(() => load());

  const addAttempt = useCallback(
    (attempt: Omit<QuizAttempt, "id" | "date">) => {
      const entry: QuizAttempt = {
        ...attempt,
        id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        date: new Date().toISOString(),
      };
      setHistory((prev) => {
        const next = [entry, ...prev].slice(0, MAX_HISTORY);
        save(next);
        return next;
      });
      return entry;
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    save([]);
  }, []);

  const best = history.length
    ? Math.max(...history.map((a) => a.percentage))
    : null;

  const avg =
    history.length
      ? Math.round(history.reduce((s, a) => s + a.percentage, 0) / history.length)
      : null;

  return { history, addAttempt, clearHistory, best, avg };
}
