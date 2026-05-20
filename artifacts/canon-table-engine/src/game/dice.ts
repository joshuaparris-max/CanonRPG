export function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollD20(): number {
  return rollDie(20);
}

export function rollWithModifier(roll: number, modifier: number): { roll: number; modifier: number; total: number } {
  const total = roll + modifier;
  return { roll, modifier, total };
}

export function formatRoll(roll: number, modifier: number): string {
  const total = roll + modifier;
  const sign = modifier >= 0 ? "+" : "";
  return `d20 ${roll} ${sign}${modifier} = ${total}`;
}
