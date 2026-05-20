export type SourceBookId =
  | "PHB2014"
  | "MM2014"
  | "DMG2014"
  | "SCAG"
  | "CM"
  | "TFTYP"
  | "VGM"
  | "AL"
  | "AL_GUIDE"
  | "GGR";

export interface SourceBook {
  id: SourceBookId;
  title: string;
  shortTitle: string;
  tier: 1 | 2 | 3 | 4;
  description: string;
}

export const SOURCE_BOOKS: SourceBook[] = [
  {
    id: "PHB2014",
    title: "Player's Handbook (2014)",
    shortTitle: "PHB2014",
    tier: 1,
    description: "Core player rules. Default for characters and class rules.",
  },
  {
    id: "MM2014",
    title: "Monster Manual (2014)",
    shortTitle: "MM2014",
    tier: 1,
    description: "Core monster rules. Default for monster stat references.",
  },
  {
    id: "DMG2014",
    title: "Dungeon Master's Guide (2014)",
    shortTitle: "DMG2014",
    tier: 1,
    description: "Core DM rules. Default for magic items.",
  },
  {
    id: "SCAG",
    title: "Sword Coast Adventurer's Guide",
    shortTitle: "SCAG",
    tier: 2,
    description: "Forgotten Realms / Sword Coast lore support.",
  },
  {
    id: "CM",
    title: "Candlekeep Mysteries",
    shortTitle: "CM",
    tier: 2,
    description: "Candlekeep adventure anthology. Active in Candlekeep campaign mode.",
  },
  {
    id: "TFTYP",
    title: "Tales from the Yawning Portal",
    shortTitle: "TFTYP",
    tier: 2,
    description: "Classic dungeon anthology. Active in Yawning Portal campaign mode.",
  },
  {
    id: "VGM",
    title: "Volo's Guide to Monsters",
    shortTitle: "VGM",
    tier: 3,
    description: "Optional monster expansion.",
  },
  {
    id: "AL",
    title: "Adventurers League",
    shortTitle: "AL",
    tier: 3,
    description: "Adventurers League adaptation guides.",
  },
  {
    id: "AL_GUIDE",
    title: "Adventurers League Guide",
    shortTitle: "AL_GUIDE",
    tier: 3,
    description: "Official Adventurers League sourcebook references.",
  },
  {
    id: "GGR",
    title: "Guildmasters' Guide to Ravnica",
    shortTitle: "GGR",
    tier: 4,
    description: "Ravnica setting. Isolated to Ravnica mode unless crossover enabled.",
  },
];

export const TIER_COLORS: Record<1 | 2 | 3 | 4, string> = {
  1: "bg-amber-900/60 text-amber-200 border-amber-700",
  2: "bg-green-900/60 text-green-200 border-green-700",
  3: "bg-blue-900/60 text-blue-200 border-blue-700",
  4: "bg-purple-900/60 text-purple-200 border-purple-700",
};

export function getSourceBook(id: string): SourceBook | undefined {
  return SOURCE_BOOKS.find((s) => s.id === id);
}

export function getSourceBookTier(id: string): 1 | 2 | 3 | 4 {
  return getSourceBook(id)?.tier ?? 1;
}
