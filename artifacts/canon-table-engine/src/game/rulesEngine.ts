import type { GameRule } from "@/game/types";

export const DEFAULT_RULES: GameRule[] = [
  { id: "rules-1", name: "Standard Action Economy", description: "Use one action and one bonus action per turn unless otherwise noted." },
];

export function getRuleById(id: string): GameRule | undefined {
  return DEFAULT_RULES.find((rule) => rule.id === id);
}
