import { useState } from "react";
import { useGetQuizQuestions, useSubmitQuizAnswer } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Trophy, RefreshCcw, ArrowRight,
  History, TrendingUp, Star, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";
import { useQuizHistory } from "@/hooks/use-quiz-history";
import type { QuizAttempt } from "@/hooks/use-quiz-history";

// ── helpers ────────────────────────────────────────────────────────────────────

function pctColor(pct: number) {
  if (pct >= 80) return "text-green-500";
  if (pct >= 50) return "text-yellow-500";
  return "text-red-400";
}

function pctLabel(pct: number) {
  if (pct === 100) return "Perfect!";
  if (pct >= 80) return "Excellent";
  if (pct >= 60) return "Good";
  if (pct >= 40) return "Fair";
  return "Keep Practising";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

// ── Sparkline ─────────────────────────────────────────────────────────────────

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const w = 120, h = 32, pad = 4;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(" ")}
      />
      {pts.map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return (
          <circle
            key={i}
            cx={x} cy={y} r={i === data.length - 1 ? 3.5 : 2}
            fill={i === data.length - 1 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)"}
          />
        );
      })}
    </svg>
  );
}

// ── History panel ─────────────────────────────────────────────────────────────

function HistoryPanel({
  history, best, avg, onClear,
}: {
  history: QuizAttempt[];
  best: number | null;
  avg: number | null;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const sparkData = [...history].reverse().map((a) => a.percentage);

  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-xl border border-white/10 bg-card/30 backdrop-blur overflow-hidden"
    >
      {/* Summary bar */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-3">
          <History className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-sm">
            Quiz History — {history.length} attempt{history.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-5">
          {best !== null && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Best <span className="font-bold text-yellow-400">{best}%</span>
            </span>
          )}
          {avg !== null && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              Avg <span className={`font-bold ${pctColor(avg)}`}>{avg}%</span>
            </span>
          )}
          <Sparkline data={sparkData} />
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded table */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/8 px-5 pb-4 pt-3">
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {history.map((a, i) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {i === 0 && <Star className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
                      <span className="text-xs text-muted-foreground shrink-0">{formatDate(a.date)}</span>
                      <Badge variant="outline" className="text-xs capitalize shrink-0">{a.topic}</Badge>
                      <Badge variant="secondary" className="text-xs capitalize shrink-0">{a.difficulty}</Badge>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm text-muted-foreground">{a.score}/{a.total}</span>
                      <span className={`text-sm font-bold font-mono w-10 text-right ${pctColor(a.percentage)}`}>
                        {a.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={onClear}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear history
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Results screen ────────────────────────────────────────────────────────────

function ResultsScreen({
  score, total, topic, difficulty, history, best, avg, onRestart,
}: {
  score: number;
  total: number;
  topic: string;
  difficulty: string;
  history: QuizAttempt[];
  best: number | null;
  avg: number | null;
  onRestart: () => void;
}) {
  const percentage = Math.round((score / total) * 100);
  const isPersonalBest = best !== null && percentage >= best && history.length > 1;
  const sparkData = [...history].reverse().map((a) => a.percentage);

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.45 }}
        className="text-center"
      >
        {/* Trophy */}
        <div className="relative mb-6 inline-block">
          <Trophy className={`w-20 h-20 mx-auto ${percentage >= 80 ? "text-yellow-400" : percentage >= 50 ? "text-muted-foreground" : "text-red-400"}`} />
          {percentage === 100 && (
            <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse rounded-full z-[-1]" />
          )}
        </div>

        <h2 className="text-4xl font-bold font-display mb-2">{pctLabel(percentage)}</h2>
        {isPersonalBest && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-yellow-400 font-semibold mb-2 flex items-center justify-center gap-1.5"
          >
            <Star className="w-4 h-4" /> New Personal Best!
          </motion.p>
        )}
        <p className="text-3xl mb-6">
          <span className="font-bold text-primary">{score}</span>
          <span className="text-muted-foreground"> / {total}</span>
          <span className={`ml-2 font-bold ${pctColor(percentage)}`}>({percentage}%)</span>
        </p>

        {/* Stats row */}
        {history.length > 1 && (
          <div className="flex justify-center gap-8 mb-8 text-sm">
            {best !== null && (
              <div className="text-center">
                <p className="text-muted-foreground text-xs mb-0.5">Best ever</p>
                <p className="font-bold text-yellow-400 text-lg">{best}%</p>
              </div>
            )}
            {avg !== null && (
              <div className="text-center">
                <p className="text-muted-foreground text-xs mb-0.5">Your avg</p>
                <p className={`font-bold text-lg ${pctColor(avg)}`}>{avg}%</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-0.5">Attempts</p>
              <p className="font-bold text-lg">{history.length}</p>
            </div>
          </div>
        )}

        {/* Trend chart */}
        {sparkData.length >= 2 && (
          <div className="flex flex-col items-center mb-8 p-4 rounded-xl bg-card/40 border border-white/8">
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 text-primary" />
              Score trend (last {sparkData.length} attempts)
            </div>
            <Sparkline data={sparkData} />
            <div className="flex justify-between w-[120px] mt-1 text-xs text-muted-foreground/60">
              <span>oldest</span><span>latest</span>
            </div>
          </div>
        )}

        <Button size="lg" onClick={onRestart} className="px-10 text-lg shadow-lg">
          <RefreshCcw className="mr-2 h-5 w-5" /> Retake Quiz
        </Button>
      </motion.div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Quiz() {
  const [topic, setTopic] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<string>("all");

  const queryParams: Record<string, string> = {};
  if (topic !== "all") queryParams.topic = topic;
  if (difficulty !== "all") queryParams.difficulty = difficulty;

  const { data: questions, isLoading, refetch } = useGetQuizQuestions(queryParams as any);
  const submitAnswer = useSubmitQuizAnswer();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const { history, addAttempt, clearHistory, best, avg } = useQuizHistory();

  const currentQuestion = questions?.[currentIndex];
  const progress = questions ? (currentIndex / questions.length) * 100 : 0;

  const handleSelectOption = (idx: number) => {
    if (!isAnswered) setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !currentQuestion) return;
    submitAnswer.mutate(
      { data: { questionId: currentQuestion.id, selectedOption } },
      {
        onSuccess: (result) => {
          setIsAnswered(true);
          setFeedback({ correct: result.correct, explanation: result.explanation });
          if (result.correct) setScore((s) => s + 1);
        },
      }
    );
  };

  const handleNext = () => {
    if (!questions) return;
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setFeedback(null);
    } else {
      // Save to history before showing results
      addAttempt({
        score,
        total: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        topic,
        difficulty,
      });
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setFeedback(null);
    setIsFinished(false);
    refetch();
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Skeleton className="h-12 w-64 mb-8 mx-auto" />
        <Card className="w-full border-white/10 bg-card/50">
          <CardContent className="p-8">
            <Skeleton className="h-4 w-full mb-8" />
            <Skeleton className="h-8 w-3/4 mb-12" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-xl">
        <h2 className="text-2xl font-bold mb-4 font-display">No questions found</h2>
        <p className="text-muted-foreground mb-8">Try selecting a different topic or difficulty level.</p>
        <Button onClick={handleRestart}>Reset Filters</Button>
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────────
  if (isFinished) {
    return (
      <ResultsScreen
        score={score}
        total={questions.length}
        topic={topic}
        difficulty={difficulty}
        history={history}
        best={best}
        avg={avg}
        onRestart={handleRestart}
      />
    );
  }

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">Test Your Knowledge</h1>
        <p className="text-lg text-muted-foreground">Challenge yourself with questions covering all aspects of IoT.</p>
      </div>

      {/* History panel */}
      <HistoryPanel history={history} best={best} avg={avg} onClear={clearHistory} />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-card/30 p-4 rounded-xl border border-white/8">
        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>

          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="font-medium text-muted-foreground">
          Score: <span className="text-primary font-bold text-xl">{score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2 text-muted-foreground">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Completed</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-white/10 bg-card/50 backdrop-blur shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
            <CardHeader className="pt-8">
              <div className="flex gap-2 mb-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary">{currentQuestion?.topic}</Badge>
                <Badge variant="outline" className="capitalize">{currentQuestion?.difficulty}</Badge>
              </div>
              <CardTitle className="text-2xl font-display leading-tight">{currentQuestion?.question}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 pb-6">
              {currentQuestion?.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                let style = "border-white/10 hover:border-primary/50 hover:bg-primary/5 cursor-pointer";
                if (isAnswered) {
                  style = "border-white/10 opacity-60 cursor-default";
                  if (isSelected && feedback?.correct) style = "border-green-500 bg-green-500/10 text-green-500 cursor-default";
                  if (isSelected && !feedback?.correct) style = "border-red-500 bg-red-500/10 text-red-500 cursor-default";
                } else if (isSelected) {
                  style = "border-primary bg-primary/10";
                }
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 rounded-lg border transition-all ${style} flex items-center justify-between`}
                  >
                    <span className="font-medium">{option}</span>
                    {isAnswered && isSelected && feedback?.correct && <CheckCircle2 className="text-green-500 w-5 h-5 shrink-0" />}
                    {isAnswered && isSelected && !feedback?.correct && <XCircle className="text-red-500 w-5 h-5 shrink-0" />}
                  </div>
                );
              })}
            </CardContent>

            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`p-6 border-t border-white/5 ${feedback?.correct ? "bg-green-500/5" : "bg-red-500/5"}`}
              >
                <div className="flex items-start gap-3">
                  {feedback?.correct
                    ? <CheckCircle2 className="text-green-500 w-6 h-6 shrink-0 mt-0.5" />
                    : <XCircle className="text-red-500 w-6 h-6 shrink-0 mt-0.5" />}
                  <div>
                    <h4 className={`font-bold mb-1 ${feedback?.correct ? "text-green-500" : "text-red-500"}`}>
                      {feedback?.correct ? "Correct!" : "Incorrect"}
                    </h4>
                    <p className="text-muted-foreground">{feedback?.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <CardFooter className="pt-6 pb-8 flex justify-end bg-background/30 border-t border-border">
              {!isAnswered ? (
                <Button
                  onClick={handleSubmit}
                  disabled={selectedOption === null || submitAnswer.isPending}
                  className="px-8"
                >
                  {submitAnswer.isPending ? "Submitting…" : "Submit Answer"}
                </Button>
              ) : (
                <Button onClick={handleNext} className="px-8">
                  {currentIndex < questions.length - 1 ? "Next Question" : "View Results"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
