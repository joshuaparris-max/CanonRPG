export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
}

export function calculatePassivePerception(wisdomModifier: number, hasExpertise = false): number {
  const base = 10 + wisdomModifier;
  return hasExpertise ? base + 5 : base;
}
