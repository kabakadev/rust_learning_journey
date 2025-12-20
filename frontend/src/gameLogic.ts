// frontend/src/gameLogic.ts

export const calculateLevel = (xp: number) => {
  // Formula: XP = 100 * (Level^2)
  // Inverse: Level = Sqrt(XP / 100)
  const level = Math.floor(Math.sqrt(xp / 100)) + 1;

  // Calculate XP boundaries for current level
  const currentLevelBaseXP = 100 * Math.pow(level - 1, 2);
  const nextLevelBaseXP = 100 * Math.pow(level, 2);

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
    title: getTitle(level),
  };
};

const getTitle = (level: number) => {
  if (level >= 20) return "The Rust Evangelist";
  if (level >= 10) return "Systems Architect";
  if (level >= 5) return "Borrow Checker Tamer";
  if (level >= 3) return "Junior Engineer";
  return "Apprentice";
};

export const isDailyGoalMet = (lastPushDateString: string | null): boolean => {
  if (!lastPushDateString) return false;
  const today = new Date().toISOString().split("T")[0]; // "2023-10-27"
  // The DB returns a date string like "Fri, 27 Oct 2023 00:00:00 GMT" or YYYY-MM-DD depending on config
  // Let's normalize by creating a Date object
  const lastPush = new Date(lastPushDateString).toISOString().split("T")[0];
  return today === lastPush;
};
