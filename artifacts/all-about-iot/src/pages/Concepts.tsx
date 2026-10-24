import { useGetConcepts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, PlayCircle, Cpu, Activity, CheckCircle2, Trophy, BookOpen } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";

export default function Concepts() {
  const { data: concepts, isLoading } = useGetConcepts();
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const { isRead, count } = useProgress();

  const filteredConcepts = useMemo(() => {
    if (!concepts) return [];
    return concepts.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase());
      const matchesLevel = filterLevel === "all" || c.level === filterLevel;
      return matchesSearch && matchesLevel;
    });
  }, [concepts, search, filterLevel]);

  const total = concepts?.length ?? 0;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          Concepts Library
        </h1>
        <p className="text-lg text-muted-foreground">Master the theory behind the Internet of Things.</p>
      </div>

      {/* ── Progress tracker ────────────────────────────────────────────── */}
      {!isLoading && total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-8 rounded-xl border border-primary/20 bg-primary/5 p-5"
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              {pct === 100 ? (
                <Trophy className="h-5 w-5 text-yellow-400" />
              ) : (
                <BookOpen className="h-5 w-5 text-primary" />
              )}
              <span className="font-semibold text-sm">
                {pct === 100
                  ? "🎉 All concepts read! You're an IoT expert."
                  : `Your Learning Progress — ${count} of ${total} concepts read`}
              </span>
            </div>
            <span className="text-2xl font-bold font-mono text-primary">{pct}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 w-full rounded-full bg-primary/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {/* Level breakdown */}
          {concepts && (
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              {["beginner", "intermediate", "advanced"].map((lvl) => {
                const lvlConcepts = concepts.filter((c) => c.level === lvl);
                const lvlRead = lvlConcepts.filter((c) => isRead(c.slug)).length;
                const colors: Record<string, string> = {
                  beginner: "text-green-500",
                  intermediate: "text-yellow-500",
                  advanced: "text-red-400",
                };
                return (
                  <span key={lvl} className="capitalize">
                    <span className={`font-semibold ${colors[lvl]}`}>{lvlRead}/{lvlConcepts.length}</span>
                    {" "}{lvl}
                  </span>
                );
              })}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search concepts..."
            className="pl-10 h-12 text-lg bg-background/50 backdrop-blur"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {["all", "beginner", "intermediate", "advanced"].map((level) => (
            <Badge
              key={level}
              variant={filterLevel === level ? "default" : "outline"}
              className="cursor-pointer capitalize text-sm py-2 px-4 shrink-0"
              onClick={() => setFilterLevel(level)}
            >
              {level}
            </Badge>
          ))}
        </div>
      </div>

      {/* ── Cards grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))
        ) : filteredConcepts.length > 0 ? (
          filteredConcepts.map((concept, idx) => {
            const read = isRead(concept.slug);
            return (
              <motion.div
                key={concept.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={`/concepts/${concept.slug}`}>
                  <Card className={`h-full cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all bg-card/50 backdrop-blur group overflow-hidden relative ${read ? "border-green-500/30" : ""}`}>
                    {/* Hover gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Read ribbon */}
                    {read && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Read
                        </span>
                      </div>
                    )}

                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="capitalize">{concept.level}</Badge>
                        {!read && <Badge variant="outline">{concept.category}</Badge>}
                      </div>
                      <CardTitle className={`font-display text-xl group-hover:text-primary transition-colors ${read ? "text-muted-foreground" : ""}`}>
                        {concept.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <CardDescription className="text-base mb-4 line-clamp-2">
                        {concept.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2">
                        {concept.hasAnimation && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                            <PlayCircle className="w-3 h-3 mr-1" /> Animation
                          </Badge>
                        )}
                        {concept.hasSimulation && (
                          <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                            <Cpu className="w-3 h-3 mr-1" /> Simulation
                          </Badge>
                        )}
                        {concept.hasDashboard && (
                          <Badge variant="secondary" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                            <Activity className="w-3 h-3 mr-1" /> Dashboard
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-20 text-muted-foreground">
            No concepts found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
