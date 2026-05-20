import { useState } from "react";
import { Link } from "wouter";
import { useSession } from "@/hooks/useSession";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getAdventure, getNode } from "@/data/adventureSkeletons";
import type { Character, NodeOverride } from "@/types";
import { CONDITIONS } from "@/data/characterDefaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiceRoller } from "@/components/DiceRoller";
import { rollD20, rollAttack, rollSavingThrow } from "@/lib/diceUtils";
import {
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Sword,
  Heart,
  Shield,
  Eye,
} from "lucide-react";

export default function RunSession() {
  const { session, updateSession, appendLog } = useSession();
  const [characters, setCharacters] = useLocalStorage<Character[]>("cte_characters", []);
  const [nodeOverrides, setNodeOverrides] = useLocalStorage<Record<string, NodeOverride>>(
    "cte_node_overrides",
    {}
  );
  const [dmNotes, setDmNotes] = useState(session.dmNotes || "");

  const adventure = getAdventure(session.adventureId);
  const currentNode = session.currentNodeId
    ? nodeOverrides[session.currentNodeId] ?? null
    : null;
  const nodeTemplate = session.currentNodeId
    ? getNode(session.adventureId, session.currentNodeId)
    : null;

  const updateCharacterHp = (charId: string, delta: number) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id !== charId) return c;
        const newHp = Math.max(0, Math.min(c.maxHp, c.currentHp + delta));
        appendLog(`${c.name}: HP ${c.currentHp} → ${newHp}`);
        return { ...c, currentHp: newHp };
      })
    );
  };

  const toggleCondition = (charId: string, condition: string) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id !== charId) return c;
        const has = c.conditions.includes(condition);
        return {
          ...c,
          conditions: has
            ? c.conditions.filter((cond) => cond !== condition)
            : [...c.conditions, condition],
        };
      })
    );
  };

  const longRest = (charId: string) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id !== charId) return c;
        appendLog(`${c.name}: Long Rest — HP restored to ${c.maxHp}`);
        const spellSlots = c.spellSlots
          ? Object.fromEntries(
              Object.entries(c.spellSlots).map(([k, v]) => [k, { ...v, used: 0 }])
            )
          : c.spellSlots;
        return { ...c, currentHp: c.maxHp, conditions: [], spellSlots: spellSlots as Character["spellSlots"] };
      })
    );
  };

  const markComplete = () => {
    if (!session.currentNodeId) return;
    setNodeOverrides((prev) => ({
      ...prev,
      [session.currentNodeId]: {
        ...(prev[session.currentNodeId] ?? {}),
        completed: true,
      },
    }));
    appendLog(`Node completed: ${currentNode?.sceneTitle || session.currentNodeId}`);
  };

  const advanceToNext = () => {
    const nextId = currentNode?.nextNodes?.[0];
    if (nextId) {
      updateSession({ currentNodeId: nextId });
      appendLog(`Advanced to node: ${nextId}`);
    }
  };

  const rollCheck = (label: string, bonus = 0, dc?: number) => {
    if (dc !== undefined) {
      const result = rollSavingThrow(bonus, dc);
      appendLog(`${label}: ${result.display}`);
    } else {
      const result = rollD20(bonus);
      appendLog(`${label}: ${result.display}`);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
      {!session.adventureId && (
        <div className="p-4 bg-amber-950/30 border-b border-amber-800/40 text-sm text-amber-300 flex items-center gap-2">
          <AlertTriangle size={14} />
          No adventure selected. <Link href="/" className="underline">Go to Dashboard</Link> to select one.
        </div>
      )}
      <div className="flex-1 overflow-hidden flex gap-0">
        <LeftPanel
          characters={characters}
          onHpChange={updateCharacterHp}
          onConditionToggle={toggleCondition}
          onLongRest={longRest}
        />

        <div className="flex-1 overflow-y-auto border-x border-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-primary">
              {currentNode?.sceneTitle || nodeTemplate?.label || "No node selected"}
            </h2>
            {currentNode?.readyToRun ? (
              <Badge className="bg-green-900/50 text-green-300 border-green-700">Ready</Badge>
            ) : (
              <Badge variant="outline" className="text-amber-400 border-amber-700">Needs Prep</Badge>
            )}
          </div>

          {adventure && (
            <div className="text-xs text-muted-foreground">
              {adventure.title} · Source: {adventure.sourceBook}
            </div>
          )}

          {currentNode?.pageRef && (
            <div className="font-mono text-xs bg-muted px-2 py-1 rounded inline-block">
              Page: {currentNode.pageRef}
              {currentNode.keyedArea && ` · ${currentNode.keyedArea}`}
              {currentNode.chapter && ` · ${currentNode.chapter}`}
            </div>
          )}
          {!currentNode?.pageRef && (
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <AlertTriangle size={12} />
              Missing page reference — add in DM Prep
            </div>
          )}

          {currentNode?.playerSafeSummary && (
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Player Summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">{currentNode.playerSafeSummary}</CardContent>
            </Card>
          )}

          {currentNode?.dmPrivateNote && (
            <Card className="border-amber-800/40 bg-amber-950/20">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs uppercase tracking-widest text-amber-400">DM Note (Private)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">{currentNode.dmPrivateNote}</CardContent>
            </Card>
          )}

          {currentNode?.skillChecks && currentNode.skillChecks.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Skill Checks</h3>
              <div className="space-y-1">
                {currentNode.skillChecks.map((check, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-primary">{check.attribute} DC {check.dc}</span>
                    {check.description && <span className="text-muted-foreground">{check.description}</span>}
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-auto h-6 text-xs"
                      onClick={() => rollCheck(`${check.attribute} DC ${check.dc}`, 0, check.dc)}
                    >
                      Roll
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentNode?.linkedNPCs && currentNode.linkedNPCs.length > 0 && (
            <InfoList label="Linked NPCs" items={currentNode.linkedNPCs} />
          )}
          {currentNode?.linkedMonsters && currentNode.linkedMonsters.length > 0 && (
            <InfoList label="Linked Monsters" items={currentNode.linkedMonsters} />
          )}
          {currentNode?.linkedItems && currentNode.linkedItems.length > 0 && (
            <InfoList label="Treasure / Items" items={currentNode.linkedItems} />
          )}

          {currentNode?.encounterDifficulty && (
            <div className="text-xs">
              <span className="text-muted-foreground uppercase tracking-widest">Encounter: </span>
              <span className="text-amber-300">{currentNode.encounterDifficulty}</span>
            </div>
          )}

          {adventure && (
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Navigate</h3>
              <div className="flex flex-wrap gap-2">
                {adventure.nodes.map((node) => {
                  const isActive = node.id === session.currentNodeId;
                  const isComplete = nodeOverrides[node.id]?.completed;
                  return (
                    <button
                      key={node.id}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        isActive
                          ? "border-primary text-primary"
                          : isComplete
                          ? "border-green-700 text-green-400"
                          : "border-border text-muted-foreground hover:border-muted-foreground"
                      }`}
                      onClick={() => updateSession({ currentNodeId: node.id })}
                    >
                      {node.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
            <Button
              size="sm"
              onClick={markComplete}
              disabled={!session.currentNodeId}
              data-testid="button-mark-complete"
            >
              <CheckCircle size={13} className="mr-1" /> Mark Complete
            </Button>
            {currentNode?.nextNodes?.[0] && (
              <Button size="sm" variant="outline" onClick={advanceToNext} data-testid="button-advance-node">
                Advance to Next <ChevronRight size={13} className="ml-1" />
              </Button>
            )}
            <Button size="sm" variant="outline" asChild data-testid="button-start-encounter">
              <Link href="/combat"><Sword size={13} className="mr-1" /> Start Encounter</Link>
            </Button>
          </div>
        </div>

        <div className="w-60 overflow-y-auto p-3 space-y-4">
          <DiceRoller onRoll={appendLog} />

          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Session Log</h3>
            <div className="bg-muted rounded p-2 h-40 overflow-y-auto text-xs font-mono space-y-0.5">
              {session.sessionLog.length === 0 ? (
                <p className="text-muted-foreground italic">No log entries yet.</p>
              ) : (
                [...session.sessionLog].reverse().map((entry, i) => (
                  <div key={i} className="text-muted-foreground hover:text-foreground">{entry}</div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">DM Notes</h3>
            <Textarea
              className="text-xs font-mono min-h-24"
              placeholder="Freeform DM notes…"
              value={dmNotes}
              onChange={(e) => {
                setDmNotes(e.target.value);
                updateSession({ dmNotes: e.target.value });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LeftPanel({
  characters,
  onHpChange,
  onConditionToggle,
  onLongRest,
}: {
  characters: Character[];
  onHpChange: (id: string, delta: number) => void;
  onConditionToggle: (id: string, condition: string) => void;
  onLongRest: (id: string) => void;
}) {
  const [hpInputs, setHpInputs] = useState<Record<string, string>>({});

  return (
    <div className="w-52 overflow-y-auto border-r border-border p-3 space-y-3">
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground">Party</h3>
      {characters.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No characters. <Link href="/characters" className="underline">Add one</Link>.
        </p>
      ) : (
        characters.map((char) => (
          <div key={char.id} className="bg-card border border-border rounded p-2 space-y-2">
            <div className="text-xs font-medium truncate">{char.name}</div>
            <div className="text-xs text-muted-foreground">{char.race} {char.class} {char.level}</div>
            <div className="flex items-center gap-1 text-xs">
              <Heart size={10} className="text-red-400" />
              <span className={char.currentHp === 0 ? "text-red-400" : ""}>
                {char.currentHp}/{char.maxHp}
              </span>
              <Shield size={10} className="text-blue-400 ml-1" />
              <span>{char.ac}</span>
              <Eye size={10} className="text-purple-400 ml-1" />
              <span>{char.passivePerception}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className="bg-red-400 h-1 rounded-full transition-all"
                style={{ width: `${(char.currentHp / char.maxHp) * 100}%` }}
              />
            </div>
            <div className="flex gap-1">
              <Input
                className="h-6 text-xs font-mono w-12 px-1"
                placeholder="HP"
                type="number"
                value={hpInputs[char.id] ?? ""}
                onChange={(e) => setHpInputs((p) => ({ ...p, [char.id]: e.target.value }))}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-1.5"
                onClick={() => {
                  const val = parseInt(hpInputs[char.id] ?? "0");
                  if (!isNaN(val)) onHpChange(char.id, -val);
                  setHpInputs((p) => ({ ...p, [char.id]: "" }));
                }}
              >
                Dmg
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-1.5"
                onClick={() => {
                  const val = parseInt(hpInputs[char.id] ?? "0");
                  if (!isNaN(val)) onHpChange(char.id, val);
                  setHpInputs((p) => ({ ...p, [char.id]: "" }));
                }}
              >
                Heal
              </Button>
            </div>
            {char.conditions.length > 0 && (
              <div className="flex flex-wrap gap-0.5">
                {char.conditions.map((c) => (
                  <button
                    key={c}
                    className="text-xs px-1 py-0.5 bg-amber-900/40 text-amber-300 rounded"
                    onClick={() => onConditionToggle(char.id, c)}
                  >
                    {c} ×
                  </button>
                ))}
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full h-6 text-xs"
              onClick={() => onLongRest(char.id)}
            >
              Long Rest
            </Button>
          </div>
        ))
      )}
    </div>
  );
}

function InfoList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</h3>
      <ul className="text-sm space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight size={10} className="text-muted-foreground flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
