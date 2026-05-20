import { rollDice } from "@/game/dice";

export function calculateAttackRoll(modifier: number, advantage = false): { roll: number; total: number } {
  const die = Math.floor(Math.random() * 20) + 1;
  return { roll: die, total: die + modifier };
}

export function resolveDamage(expression: string) {
  return rollDice(expression);
}
