import { useEffect, useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import {
  Trophy,
  Flame,
  CheckCircle2,
  RefreshCw,
  Zap,
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Info,
  ArrowRight,
  Terminal,
  Brain, // Added Brain icon for the chart
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"; // <--- NEW IMPORTS
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  calculateLevel,
  isDailyGoalMet,
  groupChapters,
  ChapterGroup,
  getRank,
  getHeatmapData,
  calculateSkills, // <--- NEW IMPORT
} from "./gameLogic";

// --- TYPES ---
interface UserStats {
  current_streak: number;
  total_xp: number;
  last_push_date: string | null;
}

// --- QUEST DATA ---
const QUEST_DATA: Record<
  string,
  { title: string; objective: string; criteria: string[] }
> = {
  quest_01_01_hello_universe: {
    title: "Hello, Universe!",
    objective:
      "Go beyond 'Hello World'. Create a program that prints a formatted welcome message using variables.",
    criteria: [
      "Store a name in a variable.",
      "Print 'Hello, Universe! My name is [YourName]'.",
      "Use 'cargo run' to verify the output.",
    ],
  },
  quest_02_01_reverse_guessing_game: {
    title: "The Reverse Guessing Game",
    objective:
      "Flip the script! You pick a number, and the computer tries to guess it.",
    criteria: [
      "User thinks of a number between 1-100.",
      "Computer makes a guess.",
      "User inputs 'high', 'low', or 'correct'.",
      "Computer adjusts its range (Binary Search logic) until it wins.",
    ],
  },
  quest_03_01_temperature_converter: {
    title: "Thermostat Logic",
    objective:
      "Build a CLI tool that converts temperatures between Fahrenheit and Celsius.",
    criteria: [
      "Prompt user for a temperature value.",
      "Ask user for the unit to convert to (F or C).",
      "Print the converted result using the formula: (C * 9/5) + 32.",
      "Handle invalid inputs (non-numbers) gracefully.",
    ],
  },
  quest_03_02_fibonacci_nth: {
    title: "The Fibonacci Sequence",
    objective: "Generate the nth Fibonacci number based on user input.",
    criteria: [
      "Accept 'n' as user input.",
      "Calculate the nth number (e.g., input 5 -> output 5, input 10 -> output 55).",
      "Try to handle large numbers without crashing (u32 vs u64).",
    ],
  },
  quest_03_03_twelve_days_of_christmas: {
    title: "The 12 Days of Christmas",
    objective:
      "Print the lyrics to the Christmas carol using loops and arrays.",
    criteria: [
      "Use an array/vector to store the gifts ('A partridge', 'Two turtle doves'...).",
      "Loop through days 1 to 12.",
      "Print the cumulative lyrics for each day correctly.",
    ],
  },
  quest_04_01_string_slicer_tool: {
    title: "The Slicer",
    objective:
      "Demonstrate ownership by creating a function that manually finds the first word in a string.",
    criteria: [
      "Function accepts a &String.",
      "Return a string slice (&str) of the first word.",
      "If no spaces exist, return the whole string.",
      "Do NOT use the built-in split_whitespace() for the logic—iterate over bytes manually!",
    ],
  },
  quest_05_01_rectangle_area_calculator: {
    title: "Struct Architect",
    objective: "Model a physical object using Structs and Methods.",
    criteria: [
      "Define a 'Rectangle' struct with width and height.",
      "Implement a method .area() that returns the size.",
      "Implement a method .can_hold(&other) that returns true if one rect fits inside another.",
    ],
  },
  quest_06_01_coin_sorting_machine: {
    title: "The Coin Sorter",
    objective:
      "Use Enums to model currency and pattern matching to count value.",
    criteria: [
      "Define an Enum called 'Coin' (Penny, Nickel, Dime, Quarter).",
      "Create a function that takes a Coin and returns its value in cents.",
      "Add a special variant 'Quarter(UsState)' that holds a state name.",
      "Print the state name only when a Quarter is processed.",
    ],
  },
};

function App() {
  const { width, height } = useWindowSize();
  const [stats, setStats] = useState<UserStats>({
    current_streak: 0,
    total_xp: 0,
    last_push_date: null,
  });
  const [modules, setModules] = useState<ChapterGroup[]>([]);

  // Calculate derived state
  const activityLog = getHeatmapData(modules);
  const skills = calculateSkills(modules); // <--- SKILLS CALCULATION

  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const levelInfo = calculateLevel(stats.total_xp);
  const rank = getRank(levelInfo.level);
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

  const copyCommand = (chapterName: string) => {
    const command = `cargo new ${chapterName}`;
    navigator.clipboard.writeText(command);
    setCopiedId(chapterName);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalModules = modules.length || 1;
  const completedModules = modules.filter((m) => m.isCompleted).length;
  const overallProgress = Math.round((completedModules / totalModules) * 100);

  return (
    <div className="min-h-screen font-sans bg-black text-zinc-100 selection:bg-orange-500/30">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* NAVBAR */}
      <header className="border-b border-white/5 bg-black sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-xl tracking-tight text-white">
              Rust<span className="text-zinc-500">Journey</span>
            </span>
          </div>
          <Badge
            variant="outline"
            className="border-green-900/50 bg-green-900/20 text-green-400 flex items-center gap-2 px-3 py-1"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Online
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* HERO HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white mb-2">
              Hello, <span className="text-orange-500">Rustacean.</span>
            </h1>
            <p className="text-zinc-400 text-lg">
              Track your conquest of the borrow checker. Every commit counts.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchData}
            className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <RefreshCw
              className={`mr-2 w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Sync Data
          </Button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* XP CARD */}
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="p-2 bg-orange-900/20 rounded-lg text-orange-500">
                <Trophy className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                Total XP
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-1">{stats.total_xp}</div>
              <p className="text-xs text-zinc-500">Experience Points Gained</p>
            </CardContent>
          </Card>

          {/* STREAK CARD */}
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="p-2 bg-red-900/20 rounded-lg text-red-500">
                <Flame className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                Streak
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-1">
                {stats.current_streak}{" "}
                <span className="text-xl font-normal text-zinc-500">Days</span>
              </div>
              <p
                className={`text-xs ${
                  dailyGoalComplete ? "text-green-500" : "text-zinc-500"
                }`}
              >
                {dailyGoalComplete ? "Daily Goal Met" : "Keep the fire burning"}
              </p>
            </CardContent>
          </Card>

          {/* RANK CARD */}
          <Card className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="p-2 bg-blue-900/20 rounded-lg text-blue-500">
                <Terminal className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                Rank
              </Badge>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold mb-1 ${rank.color}`}>
                {rank.title}
              </div>
              <p className="text-xs text-zinc-500">Based on commits & tests</p>
            </CardContent>
          </Card>
        </div>

        {/* --- HEATMAP & SKILLS SECTION (VISUAL DATA) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: HEATMAP (Activity) */}
          <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/20 rounded-lg text-green-500">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Activity Log</h3>
                <p className="text-xs text-zinc-500">Momentum (Last 14 Days)</p>
              </div>
            </div>
            <div className="flex gap-2">
              {activityLog.map(([date, count], i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 group relative"
                >
                  <div
                    className={`w-4 h-4 rounded-sm border ${
                      count === 0
                        ? "bg-zinc-950 border-zinc-800"
                        : count === 1
                        ? "bg-green-900 border-green-800"
                        : "bg-green-500 border-green-400"
                    }`}
                  />
                  <div className="absolute bottom-8 opacity-0 group-hover:opacity-100 bg-black border border-zinc-800 text-xs px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none">
                    <span className="text-zinc-400">{date}:</span>{" "}
                    <span className="text-white font-bold">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LEFT COLUMN: RADAR CHART */}
          <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center relative overflow-hidden min-h-[300px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-purple-500" />
            <h3 className="text-sm font-bold text-white mb-4 self-start flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" /> Neural Link Status
            </h3>
            <div className="w-full h-[220px] text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skills}>
                  <PolarGrid stroke="#3f3f46" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#a1a1aa", fontSize: 10 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT COLUMN: CURRENT OBJECTIVE */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-2">
                Current Directive
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                System analysis indicates a deficiency in{" "}
                <span className="text-orange-400">Ownership concepts</span>.
                Recommend engaging <strong>Chapter 4</strong> immediately to
                prevent memory leaks in production. Strengthening{" "}
                <span className="text-purple-400">Systems (STR)</span> will
                unlock advanced borrowing capabilities.
              </p>
            </div>

            <div className="mt-6 p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <div>
                  <div className="text-xs text-zinc-500 font-mono">
                    Next Milestone
                  </div>
                  <div className="text-sm font-bold text-white">
                    Ownership Guardian (Lvl 5)
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500 font-mono">
                  XP Required
                </div>
                <div className="text-sm font-bold text-white">4,000 XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- CURRICULUM SECTION --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Course Progress</h2>
            <span className="text-zinc-400 font-mono text-sm">
              {overallProgress}% Complete
            </span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-zinc-900" />
        </div>

        {/* CURRICULUM LIST */}
        <div className="space-y-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className={`group rounded-2xl border transition-all duration-300 overflow-hidden
                ${
                  module.isCompleted
                    ? "bg-zinc-900/50 border-green-900/30"
                    : module.id === expandedModule
                    ? "bg-zinc-900 border-zinc-700 shadow-xl"
                    : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                }`}
            >
              {/* MODULE HEADER */}
              <div
                className="p-4 md:p-6 flex items-center justify-between cursor-pointer select-none"
                onClick={() =>
                  setExpandedModule(
                    expandedModule === module.id ? null : module.id
                  )
                }
              >
                <div className="flex items-center gap-6 w-full">
                  {/* The Green Pill Number */}
                  <div
                    className={`
                      shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold
                      ${
                        module.isCompleted
                          ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                          : "bg-green-600 text-black shadow-md"
                      }
                    `}
                  >
                    {parseInt(module.id)}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3
                          className={`font-bold text-lg ${
                            module.isCompleted
                              ? "text-green-500"
                              : "text-green-400"
                          }`}
                        >
                          {module.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                          <span>{module.sections.length} Topics</span>
                          {module.quests.length > 0 && (
                            <span className="flex items-center gap-1 text-yellow-600">
                              <Zap className="w-3 h-3" /> {module.quests.length}{" "}
                              Quests
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Module Progress Bar */}
                      <div className="hidden md:flex items-center gap-4 w-1/3">
                        <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-zinc-500 group-hover:text-white transition-colors">
                    {expandedModule === module.id ? (
                      <ChevronUp />
                    ) : (
                      <ChevronDown />
                    )}
                  </div>
                </div>
              </div>

              {/* MODULE BODY */}
              {expandedModule === module.id && (
                <div className="border-t border-zinc-800 bg-black/40 p-4 md:p-6 space-y-3">
                  {module.sections.map((sec, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        sec.is_completed
                          ? "bg-green-950/10 border-green-900/20"
                          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {sec.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                          </div>
                        )}
                        <span
                          className={`text-sm font-medium ${
                            sec.is_completed ? "text-zinc-200" : "text-zinc-400"
                          }`}
                        >
                          {sec.chapter_name.split("_").slice(3).join(" ")}
                        </span>
                      </div>

                      {!sec.is_completed && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800"
                          onClick={() => copyCommand(sec.chapter_name)}
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

                  {/* QUESTS SECTION */}
                  {module.quests.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-3">
                        Side Quests
                      </h4>
                      <div className="space-y-3">
                        {module.quests.map((quest, i) => {
                          const details = QUEST_DATA[quest.chapter_name];
                          const isExpanded =
                            expandedQuest === quest.chapter_name;
                          return (
                            <div
                              key={i}
                              className={`rounded-lg border transition-all overflow-hidden ${
                                quest.is_completed
                                  ? "bg-yellow-950/10 border-yellow-900/20"
                                  : "bg-zinc-900 border-zinc-800"
                              }`}
                            >
                              <div className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-4">
                                  <Zap
                                    className={`w-4 h-4 ${
                                      quest.is_completed
                                        ? "text-yellow-500"
                                        : "text-yellow-700"
                                    }`}
                                  />
                                  <div>
                                    <div
                                      className={`text-sm font-medium ${
                                        quest.is_completed
                                          ? "text-yellow-100"
                                          : "text-yellow-600/80"
                                      }`}
                                    >
                                      {details?.title || quest.chapter_name}
                                    </div>
                                  </div>
                                </div>

                                {!quest.is_completed && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-zinc-500 hover:text-white"
                                      onClick={() =>
                                        setExpandedQuest(
                                          isExpanded ? null : quest.chapter_name
                                        )
                                      }
                                    >
                                      <Info className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 text-zinc-500 hover:text-white"
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

                              {/* QUEST INFO */}
                              {isExpanded && !quest.is_completed && details && (
                                <div className="bg-black/50 p-4 border-t border-yellow-900/20 text-sm">
                                  <p className="text-zinc-300 mb-2">
                                    {details.objective}
                                  </p>
                                  <ul className="space-y-1 text-zinc-500">
                                    {details.criteria.map((c, idx) => (
                                      <li key={idx} className="flex gap-2">
                                        <ArrowRight className="w-4 h-4 text-yellow-800 shrink-0" />{" "}
                                        {c}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
