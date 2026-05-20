export interface DiceRoll {
  formula: string;
  dice: { sides: number; result: number }[];
  modifier: number;
  total: number;
  display: string;
}

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

export function parseDiceFormula(formula: string): DiceRoll | null {
  const clean = formula.trim().toLowerCase().replace(/\s+/g, "");
  if (!clean) return null;

  const match = clean.match(/^(\d+)?d(\d+)([+-]\d+)?$/);
  if (!match) {
    const numOnly = parseInt(clean);
    if (!isNaN(numOnly)) {
      return {
        formula: clean,
        dice: [],
        modifier: numOnly,
        total: numOnly,
        display: `${numOnly}`,
      };
    }
    return null;
  }

  const count = parseInt(match[1] ?? "1");
  const sides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  if (isNaN(count) || isNaN(sides) || count < 1 || sides < 1) return null;

  const dice = Array.from({ length: count }, () => ({
    sides,
    result: rollDie(sides),
  }));
  const diceTotal = dice.reduce((sum, d) => sum + d.result, 0);
  const total = diceTotal + modifier;

  const diceDisplay = dice.map((d) => d.result).join(", ");
  const modDisplay =
    modifier !== 0 ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : "";
  const display =
    count === 1
      ? `d${sides} [${diceDisplay}]${modDisplay} = ${total}`
      : `${count}d${sides} [${diceDisplay}]${modDisplay} = ${total}`;

  return { formula: clean, dice, modifier, total, display };
}

export function rollD20(modifier = 0): DiceRoll {
  const result = rollDie(20);
  const total = result + modifier;
  const modDisplay =
    modifier !== 0 ? (modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`) : "";
  return {
    formula: `d20${modifier >= 0 ? "+" + modifier : modifier}`,
    dice: [{ sides: 20, result }],
    modifier,
    total,
    display: `d20 [${result}]${modDisplay} = ${total}`,
  };
}

export function rollAttack(attackBonus: number, targetAC: number): {
  roll: DiceRoll;
  hit: boolean;
  critical: boolean;
  display: string;
} {
  const roll = rollD20(attackBonus);
  const critical = roll.dice[0].result === 20;
  const hit = roll.dice[0].result !== 1 && (critical || roll.total >= targetAC);
  const outcome = critical ? "Critical Hit!" : hit ? "Hit" : roll.dice[0].result === 1 ? "Critical Miss!" : "Miss";
  const modStr = attackBonus >= 0 ? `+${attackBonus}` : `${attackBonus}`;
  const display = `d20 [${roll.dice[0].result}] ${modStr} = ${roll.total} vs AC ${targetAC} — ${outcome}`;
  return { roll, hit, critical, display };
}

export function rollSavingThrow(bonus: number, dc: number): {
  roll: DiceRoll;
  success: boolean;
  display: string;
} {
  const roll = rollD20(bonus);
  const success = roll.total >= dc;
  const modStr = bonus >= 0 ? `+${bonus}` : `${bonus}`;
  const display = `d20 [${roll.dice[0].result}] ${modStr} = ${roll.total} vs DC ${dc} — ${success ? "Pass" : "Failure"}`;
  return { roll, success, display };
}

export function rollDamage(formula: string): DiceRoll | null {
  return parseDiceFormula(formula);
}

export const COMMON_DICE = [4, 6, 8, 10, 12, 20, 100];
