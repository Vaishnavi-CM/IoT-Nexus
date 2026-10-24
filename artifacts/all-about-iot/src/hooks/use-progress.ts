import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "iot_read_concepts";

function getRead(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveRead(slugs: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...slugs]));
  } catch {
    // ignore
  }
}

export function useProgress() {
  const [readSlugs, setReadSlugs] = useState<Set<string>>(() => getRead());

  // Sync from storage when tab gains focus (handles multi-tab)
  useEffect(() => {
    const sync = () => setReadSlugs(getRead());
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  const markRead = useCallback((slug: string) => {
    setReadSlugs((prev) => {
      if (prev.has(slug)) return prev;
      const next = new Set(prev);
      next.add(slug);
      saveRead(next);
      return next;
    });
  }, []);

  const unmarkRead = useCallback((slug: string) => {
    setReadSlugs((prev) => {
      if (!prev.has(slug)) return prev;
      const next = new Set(prev);
      next.delete(slug);
      saveRead(next);
      return next;
    });
  }, []);

  const isRead = useCallback(
    (slug: string) => readSlugs.has(slug),
    [readSlugs]
  );

  return { readSlugs, markRead, unmarkRead, isRead, count: readSlugs.size };
}
