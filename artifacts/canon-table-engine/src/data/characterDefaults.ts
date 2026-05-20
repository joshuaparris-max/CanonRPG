export const PHB_RACES = [
  "Human",
  "Elf (High)",
  "Elf (Wood)",
  "Elf (Drow)",
  "Dwarf (Hill)",
  "Dwarf (Mountain)",
  "Halfling (Lightfoot)",
  "Halfling (Stout)",
  "Gnome (Forest)",
  "Gnome (Rock)",
  "Half-Elf",
  "Half-Orc",
  "Tiefling",
  "Dragonborn",
];

export const PHB_CLASSES = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
];

export const PHB_BACKGROUNDS = [
  "Acolyte",
  "Charlatan",
  "Criminal",
  "Entertainer",
  "Folk Hero",
  "Guild Artisan",
  "Hermit",
  "Noble",
  "Outlander",
  "Sage",
  "Sailor",
  "Soldier",
  "Urchin",
];

export const CONDITIONS = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Exhaustion (1)",
  "Exhaustion (2)",
  "Exhaustion (3)",
  "Exhaustion (4)",
  "Exhaustion (5)",
  "Exhaustion (6)",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
];

export const SKILLS = [
  "Acrobatics (DEX)",
  "Animal Handling (WIS)",
  "Arcana (INT)",
  "Athletics (STR)",
  "Deception (CHA)",
  "History (INT)",
  "Insight (WIS)",
  "Intimidation (CHA)",
  "Investigation (INT)",
  "Medicine (WIS)",
  "Nature (INT)",
  "Perception (WIS)",
  "Performance (CHA)",
  "Persuasion (CHA)",
  "Religion (INT)",
  "Sleight of Hand (DEX)",
  "Stealth (DEX)",
  "Survival (WIS)",
];

export const SAVING_THROWS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

export const CLASS_HIT_DICE: Record<string, number> = {
  Barbarian: 12,
  Bard: 8,
  Cleric: 8,
  Druid: 8,
  Fighter: 10,
  Monk: 8,
  Paladin: 10,
  Ranger: 10,
  Rogue: 8,
  Sorcerer: 6,
  Warlock: 8,
  Wizard: 6,
};

export const CLASS_SAVING_THROWS: Record<string, string[]> = {
  Barbarian: ["STR", "CON"],
  Bard: ["DEX", "CHA"],
  Cleric: ["WIS", "CHA"],
  Druid: ["INT", "WIS"],
  Fighter: ["STR", "CON"],
  Monk: ["STR", "DEX"],
  Paladin: ["WIS", "CHA"],
  Ranger: ["STR", "DEX"],
  Rogue: ["DEX", "INT"],
  Sorcerer: ["CON", "CHA"],
  Warlock: ["WIS", "CHA"],
  Wizard: ["INT", "WIS"],
};

export const SPELLCASTING_CLASSES = [
  "Bard",
  "Cleric",
  "Druid",
  "Paladin",
  "Ranger",
  "Sorcerer",
  "Warlock",
  "Wizard",
];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const PROFICIENCY_BY_LEVEL: Record<number, number> = {
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6,
};

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  return PROFICIENCY_BY_LEVEL[level] ?? 2;
}

export function calcPassivePerception(
  wis: number,
  proficient: boolean,
  profBonus: number
): number {
  return 10 + getAbilityModifier(wis) + (proficient ? profBonus : 0);
}

export function calcMaxHp(
  className: string,
  level: number,
  conScore: number
): number {
  const hitDie = CLASS_HIT_DICE[className] ?? 8;
  const conMod = getAbilityModifier(conScore);
  const firstLevel = hitDie + conMod;
  if (level === 1) return firstLevel;
  const averagePerLevel = Math.floor(hitDie / 2) + 1 + conMod;
  return firstLevel + averagePerLevel * (level - 1);
}

export const MAGIC_SCHOOLS = [
  "Abjuration",
  "Conjuration",
  "Divination",
  "Enchantment",
  "Evocation",
  "Illusion",
  "Necromancy",
  "Transmutation",
];

export const ITEM_RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Very Rare",
  "Legendary",
  "Artifact",
];

export const NPC_ATTITUDES = ["Friendly", "Neutral", "Hostile", "Unknown"];
