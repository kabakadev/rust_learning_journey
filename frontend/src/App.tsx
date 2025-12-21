import { useEffect, useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import {
  Trophy,
  Flame,
  CheckCircle2,
  Lock,
  RefreshCw,
  Zap,
  Brain,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Copy,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calculateLevel,
  isDailyGoalMet,
  groupChapters,
  ChapterGroup,
} from "./gameLogic";

// --- TYPES ---
interface UserStats {
  current_streak: number;
  total_xp: number;
  last_push_date: string | null;
}

function App() {
  const { width, height } = useWindowSize();
  const [stats, setStats] = useState<UserStats>({
    current_streak: 0,
    total_xp: 0,
    last_push_date: null,
  });
  const [modules, setModules] = useState<ChapterGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // New State for "Copied!" feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const levelInfo = calculateLevel(stats.total_xp);
  const dailyGoalComplete = isDailyGoalMet(stats.last_push_date);

  const fetchData = () => {
    setLoading(true);
    axios
      .get("https://ian-dev.top/api/stats")
      .then((response) => {
        const newStats = response.data.stats || {
          current_streak: 0,
          total_xp: 0,
          last_push_date: null,
        };
        const rawChapters = response.data.chapters || [];

        const grouped = groupChapters(rawChapters);
        setModules(grouped);

        if (!expandedModule) {
          const activeModule = grouped.find((g) => g.progress < 100);
          if (activeModule) setExpandedModule(activeModule.id);
        }

        if (
          newStats.last_push_date &&
          isDailyGoalMet(newStats.last_push_date)
        ) {
          const todayStr = new Date().toISOString().split("T")[0];
          const storageKey = `confetti_shown_${todayStr}`;
          const alreadyCelebrated = localStorage.getItem(storageKey);

          if (!alreadyCelebrated) {
            setShowConfetti(true);
            localStorage.setItem(storageKey, "true");
            setTimeout(() => setShowConfetti(false), 5000);
          }
        }

        setStats(newStats);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- NEW: Copy Command Logic ---
  const copyCommand = (chapterName: string) => {
    // Generates: cargo new chapter_03_01_variables
    const command = `cargo new ${chapterName}`;
    navigator.clipboard.writeText(command);

    // Show checkmark for 2 seconds
    setCopiedId(chapterName);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalModules = modules.length || 1;
  const completedModules = modules.filter((m) => m.isCompleted).length;
  const overallProgress = Math.round((completedModules / totalModules) * 100);

  return (
    <div className="min-h-screen font-sans text-slate-100 selection:bg-orange-500/30 bg-[#0F172A]">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <div className="fixed inset-0 bg-gradient-to-br from-[#0F172A] via-[#1e1b4b] to-[#0F172A] z-0" />

      <div className="relative z-10">
        {/* NAVBAR */}
        <nav className="border-b border-white/5 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-1.5 rounded-lg shadow-lg shadow-orange-900/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Rust<span className="text-slate-500">Journey</span>
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </nav>

        <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
          {/* HERO STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/40 backdrop-blur-sm border-white/5 p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-slate-500">XP</span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-white">
                  {stats.total_xp}
                </div>
                <div className="text-sm text-slate-400">
                  Level {levelInfo.level}
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/40 backdrop-blur-sm border-white/5 p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
                  <Flame className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-slate-500">STREAK</span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-white">
                  {stats.current_streak}{" "}
                  <span className="text-lg text-slate-500">Days</span>
                </div>
                <div
                  className={`text-sm ${
                    dailyGoalComplete ? "text-green-400" : "text-orange-400"
                  }`}
                >
                  {dailyGoalComplete ? "Daily Goal Met" : "Push code today!"}
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/40 backdrop-blur-sm border-white/5 p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono text-slate-500">
                  CURRICULUM
                </span>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-white">
                  {overallProgress}%
                </div>
                <div className="text-sm text-slate-400">
                  {completedModules} / {totalModules} Modules Done
                </div>
              </div>
            </Card>
          </div>

          {/* CURRICULUM ACCORDION */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-slate-400" />
              The Path
            </h2>

            <div className="space-y-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className={`border rounded-2xl transition-all duration-300 overflow-hidden
                                ${
                                  module.isCompleted
                                    ? "bg-green-900/10 border-green-500/20"
                                    : module.id === expandedModule
                                    ? "bg-slate-800/40 border-slate-600 shadow-xl"
                                    : "bg-slate-900/40 border-white/5 opacity-80 hover:opacity-100 hover:border-white/10"
                                }`}
                >
                  {/* HEADER */}
                  <div
                    className="p-5 flex items-center justify-between cursor-pointer select-none"
                    onClick={() =>
                      setExpandedModule(
                        expandedModule === module.id ? null : module.id
                      )
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`
                                            w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold font-mono
                                            ${
                                              module.isCompleted
                                                ? "bg-green-500 text-black"
                                                : "bg-slate-800 text-slate-400"
                                            }
                                        `}
                      >
                        {parseInt(module.id)}
                      </div>
                      <div>
                        <h3
                          className={`font-semibold text-lg ${
                            module.isCompleted ? "text-green-400" : "text-white"
                          }`}
                        >
                          {module.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span>{module.sections.length} Topics</span>
                          {module.quests.length > 0 && (
                            <span className="flex items-center gap-1 text-yellow-500/80">
                              <Zap className="w-3 h-3" /> {module.quests.length}{" "}
                              Quests
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden md:block w-32">
                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              module.isCompleted
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>
                      {expandedModule === module.id ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* BODY */}
                  {expandedModule === module.id && (
                    <div className="border-t border-white/5 bg-black/20 p-4 space-y-4">
                      {/* SECTIONS LIST */}
                      <div className="grid grid-cols-1 gap-3">
                        {module.sections.map((sec, i) => (
                          <div
                            key={i}
                            className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${
                              sec.is_completed
                                ? "bg-green-500/10 border-green-500/20"
                                : "bg-slate-800/50 border-white/5 hover:bg-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {sec.is_completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-slate-600 ml-1.5 mr-1.5" />
                              )}
                              <div>
                                <div
                                  className={`text-sm font-medium ${
                                    sec.is_completed
                                      ? "text-white"
                                      : "text-slate-300"
                                  }`}
                                >
                                  {sec.chapter_name
                                    .split("_")
                                    .slice(3)
                                    .join(" ")}
                                </div>
                                {/* Show Raw Name for reference */}
                                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                                  {sec.chapter_name}
                                </div>
                              </div>
                            </div>

                            {/* COPY BUTTON (Only if not completed to save space, or always if you prefer) */}
                            {!sec.is_completed && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-700"
                                onClick={() => copyCommand(sec.chapter_name)}
                                title="Copy 'cargo new' command"
                              >
                                {copiedId === sec.chapter_name ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* QUESTS LIST */}
                      {module.quests.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Zap className="w-3 h-3" /> Side Quests
                          </h4>
                          <div className="grid grid-cols-1 gap-3">
                            {module.quests.map((quest, i) => (
                              <div
                                key={i}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                                  quest.is_completed
                                    ? "bg-yellow-500/10 border-yellow-500/20"
                                    : "bg-yellow-900/5 border-yellow-500/10 hover:border-yellow-500/30"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {quest.is_completed ? (
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-yellow-700" />
                                  )}
                                  <div>
                                    <div
                                      className={`text-sm font-medium ${
                                        quest.is_completed
                                          ? "text-yellow-100"
                                          : "text-yellow-500/70"
                                      }`}
                                    >
                                      {quest.chapter_name
                                        .split("_")
                                        .slice(3)
                                        .join(" ")}
                                    </div>
                                    <div className="text-[10px] font-mono text-yellow-500/40 mt-0.5">
                                      {quest.chapter_name}
                                    </div>
                                  </div>
                                </div>

                                {!quest.is_completed && (
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] border-yellow-500/20 text-yellow-600 hidden md:block"
                                    >
                                      150 XP
                                    </Badge>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-yellow-700 hover:text-yellow-400 hover:bg-yellow-900/20"
                                      onClick={() =>
                                        copyCommand(quest.chapter_name)
                                      }
                                    >
                                      {copiedId === quest.chapter_name ? (
                                        <Check className="w-4 h-4" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
