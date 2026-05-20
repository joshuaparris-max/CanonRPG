import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSession } from "@/hooks/useSession";
import type { Character, Combatant, CombatState } from "@/types";
import type { Monster } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONDITIONS } from "@/data/characterDefaults";
import { rollD20, rollAttack, rollSavingThrow, parseDiceFormula } from "@/lib/diceUtils";
import { downloadFile } from "@/lib/sessionExport";
import {
  Swords,
  Heart,
  Shield,
  SkipForward,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  AlertCircle,
} from "lucide-react";

const DEFAULT_COMBAT: CombatState = {
  isActive: false,
  combatants: [],
  round: 1,
  activeTurnIndex: 0,
  log: [],
};

function newId() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Combat() {
  const [combat, setCombat] = useLocalStorage<CombatState>("cte_combat", DEFAULT_COMBAT);
  const [characters] = useLocalStorage<Character[]>("cte_characters", []);
  const [sourcebook] = useLocalStorage<{ monsters: Monster[] }>("cte_sourcebook", { monsters: [] });
  const { appendLog } = useSession();

  const [selectedCharIds, setSelectedCharIds] = useState<string[]>([]);
  const [monsterForms, setMonsterForms] = useState<
    { id: string; name: string; ac: string; maxHp: string; initMod: string; atkBonus: string; dmgFormula: string; qty: string }[]
  >([{ id: newId(), name: "", ac: "", maxHp: "", initMod: "0", atkBonus: "0", dmgFormula: "1d6", qty: "1" }]);

  const [dmgInput, setDmgInput] = useState<Record<string, string>>({});
  const [targetId, setTargetId] = useState<string>("");
  const [selectedSave, setSelectedSave] = useState("CON");
  const [selectedDc, setSelectedDc] = useState("13");
  const [selectedMod, setSelectedMod] = useState("0");

  const logEntry = (entry: string) => {
    const ts = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const line = `[Round ${combat.round}] ${entry}`;
    setCombat((prev) => ({ ...prev, log: [...prev.log, line] }));
    appendLog(line);
  };

  const rollInitiative = () => {
    const partyCombatants: Combatant[] = selectedCharIds.map((id) => {
      const char = characters.find((c) => c.id === id)!;
      const dexMod = Math.floor((char.abilityScores.dex - 10) / 2);
      return {
        id: char.id,
        name: char.name,
        isPlayer: true,
        initiative: rollD20(dexMod).total,
        maxHp: char.maxHp,
        currentHp: char.currentHp,
        tempHp: char.tempHp,
        ac: char.ac,
        conditions: char.conditions,
        isConcentrating: false,
        initiativeMod: dexMod,
        deathSaves: { successes: 0, failures: 0 },
      };
    });

    const monsterCombatants: Combatant[] = monsterForms.flatMap((form) => {
      if (!form.name.trim() || !form.maxHp) return [];
      const qty = parseInt(form.qty) || 1;
      return Array.from({ length: qty }, (_, i) => ({
        id: `${form.id}_${i}`,
        name: qty > 1 ? `${form.name} ${i + 1}` : form.name,
        isPlayer: false,
        initiative: rollD20(parseInt(form.initMod) || 0).total,
        maxHp: parseInt(form.maxHp) || 1,
        currentHp: parseInt(form.maxHp) || 1,
        tempHp: 0,
        ac: parseInt(form.ac) || 10,
        conditions: [],
        isConcentrating: false,
        initiativeMod: parseInt(form.initMod) || 0,
        attackBonus: parseInt(form.atkBonus) || 0,
        damageFormula: form.dmgFormula || "1d6",
      }));
    });

    const sorted = [...partyCombatants, ...monsterCombatants].sort(
      (a, b) => b.initiative - a.initiative
    );

    setCombat({
      isActive: true,
      combatants: sorted,
      round: 1,
      activeTurnIndex: 0,
      log: [`Combat started! Initiative order: ${sorted.map((c) => `${c.name} (${c.initiative})`).join(", ")}`],
    });
  };

  const nextTurn = () => {
    setCombat((prev) => {
      const next = prev.activeTurnIndex + 1;
      if (next >= prev.combatants.length) {
        logEntry(`--- Round ${prev.round + 1} begins ---`);
        return { ...prev, activeTurnIndex: 0, round: prev.round + 1 };
      }
      return { ...prev, activeTurnIndex: next };
    });
  };

  const endCombat = () => {
    logEntry("Combat ended.");
    setCombat((prev) => ({ ...prev, isActive: false }));
  };

  const resetCombat = () => setCombat(DEFAULT_COMBAT);

  const applyDamage = (combatantId: string, amount: number) => {
    setCombat((prev) => ({
      ...prev,
      combatants: prev.combatants.map((c) => {
        if (c.id !== combatantId) return c;
        let remaining = amount;
        let newTemp = c.tempHp;
        if (newTemp > 0) {
          const absorbed = Math.min(newTemp, remaining);
          newTemp -= absorbed;
          remaining -= absorbed;
        }
        const newHp = Math.max(0, c.currentHp - remaining);
        logEntry(`${c.name} takes ${amount} damage. HP: ${c.currentHp} → ${newHp}`);
        return { ...c, currentHp: newHp, tempHp: newTemp };
      }),
    }));
  };

  const applyHealing = (combatantId: string, amount: number) => {
    setCombat((prev) => ({
      ...prev,
      combatants: prev.combatants.map((c) => {
        if (c.id !== combatantId) return c;
        const newHp = Math.min(c.maxHp, c.currentHp + amount);
        logEntry(`${c.name} healed ${amount} HP. HP: ${c.currentHp} → ${newHp}`);
        return { ...c, currentHp: newHp };
      }),
    }));
  };

  const rollAttackFor = (attacker: Combatant, target: Combatant) => {
    if (attacker.attackBonus === undefined) return;
    const result = rollAttack(attacker.attackBonus, target.ac);
    logEntry(`${attacker.name} attacks ${target.name}: ${result.display}`);
    if (result.hit && attacker.damageFormula) {
      const dmg = parseDiceFormula(attacker.damageFormula);
      if (dmg) {
        logEntry(`${attacker.name} damage: ${attacker.damageFormula} [${dmg.dice.map(d=>d.result).join(",")}] + ${dmg.modifier} = ${dmg.total}`);
        applyDamage(target.id, dmg.total);
      }
    }
  };

  const rollSaveFor = (combatant: Combatant) => {
    const mod = parseInt(selectedMod) || 0;
    const dc = parseInt(selectedDc) || 13;
    const result = rollSavingThrow(mod, dc);
    logEntry(`${combatant.name}: Saving Throw ${selectedSave} DC ${dc}: ${result.display}`);
  };

  const addDeathSave = (combatantId: string, success: boolean) => {
    setCombat((prev) => ({
      ...prev,
      combatants: prev.combatants.map((c) => {
        if (c.id !== combatantId || !c.deathSaves) return c;
        const ds = success
          ? { ...c.deathSaves, successes: Math.min(3, c.deathSaves.successes + 1) }
          : { ...c.deathSaves, failures: Math.min(3, c.deathSaves.failures + 1) };
        if (!success && ds.failures >= 3) {
          logEntry(`${c.name} has failed 3 death saves — dead!`);
        } else if (success && ds.successes >= 3) {
          logEntry(`${c.name} has stabilized.`);
        }
        return { ...c, deathSaves: ds };
      }),
    }));
  };

  const activeCombatant = combat.combatants[combat.activeTurnIndex];
  const targetCombatant = combat.combatants.find((c) => c.id === targetId);

  if (!combat.isActive) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <h1 className="font-serif text-2xl text-primary">Combat Setup</h1>

        <div>
          <h2 className="font-serif text-base mb-2">Select Party Members</h2>
          <div className="flex flex-wrap gap-2">
            {characters.map((char) => (
              <button
                key={char.id}
                className={`text-sm px-3 py-1.5 rounded border transition-all ${
                  selectedCharIds.includes(char.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-muted-foreground"
                }`}
                onClick={() =>
                  setSelectedCharIds((prev) =>
                    prev.includes(char.id) ? prev.filter((id) => id !== char.id) : [...prev, char.id]
                  )
                }
                data-testid={`button-select-char-${char.id}`}
              >
                {char.name} ({char.class} {char.level})
              </button>
            ))}
            {characters.length === 0 && (
              <p className="text-sm text-muted-foreground">No characters found. Create them in the Characters page.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif text-base">Add Monsters (Local Only)</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMonsterForms((prev) => [...prev, { id: newId(), name: "", ac: "", maxHp: "", initMod: "0", atkBonus: "0", dmgFormula: "1d6", qty: "1" }])}
            >
              <Plus size={13} className="mr-1" /> Add Monster
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Enter stats from the book you own. These are your private notes — not preloaded stat blocks.</p>
          <div className="space-y-3">
            {monsterForms.map((form, idx) => (
              <div key={form.id} className="grid grid-cols-8 gap-2 items-end bg-muted/30 p-2 rounded border border-border">
                <div className="col-span-2">
                  <Label className="text-xs">Name</Label>
                  <Input className="h-7 text-xs" value={form.name} onChange={(e) => setMonsterForms((prev) => prev.map((f, i) => i === idx ? { ...f, name: e.target.value } : f))} data-testid={`input-monster-name-${idx}`} />
                </div>
                <div>
                  <Label className="text-xs">AC</Label>
                  <Input className="h-7 text-xs font-mono" value={form.ac} onChange={(e) => setMonsterForms((prev) => prev.map((f, i) => i === idx ? { ...f, ac: e.target.value } : f))} />
                </div>
                <div>
                  <Label className="text-xs">Max HP</Label>
                  <Input className="h-7 text-xs font-mono" value={form.maxHp} onChange={(e) => setMonsterForms((prev) => prev.map((f, i) => i === idx ? { ...f, maxHp: e.target.value } : f))} />
                </div>
                <div>
                  <Label className="text-xs">Init Mod</Label>
                  <Input className="h-7 text-xs font-mono" value={form.initMod} onChange={(e) => setMonsterForms((prev) => prev.map((f, i) => i === idx ? { ...f, initMod: e.target.value } : f))} />
                </div>
                <div>
                  <Label className="text-xs">Atk Bonus</Label>
                  <Input className="h-7 text-xs font-mono" value={form.atkBonus} onChange={(e) => setMonsterForms((prev) => prev.map((f, i) => i === idx ? { ...f, atkBonus: e.target.value } : f))} />
                </div>
                <div>
                  <Label className="text-xs">Dmg Formula</Label>
                  <Input className="h-7 text-xs font-mono" value={form.dmgFormula} onChange={(e) => setMonsterForms((prev) => prev.map((f, i) => i === idx ? { ...f, dmgFormula: e.target.value } : f))} />
                </div>
                <div className="flex items-end gap-1">
                  <div className="flex-1">
                    <Label className="text-xs">Qty</Label>
                    <Input className="h-7 text-xs font-mono" value={form.qty} onChange={(e) => setMonsterForms((prev) => prev.map((f, i) => i === idx ? { ...f, qty: e.target.value } : f))} />
                  </div>
                  {monsterForms.length > 1 && (
                    <Button size="sm" variant="ghost" className="h-7 px-1" onClick={() => setMonsterForms((prev) => prev.filter((_, i) => i !== idx))}>
                      <Trash2 size={12} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={rollInitiative} data-testid="button-start-combat">
          <Swords size={14} className="mr-2" /> Roll Initiative & Start Combat
        </Button>

        {combat.log.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-serif">Previous Combat Log</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => downloadFile(combat.log.join("\n"), "combat-log.txt", "text/plain")}>
                    <Download size={11} className="mr-1" /> Export Log
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={resetCombat}>
                    <RefreshCw size={11} className="mr-1" /> Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded p-2 h-32 overflow-y-auto text-xs font-mono space-y-0.5">
                {combat.log.map((line, i) => <div key={i} className="text-muted-foreground">{line}</div>)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-xl text-primary">Combat</h1>
          <Badge className="bg-red-900/50 text-red-300 border-red-700">Round {combat.round}</Badge>
          {activeCombatant && <span className="text-sm text-amber-300">Active: {activeCombatant.name}</span>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={nextTurn} data-testid="button-next-turn">
            <SkipForward size={13} className="mr-1" /> Next Turn
          </Button>
          <Button size="sm" variant="outline" onClick={endCombat}>End Combat</Button>
          <Button size="sm" variant="ghost" onClick={() => downloadFile(combat.log.join("\n"), "combat-log.txt", "text/plain")}>
            <Download size={13} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {combat.combatants.map((c, idx) => {
            const isActive = idx === combat.activeTurnIndex;
            const isDead = c.currentHp === 0;
            return (
              <div
                key={c.id}
                className={`rounded border p-3 transition-all ${
                  isActive ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
                } ${isDead ? "opacity-50" : ""}`}
                data-testid={`combatant-${c.id}`}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-sm font-medium min-w-24">
                    {c.name}
                    {isActive && <span className="ml-1 text-xs text-primary">(active)</span>}
                    {c.isConcentrating && <span className="ml-1 text-xs text-purple-400">CONC</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Heart size={10} className="text-red-400" />
                    <span className={isDead ? "text-red-400" : ""}>{c.currentHp}/{c.maxHp}</span>
                    {c.tempHp > 0 && <span className="text-blue-400">+{c.tempHp}t</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Shield size={10} className="text-blue-400" />
                    {c.ac}
                  </div>
                  <div className="text-xs text-muted-foreground">Init: {c.initiative}</div>

                  <div className="flex gap-1 ml-auto flex-wrap">
                    <Input
                      className="h-6 text-xs w-14 font-mono px-1"
                      placeholder="amt"
                      value={dmgInput[c.id] ?? ""}
                      onChange={(e) => setDmgInput((p) => ({ ...p, [c.id]: e.target.value }))}
                    />
                    <Button size="sm" variant="outline" className="h-6 text-xs px-1.5"
                      onClick={() => {
                        const v = parseInt(dmgInput[c.id] ?? "0");
                        if (!isNaN(v)) applyDamage(c.id, v);
                        setDmgInput((p) => ({ ...p, [c.id]: "" }));
                      }}>Dmg</Button>
                    <Button size="sm" variant="outline" className="h-6 text-xs px-1.5"
                      onClick={() => {
                        const v = parseInt(dmgInput[c.id] ?? "0");
                        if (!isNaN(v)) applyHealing(c.id, v);
                        setDmgInput((p) => ({ ...p, [c.id]: "" }));
                      }}>Heal</Button>
                    <button
                      className={`text-xs px-1.5 py-0.5 rounded border ${c.isConcentrating ? "border-purple-500 text-purple-400" : "border-border text-muted-foreground"}`}
                      onClick={() => setCombat((prev) => ({ ...prev, combatants: prev.combatants.map((x) => x.id === c.id ? { ...x, isConcentrating: !x.isConcentrating } : x) }))}
                    >
                      {c.isConcentrating ? "CONC" : "Conc"}
                    </button>
                  </div>
                </div>

                {c.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {c.conditions.map((cond) => (
                      <span key={cond} className="text-xs px-1.5 py-0.5 bg-amber-900/40 text-amber-300 rounded">{cond}</span>
                    ))}
                  </div>
                )}

                {c.isPlayer && isDead && c.deathSaves && (
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-muted-foreground">Death Saves:</span>
                    <button onClick={() => addDeathSave(c.id, true)} className="text-green-400 hover:underline">+ Success</button>
                    <span className="text-green-400">✓✓✓"[{Array(3).fill(0).map((_, i) => i < c.deathSaves!.successes ? "✓" : "○").join("")}]</span>
                    <button onClick={() => addDeathSave(c.id, false)} className="text-red-400 hover:underline">+ Failure</button>
                    <span className="text-red-400">[{Array(3).fill(0).map((_, i) => i < c.deathSaves!.failures ? "✗" : "○").join("")}]</span>
                  </div>
                )}

                {isActive && !isDead && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeCombatant.attackBonus !== undefined && (
                      <div className="flex items-center gap-1">
                        <select
                          className="text-xs bg-muted border border-border rounded px-1 py-0.5 h-6"
                          value={targetId}
                          onChange={(e) => setTargetId(e.target.value)}
                        >
                          <option value="">Target…</option>
                          {combat.combatants.filter((x) => x.id !== c.id).map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <Button size="sm" variant="outline" className="h-6 text-xs"
                          onClick={() => targetCombatant && rollAttackFor(activeCombatant, targetCombatant)}
                          disabled={!targetId}
                          data-testid="button-attack-roll"
                        >
                          Attack
                        </Button>
                      </div>
                    )}
                    {activeCombatant.damageFormula && (
                      <Button size="sm" variant="outline" className="h-6 text-xs"
                        onClick={() => {
                          const dmg = parseDiceFormula(activeCombatant.damageFormula!);
                          if (dmg) logEntry(`${c.name} damage roll: ${dmg.display}`);
                        }}
                        data-testid="button-damage-roll"
                      >
                        Damage
                      </Button>
                    )}
                    <div className="flex items-center gap-1">
                      <select className="text-xs bg-muted border border-border rounded px-1 py-0.5 h-6" value={selectedSave} onChange={(e) => setSelectedSave(e.target.value)}>
                        {["STR","DEX","CON","INT","WIS","CHA"].map(s => <option key={s}>{s}</option>)}
                      </select>
                      <span className="text-xs">DC</span>
                      <Input className="h-6 text-xs font-mono w-10 px-1" value={selectedDc} onChange={(e) => setSelectedDc(e.target.value)} />
                      <Input className="h-6 text-xs font-mono w-12 px-1" placeholder="mod" value={selectedMod} onChange={(e) => setSelectedMod(e.target.value)} />
                      <Button size="sm" variant="outline" className="h-6 text-xs"
                        onClick={() => rollSaveFor(activeCombatant)}
                        data-testid="button-saving-throw"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-serif">Combat Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded p-2 h-64 overflow-y-auto text-xs font-mono space-y-0.5">
                {[...combat.log].reverse().map((line, i) => (
                  <div key={i} className="text-muted-foreground">{line}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
