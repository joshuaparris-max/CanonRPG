import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useSession } from "@/hooks/useSession";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getAdventure, getNode } from "@/data/adventureSkeletons";
import type { Character, NodeOverride } from "@/types";
import { CONDITIONS } from "@/data/characterDefaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiceRoller } from "@/components/DiceRoller";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rollD20, rollAttack, rollSavingThrow } from "@/lib/diceUtils";
import { 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  Sword, 
  Heart, 
  Shield, 
  Eye, 
  BookOpen, 
  Users, 
  Clock, 
  Zap, 
  ChevronLeft, 
  ArrowRight, 
  Info, 
  Map, 
  ClipboardList, 
  Target, 
  Skull,
  AlertCircle
} from "lucide-react";
import { Label } from "@/components/ui/label";

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
    <div className="h-[calc(100vh-5rem)] flex flex-col bg-background overflow-hidden">
      {!session.adventureId && (
        <div className="p-3 bg-amber-950/20 border-b border-amber-900/30 text-xs text-amber-300 flex items-center justify-center gap-2">
          <AlertTriangle size={14} className="text-amber-500" />
          <span>No adventure selected. <Link href="/" className="underline font-bold hover:text-amber-200">Go to Dashboard</Link> to select one.</span>
        </div>
      )}
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Party Tracker */}
        <aside className="w-64 border-r border-border bg-sidebar/10 flex flex-col shrink-0">
          <div className="p-4 border-b border-border bg-sidebar/20">
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
              <Users size={14} />
              Party Tracker
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {characters.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-border rounded-lg">
                  <p className="text-xs text-muted-foreground italic mb-3">No characters in party.</p>
                  <Button variant="outline" size="sm" className="w-full text-[10px]" asChild>
                    <Link href="/characters">Manage Party</Link>
                  </Button>
                </div>
              ) : (
                characters.map((char) => (
                  <CharacterCard 
                    key={char.id} 
                    char={char} 
                    onHpChange={updateCharacterHp} 
                    onConditionToggle={toggleCondition} 
                    onLongRest={longRest} 
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Center Panel: Node Runner */}
        <main className="flex-1 flex flex-col min-w-0 bg-card/20 shadow-inner">
          <header className="px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3 min-w-0">
                <h2 className="font-serif text-xl text-primary truncate">
                  {currentNode?.sceneTitle || nodeTemplate?.label || "No node selected"}
                </h2>
                {currentNode?.readyToRun ? (
                  <Badge className="bg-green-900/20 text-green-500 border-green-900/30 text-[10px] h-5">READY</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-500 border-amber-900/30 text-[10px] h-5">NEEDS PREP</Badge>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" className="h-8 px-2 text-[10px]" asChild>
                  <Link href="/dm-prep"><BookOpen size={12} className="mr-1" /> Edit</Link>
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-2 text-[10px]" onClick={markComplete}>
                  <CheckCircle size={12} className="mr-1" /> Done
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {adventure && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  <Map size={12} className="text-primary/50" />
                  {adventure.title}
                </div>
              )}
              {currentNode?.pageRef && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary font-bold">
                  <BookOpen size={10} />
                  REF: {currentNode.pageRef}
                  {currentNode.keyedArea && ` · ${currentNode.keyedArea}`}
                  {currentNode.chapter && ` · ${currentNode.chapter}`}
                </div>
              )}
              {!currentNode?.pageRef && (
                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                  <AlertCircle size={12} />
                  Missing Ref
                </div>
              )}
            </div>
          </header>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6 max-w-4xl mx-auto pb-24">
              {currentNode?.playerSafeSummary && (
                <section className="space-y-2">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1">Player Knowledge</h3>
                  <Card className="bg-muted/30 border-border">
                    <CardContent className="p-4 text-sm leading-relaxed">
                      {currentNode.playerSafeSummary}
                    </CardContent>
                  </Card>
                </section>
              )}

              {currentNode?.dmPrivateNote && (
                <section className="space-y-2">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-amber-500/80 px-1">Private DM Notes</h3>
                  <Card className="bg-amber-950/10 border-amber-900/30 shadow-inner">
                    <CardContent className="p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {currentNode.dmPrivateNote}
                    </CardContent>
                  </Card>
                </section>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {currentNode?.skillChecks && currentNode.skillChecks.length > 0 && (
                    <section className="space-y-3">
                      <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1">Active Checks</h3>
                      <div className="space-y-2">
                        {currentNode.skillChecks.map((check, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border group hover:border-primary/50 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-primary">{check}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-[10px] font-bold"
                              onClick={() => rollCheck(check)}
                            >
                              <Zap size={12} className="mr-1.5" /> ROLL
                            </Button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {currentNode?.savingThrows && currentNode.savingThrows.length > 0 && (
                    <section className="space-y-3">
                      <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1">Saving Throws</h3>
                      <div className="space-y-2">
                        {currentNode.savingThrows.map((check, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border group hover:border-primary/50 transition-colors">
                            <span className="text-sm font-bold text-primary">{check}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 text-[10px] font-bold"
                              onClick={() => rollCheck(check)}
                            >
                              <Shield size={12} className="mr-1.5" /> ROLL
                            </Button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-6">
                  {currentNode?.linkedMonsters && currentNode.linkedMonsters.length > 0 && (
                    <InfoCard label="Monsters" icon={Target} items={currentNode.linkedMonsters} color="text-red-500" />
                  )}
                  {currentNode?.linkedNPCs && currentNode.linkedNPCs.length > 0 && (
                    <InfoCard label="NPCs" icon={Users} items={currentNode.linkedNPCs} color="text-blue-500" />
                  )}
                  {currentNode?.linkedItems && currentNode.linkedItems.length > 0 && (
                    <InfoCard label="Treasure" icon={Zap} items={currentNode.linkedItems} color="text-amber-500" />
                  )}
                </div>
              </div>

              {adventure && (
                <section className="space-y-3">
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1">Quick Navigate</h3>
                  <div className="flex flex-wrap gap-2">
                    {adventure.nodes.map((node) => {
                      const isActive = node.id === session.currentNodeId;
                      const isComplete = nodeOverrides[node.id]?.completed;
                      return (
                        <button
                          key={node.id}
                          className={`text-[10px] px-3 py-1.5 rounded-md border font-bold transition-all ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : isComplete
                              ? "bg-green-950/20 text-green-500 border-green-900/30"
                              : "bg-muted/30 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                          onClick={() => updateSession({ currentNodeId: node.id })}
                        >
                          {node.label}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          </ScrollArea>

          <footer className="p-4 border-t border-border bg-card/80 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex gap-3">
              <Button size="sm" variant="outline" className="h-9 px-4" asChild>
                <Link href="/combat"><Sword size={16} className="mr-2" /> Combat Tracker</Link>
              </Button>
              <Button size="sm" variant="outline" className="h-9 px-4" asChild>
                <Link href="/characters"><Users size={16} className="mr-2" /> Party Status</Link>
              </Button>
            </div>
            
            {currentNode?.nextNodes?.[0] && (
              <Button size="sm" className="h-9 px-6 bg-primary" onClick={advanceToNext}>
                Advance to Next Node <ChevronRight size={16} className="ml-2" />
              </Button>
            )}
          </footer>
        </main>

        {/* Right Panel: Tools & Log */}
        <aside className="w-72 border-l border-border bg-sidebar/10 flex flex-col shrink-0">
          <Tabs defaultValue="log" className="flex-1 flex flex-col">
            <TabsList className="w-full grid grid-cols-2 h-12 p-1 bg-sidebar/20 rounded-none border-b border-border">
              <TabsTrigger value="log" className="rounded-none font-serif text-xs">Session Log</TabsTrigger>
              <TabsTrigger value="notes" className="rounded-none font-serif text-xs">Quick Notes</TabsTrigger>
            </TabsList>
            
            <div className="p-3 border-b border-border bg-sidebar/10">
              <DiceRoller onRoll={appendLog} />
            </div>

            <TabsContent value="log" className="flex-1 flex flex-col min-h-0 m-0">
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-1.5 font-mono text-[10px] leading-relaxed">
                  {session.sessionLog.length === 0 ? (
                    <p className="text-muted-foreground italic text-center py-8">No log entries yet.</p>
                  ) : (
                    [...session.sessionLog].reverse().map((entry, i) => (
                      <div key={i} className="pb-1.5 border-b border-border/30 last:border-0 group">
                        <span className="text-muted-foreground/40 mr-2">[{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span>
                        <span className="text-foreground/80 group-hover:text-foreground transition-colors">{entry}</span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="notes" className="flex-1 flex flex-col m-0">
              <div className="flex-1 flex flex-col p-3 gap-3">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Session Scratchpad</Label>
                <Textarea
                  className="flex-1 resize-none text-sm font-sans bg-muted/20 border-border focus:ring-primary/20"
                  placeholder="Capture quick thoughts, names, or events here..."
                  value={dmNotes}
                  onChange={(e) => {
                    setDmNotes(e.target.value);
                    updateSession({ dmNotes: e.target.value });
                  }}
                />
                <p className="text-[10px] text-muted-foreground italic">Saved to current session state.</p>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}

function CharacterCard({ 
  char, 
  onHpChange, 
  onConditionToggle, 
  onLongRest 
}: { 
  char: Character; 
  onHpChange: (id: string, delta: number) => void; 
  onConditionToggle: (id: string, condition: string) => void; 
  onLongRest: (id: string) => void; 
}) {
  const [hpInput, setHpInput] = useState("");
  const hpPercent = Math.max(0, Math.min(100, (char.currentHp / char.maxHp) * 100));
  
  return (
    <div className="bg-card/50 border border-border rounded-xl p-3 space-y-3 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div className="min-w-0">
          <div className="text-xs font-bold truncate text-primary">{char.name}</div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Level {char.level} {char.class}</div>
        </div>
        <Badge variant="outline" className="h-5 text-[10px] font-mono border-primary/20">AC {char.ac}</Badge>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="flex items-center gap-1"><Heart size={10} className="text-red-500" /> HP</span>
          <span className={char.currentHp <= char.maxHp * 0.25 ? "text-red-500 animate-pulse" : ""}>
            {char.currentHp} / {char.maxHp}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden border border-border/50">
          <div
            className={`h-full transition-all duration-500 ${
              hpPercent <= 25 ? "bg-red-500" : hpPercent <= 50 ? "bg-amber-500" : "bg-green-500"
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] bg-muted/30 p-1.5 rounded-md">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Eye size={10} className="text-purple-500" />
          <span>PP: <strong>{char.passivePerception}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Shield size={10} className="text-blue-500" />
          <span>Save: <strong>+{Math.floor((char.level / 4) + 2)}</strong></span>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          className="h-8 text-[10px] font-mono w-16 bg-muted/50"
          placeholder="± Value"
          type="number"
          value={hpInput}
          onChange={(e) => setHpInput(e.target.value)}
        />
        <div className="flex gap-1 flex-1">
          <Button
            size="sm"
            variant="destructive"
            className="h-8 flex-1 text-[10px] font-bold"
            onClick={() => {
              const val = parseInt(hpInput);
              if (!isNaN(val)) onHpChange(char.id, -val);
              setHpInput("");
            }}
          >
            DMG
          </Button>
          <Button
            size="sm"
            className="h-8 flex-1 text-[10px] font-bold bg-green-600 hover:bg-green-700"
            onClick={() => {
              const val = parseInt(hpInput);
              if (!isNaN(val)) onHpChange(char.id, val);
              setHpInput("");
            }}
          >
            HEAL
          </Button>
        </div>
      </div>

      {char.conditions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {char.conditions.map((c) => (
            <Badge
              key={c}
              variant="secondary"
              className="text-[9px] px-1.5 py-0 bg-amber-900/20 text-amber-500 border-amber-900/30 cursor-pointer hover:bg-amber-900/40"
              onClick={() => onConditionToggle(char.id, c)}
            >
              {c} ×
            </Badge>
          ))}
        </div>
      )}

      <Button
        size="sm"
        variant="ghost"
        className="w-full h-7 text-[9px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary"
        onClick={() => onLongRest(char.id)}
      >
        <Clock size={10} className="mr-2" /> Long Rest
      </Button>
    </div>
  );
}

function InfoCard({ label, icon: Icon, items, color }: { label: string; icon: any; items: string[]; color: string }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1 flex items-center gap-2">
        <Icon size={12} className={color} />
        {label}
      </h3>
      <Card className="bg-card border-border shadow-sm">
        <CardContent className="p-3 space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs leading-tight">
              <ChevronRight size={12} className="text-muted-foreground shrink-0 mt-0.5" />
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
