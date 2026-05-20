import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseDiceFormula, COMMON_DICE } from "@/lib/diceUtils";

interface DiceRollerProps {
  onRoll?: (result: string) => void;
  compact?: boolean;
}

export function DiceRoller({ onRoll, compact = false }: DiceRollerProps) {
  const [formula, setFormula] = useState("");
  const [lastResult, setLastResult] = useState<string | null>(null);

  const roll = (f: string) => {
    const result = parseDiceFormula(f);
    if (!result) {
      setLastResult("Invalid formula");
      return;
    }
    const display = result.display;
    setLastResult(display);
    onRoll?.(display);
  };

  const handleFormula = () => {
    if (!formula.trim()) return;
    roll(formula);
  };

  return (
    <div className={`space-y-2 ${compact ? "" : "p-3 bg-card border border-border rounded"}`}>
      {!compact && (
        <h3 className="text-sm font-serif text-primary uppercase tracking-widest">Dice Roller</h3>
      )}
      <div className="flex flex-wrap gap-1">
        {COMMON_DICE.map((d) => (
          <Button
            key={d}
            size="sm"
            variant="outline"
            className="font-mono text-xs px-2 py-1 h-7"
            onClick={() => roll(`d${d}`)}
            data-testid={`button-roll-d${d}`}
          >
            d{d}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          className="font-mono text-sm h-8"
          placeholder="2d6+3"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleFormula()}
          data-testid="input-dice-formula"
        />
        <Button size="sm" onClick={handleFormula} data-testid="button-roll-custom" className="h-8">
          Roll
        </Button>
      </div>
      {lastResult && (
        <div
          className="font-mono text-sm text-primary bg-muted rounded px-2 py-1"
          data-testid="text-dice-result"
        >
          {lastResult}
        </div>
      )}
    </div>
  );
}
