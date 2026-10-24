import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface FlashCardData {
  q: string;
  a: string;
  tag?: string;
}

interface FlashCardDeckProps {
  cards: FlashCardData[];
  title?: string;
  accentColor?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function FlashCardDeck({ cards, title, accentColor = "from-primary to-accent" }: FlashCardDeckProps) {
  const [deck, setDeck] = useState(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState(1);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));

  const current = deck[index];
  const total = deck.length;
  const progress = Math.round((seen.size / total) * 100);

  const go = useCallback((dir: number) => {
    const next = (index + dir + total) % total;
    setDirection(dir);
    setFlipped(false);
    setTimeout(() => {
      setIndex(next);
      setSeen(s => { const n = new Set(s); n.add(next); return n; });
    }, 120);
  }, [index, total]);

  const handleShuffle = () => {
    setDeck(shuffle(cards));
    setIndex(0);
    setFlipped(false);
    setSeen(new Set([0]));
  };

  const handleReset = () => {
    setDeck(cards);
    setIndex(0);
    setFlipped(false);
    setSeen(new Set([0]));
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold text-sm">{title ?? "Flashcards"}</span>
          <Badge variant="secondary" className="text-xs">{total} cards</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{seen.size}/{total} seen</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleShuffle} title="Shuffle">
            <Shuffle className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset} title="Reset">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-muted rounded-full mb-5 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${accentColor}`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Card */}
      <div
        className="relative cursor-pointer select-none"
        style={{ perspective: "1200px", minHeight: 200 }}
        onClick={() => setFlipped(f => !f)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${index}-${flipped}`}
            initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`rounded-2xl border p-7 min-h-[200px] flex flex-col justify-between relative overflow-hidden ${
              flipped
                ? "bg-gradient-to-br from-primary/10 via-accent/5 to-card/80 border-primary/30"
                : "bg-card/60 border-white/10 hover:border-white/20"
            } backdrop-blur shadow-xl transition-colors`}
          >
            {/* Corner glow on flip */}
            {flipped && (
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
            )}

            <div className="relative z-10">
              <span className={`inline-block text-xs font-bold uppercase tracking-widest mb-3 ${flipped ? "text-primary" : "text-muted-foreground/60"}`}>
                {flipped ? "Answer" : "Question"}
              </span>
              {current.tag && !flipped && (
                <Badge variant="outline" className="ml-2 text-xs">{current.tag}</Badge>
              )}
              <p className={`text-base md:text-lg font-medium leading-relaxed ${flipped ? "text-foreground" : "text-foreground/90"}`}>
                {flipped ? current.a : current.q}
              </p>
            </div>

            <div className="relative z-10 mt-4 text-xs text-muted-foreground/50 text-right">
              {flipped ? "Click to flip back" : "Click card to reveal answer"}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" onClick={() => go(-1)} className="gap-1">
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>
        <span className="text-sm text-muted-foreground font-mono">
          {index + 1} / {total}
        </span>
        <Button variant="outline" size="sm" onClick={() => go(1)} className="gap-1">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
