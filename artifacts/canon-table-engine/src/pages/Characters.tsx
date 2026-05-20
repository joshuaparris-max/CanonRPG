import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Character } from "@/types";
import {
  PHB_RACES, PHB_CLASSES, PHB_BACKGROUNDS, SKILLS, SAVING_THROWS,
  CLASS_HIT_DICE, CLASS_SAVING_THROWS, SPELLCASTING_CLASSES,
  STANDARD_ARRAY, CONDITIONS,
  getAbilityModifier, getProficiencyBonus, calcPassivePerception, calcMaxHp,
} from "@/data/characterDefaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { downloadFile } from "@/lib/sessionExport";
import { Heart, Shield, Eye, Plus, Trash2, Download, Upload, AlertTriangle } from "lucide-react";

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"] as const;
type AbilityKey = typeof ABILITIES[number];
const ABILITY_LABELS: Record<AbilityKey, string> = { str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA" };

function newId() { return Math.random().toString(36).slice(2, 9); }

function defaultCharacter(): Omit<Character, "id"> {
  return {
    name: "",
    race: PHB_RACES[0],
    class: PHB_CLASSES[0],
    level: 1,
    background: PHB_BACKGROUNDS[0],
    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    maxHp: 8,
    currentHp: 8,
    tempHp: 0,
    ac: 10,
    passivePerception: 10,
    skillProficiencies: [],
    savingThrowProficiencies: CLASS_SAVING_THROWS[PHB_CLASSES[0]] ?? [],
    equipment: "",
    conditions: [],
  };
}

export default function Characters() {
  const [characters, setCharacters] = useLocalStorage<Character[]>("cte_characters", []);
  const [activeTab, setActiveTab] = useState<"list" | "create" | "sheet">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Character, "id">>(defaultCharacter());
  const [pointBuyMode, setPointBuyMode] = useState(false);
  const [assignedArray, setAssignedArray] = useState<Record<AbilityKey, number | null>>({
    str: null, dex: null, con: null, int: null, wis: null, cha: null,
  });
  const [availableValues, setAvailableValues] = useState([...STANDARD_ARRAY]);

  const updateForm = (updates: Partial<Omit<Character, "id">>) => {
    setForm((prev) => {
      const next = { ...prev, ...updates };
      const profBonus = getProficiencyBonus(next.level);
      const wisMod = getAbilityModifier(next.abilityScores.wis);
      const hasPercProf = next.skillProficiencies.includes("Perception (WIS)");
      const passivePerception = calcPassivePerception(next.abilityScores.wis, hasPercProf, profBonus);
      const maxHp = calcMaxHp(next.class, next.level, next.abilityScores.con);
      const savingThrowProficiencies = CLASS_SAVING_THROWS[next.class] ?? [];
      return { ...next, maxHp, passivePerception, savingThrowProficiencies, currentHp: maxHp };
    });
  };

  const assignArrayValue = (ability: AbilityKey, value: number | null) => {
    if (value === null) {
      const prev = assignedArray[ability];
      if (prev !== null) setAvailableValues((v) => [...v, prev].sort((a, b) => b - a));
      setAssignedArray((p) => ({ ...p, [ability]: null }));
      updateForm({ abilityScores: { ...form.abilityScores, [ability]: 10 } });
    } else {
      const old = assignedArray[ability];
      if (old !== null) setAvailableValues((v) => [...v, old].sort((a, b) => b - a));
      setAvailableValues((v) => v.filter((x) => x !== value));
      setAssignedArray((p) => ({ ...p, [ability]: value }));
      updateForm({ abilityScores: { ...form.abilityScores, [ability]: value } });
    }
  };

  const pointBuyCost = (score: number) => {
    if (score <= 8) return 0;
    if (score <= 13) return score - 8;
    if (score === 14) return 7;
    if (score === 15) return 9;
    return Infinity;
  };
  const totalPointBuy = Object.values(form.abilityScores).reduce((sum, s) => sum + pointBuyCost(s), 0);

  const saveCharacter = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      setCharacters((prev) => prev.map((c) => (c.id === editingId ? { ...form, id: editingId } : c)));
    } else {
      setCharacters((prev) => [...prev, { ...form, id: newId() }]);
    }
    setActiveTab("list");
    setEditingId(null);
    setForm(defaultCharacter());
    setAssignedArray({ str: null, dex: null, con: null, int: null, wis: null, cha: null });
    setAvailableValues([...STANDARD_ARRAY]);
  };

  const deleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  const exportChars = () => downloadFile(
    JSON.stringify({ schemaVersion: "2.0.0", exportedAt: new Date().toISOString(), characters }, null, 2),
    "characters.json"
  );

  const importChars = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed.characters)) {
          setCharacters(parsed.characters);
        }
      } catch { alert("Invalid character file."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl text-primary">Characters</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportChars}>
            <Download size={13} className="mr-1" /> Export
          </Button>
          <label className="cursor-pointer">
            <Button size="sm" variant="outline" asChild>
              <span><Upload size={13} className="mr-1" /> Import</span>
            </Button>
            <input type="file" accept=".json" className="hidden" onChange={importChars} />
          </label>
          <Button size="sm" onClick={() => { setEditingId(null); setForm(defaultCharacter()); setActiveTab("create"); }}>
            <Plus size={13} className="mr-1" /> New Character
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="list">Characters ({characters.length})</TabsTrigger>
          <TabsTrigger value="create">{editingId ? "Edit" : "Create"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          {characters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No characters yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {characters.map((char) => {
                const profBonus = getProficiencyBonus(char.level);
                return (
                  <Card key={char.id} data-testid={`card-character-${char.id}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="font-serif text-base flex items-center justify-between">
                        {char.name}
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingId(char.id); setForm(char); setActiveTab("create"); }}>Edit</Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => deleteCharacter(char.id)}>
                            <Trash2 size={11} />
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="text-muted-foreground text-xs">{char.race} · {char.class} {char.level} · {char.background}</div>
                      <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1"><Heart size={10} className="text-red-400" />{char.currentHp}/{char.maxHp}</span>
                        <span className="flex items-center gap-1"><Shield size={10} className="text-blue-400" />AC {char.ac}</span>
                        <span className="flex items-center gap-1"><Eye size={10} className="text-purple-400" />PP {char.passivePerception}</span>
                        <span className="text-muted-foreground">Prof +{profBonus}</span>
                      </div>
                      <div className="grid grid-cols-6 gap-1 text-center">
                        {ABILITIES.map((ab) => (
                          <div key={ab} className="bg-muted rounded p-1">
                            <div className="text-xs text-muted-foreground">{ABILITY_LABELS[ab]}</div>
                            <div className="text-sm font-mono">{char.abilityScores[ab]}</div>
                            <div className="text-xs text-primary">{getAbilityModifier(char.abilityScores[ab]) >= 0 ? "+" : ""}{getAbilityModifier(char.abilityScores[ab])}</div>
                          </div>
                        ))}
                      </div>
                      {char.conditions.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {char.conditions.map((c) => <Badge key={c} variant="outline" className="text-xs text-amber-400 border-amber-700">{c}</Badge>)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="mt-4 space-y-5 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => updateForm({ name: e.target.value })} data-testid="input-character-name" />
            </div>
            <div>
              <Label>Level</Label>
              <Input type="number" min={1} max={20} value={form.level} onChange={(e) => updateForm({ level: parseInt(e.target.value) || 1 })} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Race</Label>
              <select className="w-full h-9 text-sm bg-muted border border-border rounded px-2" value={form.race} onChange={(e) => updateForm({ race: e.target.value })} data-testid="select-race">
                {PHB_RACES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <Label>Class</Label>
              <select className="w-full h-9 text-sm bg-muted border border-border rounded px-2" value={form.class} onChange={(e) => updateForm({ class: e.target.value, savingThrowProficiencies: CLASS_SAVING_THROWS[e.target.value] ?? [] })} data-testid="select-class">
                {PHB_CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Background</Label>
              <select className="w-full h-9 text-sm bg-muted border border-border rounded px-2" value={form.background} onChange={(e) => updateForm({ background: e.target.value })}>
                {PHB_BACKGROUNDS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-4 mb-3">
              <h3 className="font-serif text-sm">Ability Scores</h3>
              <div className="flex gap-2">
                <button className={`text-xs px-2 py-0.5 rounded border ${!pointBuyMode ? "border-primary text-primary" : "border-border text-muted-foreground"}`} onClick={() => setPointBuyMode(false)}>Standard Array</button>
                <button className={`text-xs px-2 py-0.5 rounded border ${pointBuyMode ? "border-primary text-primary" : "border-border text-muted-foreground"}`} onClick={() => setPointBuyMode(true)}>Point Buy</button>
              </div>
              {!pointBuyMode && (
                <div className="flex gap-1 ml-auto">
                  {availableValues.map((v, i) => (
                    <span key={i} className="text-xs font-mono px-1.5 py-0.5 bg-primary/20 text-primary rounded">{v}</span>
                  ))}
                </div>
              )}
              {pointBuyMode && (
                <span className={`text-xs ml-auto font-mono ${totalPointBuy > 27 ? "text-red-400" : totalPointBuy === 27 ? "text-green-400" : "text-amber-400"}`}>
                  {totalPointBuy}/27 points
                </span>
              )}
            </div>
            <div className="grid grid-cols-6 gap-2">
              {ABILITIES.map((ab) => (
                <div key={ab} className="text-center">
                  <Label className="text-xs">{ABILITY_LABELS[ab]}</Label>
                  {pointBuyMode ? (
                    <Input type="number" min={8} max={15} className="text-center font-mono h-9 text-sm"
                      value={form.abilityScores[ab]}
                      onChange={(e) => {
                        const v = Math.max(8, Math.min(15, parseInt(e.target.value) || 8));
                        updateForm({ abilityScores: { ...form.abilityScores, [ab]: v } });
                      }}
                    />
                  ) : (
                    <select
                      className="w-full h-9 text-sm bg-muted border border-border rounded text-center font-mono"
                      value={assignedArray[ab] ?? ""}
                      onChange={(e) => {
                        const v = e.target.value ? parseInt(e.target.value) : null;
                        assignArrayValue(ab, v);
                      }}
                    >
                      <option value="">—</option>
                      {assignedArray[ab] !== null && <option value={assignedArray[ab]!}>{assignedArray[ab]}</option>}
                      {availableValues.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  )}
                  <div className="text-xs text-primary mt-0.5">
                    {getAbilityModifier(form.abilityScores[ab]) >= 0 ? "+" : ""}{getAbilityModifier(form.abilityScores[ab])}
                  </div>
                </div>
              ))}
            </div>
            {pointBuyMode && totalPointBuy > 27 && (
              <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                <AlertTriangle size={11} /> Over budget ({totalPointBuy - 27} too many)
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Armor Class</Label>
              <Input type="number" value={form.ac} onChange={(e) => updateForm({ ac: parseInt(e.target.value) || 10 })} />
            </div>
            <div>
              <Label>Max HP (auto)</Label>
              <Input readOnly className="bg-muted" value={form.maxHp} />
            </div>
            <div>
              <Label>Passive Perception (auto)</Label>
              <Input readOnly className="bg-muted" value={form.passivePerception} />
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Skill Proficiencies</Label>
            <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto p-2 bg-muted rounded">
              {SKILLS.map((skill) => (
                <label key={skill} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.skillProficiencies.includes(skill)}
                    onChange={(e) => {
                      const profs = e.target.checked
                        ? [...form.skillProficiencies, skill]
                        : form.skillProficiencies.filter((s) => s !== skill);
                      updateForm({ skillProficiencies: profs });
                    }}
                  />
                  {skill}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Saving Throw Proficiencies (from class: {form.savingThrowProficiencies.join(", ")})</Label>
            <div className="flex gap-2 flex-wrap mt-1">
              {SAVING_THROWS.map((st) => (
                <span
                  key={st}
                  className={`text-xs px-2 py-0.5 rounded border ${
                    form.savingThrowProficiencies.includes(st)
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {st}
                </span>
              ))}
            </div>
          </div>

          <div>
            <Label>Equipment Notes</Label>
            <Input
              placeholder="Starting equipment from your class and background…"
              value={form.equipment}
              onChange={(e) => updateForm({ equipment: e.target.value })}
            />
          </div>

          {SPELLCASTING_CLASSES.includes(form.class) && (
            <div className="p-3 bg-muted/50 rounded border border-border text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Spell Slots (tracking enabled for {form.class})</p>
              <p>Spell slot tracking is available in the Run Session panel once the character is saved. Manage slots there during play.</p>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-border">
            <Button onClick={saveCharacter} disabled={!form.name.trim()} data-testid="button-save-character">
              {editingId ? "Update Character" : "Create Character"}
            </Button>
            <Button variant="outline" onClick={() => { setActiveTab("list"); setEditingId(null); }}>Cancel</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
