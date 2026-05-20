export function rollDice(expression: string): { total: number; breakdown: string } {
  const values = expression.match(/([+-]?\d+)/g)?.map(Number) ?? [0];
  const total = values.reduce((sum, value) => sum + value, 0);
  return { total, breakdown: values.join(" + ") };
}
