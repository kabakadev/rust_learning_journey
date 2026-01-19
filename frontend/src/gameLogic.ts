// frontend/src/gameLogic.ts

export const calculateLevel = (xp: number) => {
  // CONSTANT: Difficulty Modifier
  // 100 = Easy Mode (Too fast)
  // 250 = Rust Mode (Realistic)
  const DIFFICULTY = 250;

  // Inverse: Level = Sqrt(XP / DIFFICULTY)
  const level = Math.floor(Math.sqrt(xp / DIFFICULTY)) + 1;

  // Calculate XP boundaries for current level
  const currentLevelBaseXP = DIFFICULTY * Math.pow(level - 1, 2);
  const nextLevelBaseXP = DIFFICULTY * Math.pow(level, 2);

  const xpInCurrentLevel = xp - currentLevelBaseXP;
  const xpRequiredForNextLevel = nextLevelBaseXP - currentLevelBaseXP;

  const progress = Math.min(
    100,
    Math.max(0, (xpInCurrentLevel / xpRequiredForNextLevel) * 100)
  );

  return {
    level,
    progress, // 0 to 100
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    nextLevelBaseXP,
  };
};

export const isDailyGoalMet = (lastPushDateString: string | null): boolean => {
  if (!lastPushDateString) return false;
  const today = new Date().toISOString().split("T")[0]; // "2023-10-27"
  // The DB returns a date string like "Fri, 27 Oct 2023 00:00:00 GMT" or YYYY-MM-DD depending on config
  // Let's normalize by creating a Date object
  const lastPush = new Date(lastPushDateString).toISOString().split("T")[0];
  return today === lastPush;
};
// Add this to your existing gameLogic.ts

// 1. HARDCODED BOOK TITLES (To make it look pro)
export const BOOK_STRUCTURE: Record<string, string> = {
  "01": "Getting Started",
  "02": "Programming a Guessing Game",
  "03": "Common Programming Concepts",
  "04": "Understanding Ownership",
  "05": "Using Structs",
  "06": "Enums and Pattern Matching",
  "07": "Packages, Crates, and Modules",
  "08": "Common Collections",
  "09": "Error Handling",
  "10": "Generic Types, Traits, and Lifetimes",
  "11": "Writing Automated Tests",
  "12": "I/O Project: Command Line Program",
  "13": "Iterators and Closures",
  "14": "More about Cargo",
  "15": "Smart Pointers",
  "16": "Fearless Concurrency",
  "17": "Async Programming",
  "18": "Object Oriented Features",
  "19": "Patterns and Matching",
  "20": "Advanced Features",
  "21": "Final Project: Multithreaded Web Server",
};

export interface ChapterGroup {
  id: string;
  title: string;
  sections: any[];
  quests: any[];
  progress: number;
  isCompleted: boolean;
}

export const groupChapters = (flatChapters: any[]): ChapterGroup[] => {
  const groups: Record<string, ChapterGroup> = {};

  flatChapters.forEach((ch) => {
    // Parse naming convention: chapter_03_01_name OR quest_03_01_name
    const parts = ch.chapter_name.split("_");
    // parts[0] = "chapter" or "quest"
    // parts[1] = "03" (Chapter ID)

    const groupId = parts[1];
    const type = parts[0]; // "chapter" or "quest"

    // Initialize group if not exists
    if (!groups[groupId]) {
      groups[groupId] = {
        id: groupId,
        title: BOOK_STRUCTURE[groupId] || `Chapter ${groupId}`,
        sections: [],
        quests: [],
        progress: 0,
        isCompleted: false,
      };
    }

    if (type === "chapter") {
      groups[groupId].sections.push(ch);
    } else if (type === "quest") {
      groups[groupId].quests.push(ch);
    }
  });

  // Calculate Progress per Group
  return Object.values(groups)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((g) => {
      const totalItems = g.sections.length + g.quests.length;
      const completedItems =
        g.sections.filter((x) => x.is_completed).length +
        g.quests.filter((x) => x.is_completed).length;
      g.progress =
        totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
      g.isCompleted = g.progress === 100;
      return g;
    });
};
// ... (keep existing code) ...

// --- NEW RANKING SYSTEM ---
export interface RankInfo {
  title: string;
  color: string; // Tailwind class for text color
  icon: string; // Emoji or Icon name
}

export const getRank = (level: number): RankInfo => {
  if (level < 2)
    return { title: "Script Kiddie", color: "text-slate-500", icon: "👶" };
  if (level < 5)
    return {
      title: "Borrow Checker Apprentice",
      color: "text-blue-400",
      icon: "🛡️",
    };
  if (level < 10)
    return { title: "Ownership Guardian", color: "text-green-400", icon: "🔐" };
  if (level < 20)
    return { title: "Macro Weaver", color: "text-purple-400", icon: "🔮" };
  if (level < 30)
    return {
      title: "Memory Safe Monarch",
      color: "text-yellow-400",
      icon: "👑",
    };
  return { title: "The Ferriscian", color: "text-red-500", icon: "🦀" };
};

// --- HEATMAP LOGIC ---
export const getHeatmapData = (modules: ChapterGroup[]) => {
  const history: Record<string, number> = {};
  const today = new Date();

  // 1. Initialize last 14 days with 0 (so empty days show as gray)
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    history[dateStr] = 0;
  }

  // 2. Count completions per day (Sections + Quests)
  modules.forEach((m) => {
    // Combine sections and quests into one list to check
    [...m.sections, ...m.quests].forEach((item) => {
      if (item.completed_at) {
        // Parse the DB timestamp into a simple YYYY-MM-DD string
        const date = new Date(item.completed_at).toISOString().split("T")[0];

        // Only count if it falls within our 14-day window
        if (history[date] !== undefined) {
          history[date]++;
        }
      }
    });
  });

  // Convert to array: [['2023-10-01', 2], ['2023-10-02', 0]...]
  return Object.entries(history);
};
// --- SKILL SYSTEM ---
export interface SkillData {
  subject: string;
  A: number; // Current Value
  fullMark: number; // Max Value (100)
}

export const calculateSkills = (modules: ChapterGroup[]): SkillData[] => {
  // 1. Define Categories and which Chapters contribute to them
  const categories = {
    "Systems (STR)": ["04", "05", "15", "19", "20"], // Ownership, Structs, Pointers, Advanced
    "Logic (INT)": ["02", "03", "06", "08", "13"], // Guessing, Concepts, Enums, Collections, Iterators
    "Arch (WIS)": ["07", "09", "10", "11", "12", "14"], // Crates, Errors, Generics, Tests, I/O
    "Async (DEX)": ["16", "17", "21"], // Threads, Async, Web Server
    "Setup (CON)": ["01"], // Installation (Free points)
  };

  const skills: SkillData[] = Object.entries(categories).map(
    ([label, chapterIds]) => {
      // Find all sections that belong to these chapters
      let totalSections = 0;
      let completedSections = 0;

      modules.forEach((mod) => {
        if (chapterIds.includes(mod.id)) {
          totalSections += mod.sections.length;
          completedSections += mod.sections.filter(
            (s) => s.is_completed
          ).length;
        }
      });

      // Avoid division by zero
      const score =
        totalSections === 0
          ? 0
          : Math.round((completedSections / totalSections) * 100);

      return {
        subject: label,
        A: score,
        fullMark: 100,
      };
    }
  );

  return skills;
};
