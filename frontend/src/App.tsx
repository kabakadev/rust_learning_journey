import { useEffect, useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import {
  Trophy,
  Flame,
  CheckCircle2,
  Lock,
  Terminal,
  RefreshCw,
  Zap,
  Brain,
  LayoutDashboard,
  Target,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { calculateLevel, isDailyGoalMet } from "./gameLogic";

// --- TYPES ---
interface UserStats {
  current_streak: number;
  total_xp: number;
  last_push_date: string | null;
}
interface Chapter {
  chapter_name: string;
  is_completed: boolean;
}

function App() {
  const { width, height } = useWindowSize();
  const [stats, setStats] = useState<UserStats>({
    current_streak: 0,
    total_xp: 0,
    last_push_date: null,
  });
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // GAME STATE
  const levelInfo = calculateLevel(stats.total_xp);
  const dailyGoalComplete = isDailyGoalMet(stats.last_push_date);

  const fetchData = () => {
    setLoading(true);
    setError("");
    axios
      .get("https://ian-dev.top/api/stats")
      .then((response) => {
        const newStats = response.data.stats || {
          current_streak: 0,
          total_xp: 0,
          last_push_date: null,
        };
        const newChapters = response.data.chapters || [];

        // CHECK FOR RECENT COMPLETION (Simple logic: if XP changed significantly, trigger confetti)
        // For now, we just check if "Daily Goal" is met and trigger confetti once per session if desired.
        // Or better: Logic could be added to backend to return "just_leveled_up: true".
        // For now, let's trigger it if Daily Goal is met!
        if (isDailyGoalMet(newStats.last_push_date)) {
          // Only show if we haven't shown it this session?
          // For fun, let's show it for 5 seconds on load if goal is met.
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 6000);
        }

        setStats(newStats);
        setChapters(newChapters);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not connect to Phone Server.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalChapters = chapters.length || 1;
  const completedCount = chapters.filter((c) => c.is_completed).length;
  const courseProgress = Math.round((completedCount / totalChapters) * 100);

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
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-1.5 rounded-lg shadow-lg shadow-orange-900/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Rust<span className="text-slate-500">Journey</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-white/5"
                onClick={fetchData}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-2 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Sync
              </Button>
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
          {/* 1. HERO & LEVEL SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Greeting */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <h1 className="text-5xl font-extrabold tracking-tight text-white">
                  Level {levelInfo.level}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                    {levelInfo.title}
                  </span>
                </h1>
                <p className="text-slate-400 text-lg">
                  You are{" "}
                  <span className="text-white font-bold">
                    {Math.round(
                      levelInfo.xpRequiredForNextLevel -
                        levelInfo.xpInCurrentLevel
                    )}{" "}
                    XP
                  </span>{" "}
                  away from the next level.
                </p>
              </div>

              {/* Level Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs uppercase tracking-widest text-slate-500 font-semibold">
                  <span>Lvl {levelInfo.level}</span>
                  <span>{Math.round(levelInfo.progress)}%</span>
                  <span>Lvl {levelInfo.level + 1}</span>
                </div>
                <div className="h-4 bg-slate-900/50 rounded-full overflow-hidden border border-white/5 relative">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-500 transition-all duration-1000 ease-out relative"
                    style={{ width: `${levelInfo.progress}%` }}
                  >
                    <div className="absolute right-0 top-0 h-full w-20 bg-white/20 blur-md"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Daily Quest Card */}
            <Card
              className={`
                        border-0 transition-all duration-500
                        ${
                          dailyGoalComplete
                            ? "bg-gradient-to-br from-green-900/40 to-slate-900/60 border-green-500/30"
                            : "bg-slate-900/40 border-white/5"
                        }
                    `}
            >
              <CardContent className="p-6 flex flex-col justify-center h-full space-y-4">
                <div className="flex justify-between items-start">
                  <div
                    className={`p-3 rounded-xl ${
                      dailyGoalComplete
                        ? "bg-green-500/20 text-green-400"
                        : "bg-slate-800 text-slate-500"
                    }`}
                  >
                    <Target className="w-6 h-6" />
                  </div>
                  {dailyGoalComplete && (
                    <Badge className="bg-green-500 text-black hover:bg-green-400">
                      COMPLETED
                    </Badge>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Daily Quest</h3>
                  <p className="text-sm text-slate-400">
                    Push at least 1 commit to GitHub today.
                  </p>
                </div>
                <div className="pt-2">
                  <div
                    className={`text-sm font-medium ${
                      dailyGoalComplete
                        ? "text-green-400"
                        : "text-orange-400 animate-pulse"
                    }`}
                  >
                    {dailyGoalComplete
                      ? "Mission Accomplished! (+Streak)"
                      : "Status: Pending..."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 2. MAIN STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/40 backdrop-blur-sm border-white/5 hover:bg-slate-900/60 transition-all group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/10 group-hover:border-purple-500/30 transition-colors">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="text-slate-500 text-sm font-mono">XP</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  {stats.total_xp}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 backdrop-blur-sm border-white/5 hover:bg-slate-900/60 transition-all group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/10 group-hover:border-orange-500/30 transition-colors">
                    <Flame className="w-6 h-6 fill-orange-500/20" />
                  </div>
                  <span className="text-slate-500 text-sm font-mono">
                    STREAK
                  </span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  {stats.current_streak}{" "}
                  <span className="text-lg text-slate-600 font-medium">
                    Days
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/40 backdrop-blur-sm border-white/5 hover:bg-slate-900/60 transition-all group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <span className="text-slate-500 text-sm font-mono">
                    PROGRESS
                  </span>
                </div>
                <div className="text-4xl font-bold text-white mb-1">
                  {courseProgress}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. CHAPTER LOG */}
          <div className="space-y-6 pt-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-slate-500" />
              Mission Log
            </h2>

            <div className="grid gap-3">
              {chapters.map((chapter, i) => (
                <div
                  key={i}
                  className={`
                                group flex items-center justify-between p-4 rounded-xl border transition-all duration-300
                                ${
                                  chapter.is_completed
                                    ? "bg-green-500/5 border-green-500/20 hover:border-green-500/40"
                                    : "bg-slate-800/30 border-white/5 opacity-70 hover:opacity-100 hover:border-white/10"
                                }
                            `}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                                        w-10 h-10 rounded-lg flex items-center justify-center border transition-all
                                        ${
                                          chapter.is_completed
                                            ? "bg-green-500/20 text-green-400 border-green-500/20 scale-110"
                                            : "bg-slate-900 text-slate-600 border-white/5"
                                        }
                                    `}
                    >
                      {chapter.is_completed ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <h3
                        className={`font-medium text-base capitalize ${
                          chapter.is_completed ? "text-white" : "text-slate-400"
                        }`}
                      >
                        {chapter.chapter_name
                          .replace(/_/g, " ")
                          .replace("chapter", "")}
                      </h3>
                      {/* Fake XP reward text for motivation */}
                      <p className="text-xs text-slate-500 mt-0.5">
                        {chapter.is_completed ? "Completed" : "+100 XP Reward"}
                      </p>
                    </div>
                  </div>

                  <div className="text-slate-600">
                    {chapter.is_completed ? (
                      <Badge className="bg-green-900/20 text-green-500 hover:bg-green-900/30 border-0">
                        DONE
                      </Badge>
                    ) : (
                      <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
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
