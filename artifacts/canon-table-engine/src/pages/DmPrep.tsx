import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSession } from "@/hooks/useSession";
import { ADVENTURES, getAdventure, type AdventureNode } from "@/data/adventureSkeletons";
import type { NodeOverride } from "@/types";
import { AutoFillFromPdf } from "@/components/dm-prep/AutoFillFromPdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  CheckCircle, 
  ChevronRight, 
  Save, 
  BookOpen, 
  FileText, 
  Sword, 
  Users, 
  Tag, 
  Clock,
  ArrowRight,
  Info,
  ShieldCheck,
  Zap,
  Map
} from "lucide-react";

const PRIVATE_WARNING =
  "Private prep data may contain material from books you own. It stays local in your browser. Do not commit or share exported DM data if it contains copyrighted text.";

function defaultOverride(node: AdventureNode): NodeOverride {
  return {
    id: node.id,
    pageRef: "",
    chapter: "",
    keyedArea: "",
    sceneTitle: node.label,
    dmPrivateNote: "",
    playerSafeSummary: "",
    readAloud: "",
    linkedNPCs: [],
    linkedMonsters: [],
    linkedItems: [],
    linkedTraps: [],
    skillChecks: [],
    savingThrows: [],
    encounterDifficulty: "",
    nextNodes: [],
    completed: false,
    readyToRun: false,
  };
}

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-1.5 min-h-[1.5rem]">
        {items.length === 0 && <span className="text-xs text-muted-foreground/50 italic">None added</span>}
        {items.map((item, i) => (
          <Badge
            key={i}
            variant="secondary"
            className="pl-2 pr-1 py-0.5 text-xs font-medium bg-muted/50 border-border flex items-center gap-1 group"
          >
            {item}
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-muted-foreground hover:text-destructive p-0.5 rounded-sm hover:bg-destructive/10 transition-colors"
            >
              <CheckCircle className="rotate-45" size={12} />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          className="h-9 text-sm bg-muted/30"
          placeholder={placeholder || `Add ${label.toLowerCase()}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              e.preventDefault();
              onChange([...items, input.trim()]);
              setInput("");
            }
          }}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-9 px-3"
          onClick={() => {
            if (input.trim()) {
              onChange([...items, input.trim()]);
              setInput("");
            }
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

export default function DmPrep() {
  const { session, updateSession } = useSession();
  const [nodeOverrides, setNodeOverrides] = useLocalStorage<Record<string, NodeOverride>>(
    "cte_node_overrides",
    {}
  );
  const [selectedAdventureId, setSelectedAdventureId] = useState(session.adventureId || "");
  const [selectedNodeId, setSelectedNodeId] = useState(session.currentNodeId || "");
  const [saved, setSaved] = useState(false);

  const adventure = getAdventure(selectedAdventureId);
  const selectedNode = adventure?.nodes.find((n) => n.id === selectedNodeId);
  const override = selectedNode
    ? nodeOverrides[selectedNodeId] ?? defaultOverride(selectedNode)
    : null;

  const updateOverride = (updates: Partial<NodeOverride>) => {
    if (!selectedNodeId || !selectedNode) return;
    setNodeOverrides((prev) => ({
      ...prev,
      [selectedNodeId]: { ...(prev[selectedNodeId] ?? defaultOverride(selectedNode)), ...updates },
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getNodeStatus = (node: AdventureNode) => {
    const ov = nodeOverrides[node.id];
    if (!ov) return "empty";
    if (ov.completed) return "completed";
    if (ov.readyToRun) return "ready";
    if (ov.pageRef) return "partial";
    return "empty";
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-background">
      <aside className="w-72 border-r border-border flex flex-col bg-sidebar/20">
        <div className="p-4 border-b border-border space-y-3">
          <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Campaign Setting</Label>
          <select
            className="w-full text-sm bg-muted/50 border border-border rounded-md px-3 py-2 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            value={selectedAdventureId}
            onChange={(e) => {
              setSelectedAdventureId(e.target.value);
              setSelectedNodeId("");
              updateSession({ adventureId: e.target.value });
            }}
          >
            <option value="">Select adventure…</option>
            {ADVENTURES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {adventure?.nodes.map((node) => {
              const status = getNodeStatus(node);
              const active = selectedNodeId === node.id;
              return (
                <button
                  key={node.id}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 transition-all duration-200 group ${
                    active 
                      ? "bg-primary text-primary-foreground shadow-md translate-x-1" 
                      : "hover:bg-muted text-foreground/70 hover:text-foreground"
                  }`}
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    updateSession({ currentNodeId: node.id });
                  }}
                >
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${
                    active 
                      ? "border-primary-foreground/30 bg-primary-foreground/10" 
                      : "border-border bg-muted/30"
                  }`}>
                    {status === "completed" ? (
                      <CheckCircle size={12} className={active ? "text-primary-foreground" : "text-green-500"} />
                    ) : status === "ready" ? (
                      <ShieldCheck size={12} className={active ? "text-primary-foreground" : "text-amber-500"} />
                    ) : status === "partial" ? (
                      <Clock size={12} className={active ? "text-primary-foreground" : "text-blue-500"} />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-primary-foreground/50" : "bg-muted-foreground/30"}`} />
                    )}
                  </div>
                  <span className="truncate font-medium">{node.label}</span>
                  {active && <ChevronRight size={14} className="ml-auto opacity-70" />}
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col">
        {!override ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <BookOpen size={40} className="opacity-20" />
            </div>
            <h2 className="font-serif text-2xl text-primary mb-2">Ready to Prepare?</h2>
            <p className="max-w-xs text-sm leading-relaxed">
              Select an adventure and a specific node from the sidebar to begin entering your private DM notes.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="px-8 py-6 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-serif text-3xl text-primary tracking-tight">
                    {override.sceneTitle || selectedNode?.label}
                  </h1>
                  <Badge variant="outline" className="font-mono text-[10px] h-5 bg-muted/30">
                    ID: {selectedNodeId}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Map size={14} className="text-primary/50" />
                    {adventure?.title}
                  </div>
                  {override.readyToRun && (
                    <div className="flex items-center gap-1.5 text-green-500 font-bold">
                      <ShieldCheck size={14} />
                      Ready to Run
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {saved && (
                  <span className="text-xs text-green-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2">
                    <CheckCircle size={14} />
                    Auto-saved
                  </span>
                )}
                <div className="flex items-center gap-3 bg-muted/30 p-1.5 rounded-lg border border-border">
                  <Label htmlFor="ready-to-run" className="text-[10px] font-bold uppercase tracking-widest px-2 cursor-pointer">Ready</Label>
                  <Switch
                    id="ready-to-run"
                    checked={override.readyToRun}
                    onCheckedChange={(v) => updateOverride({ readyToRun: v })}
                  />
                </div>
              </div>
            </header>

            <ScrollArea className="flex-1">
              <div className="p-8 max-w-5xl mx-auto space-y-10 pb-32">
                <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 flex gap-4 text-xs text-amber-200/80 leading-relaxed shadow-inner">
                  <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                  <p>{PRIVATE_WARNING}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <section className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-xl text-primary flex items-center gap-2">
                          <FileText size={18} />
                          Scene Reference
                        </h3>
                        <AutoFillFromPdf
                          adventure={adventure}
                          node={selectedNode}
                          override={override}
                          onApply={(data) => updateOverride(data)}
                        />
                      </div>
                      <Card className="border-border shadow-sm overflow-hidden">
                        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Source Book</Label>
                            <p className="text-sm font-medium">{adventure?.sourceBook}</p>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Page Reference *</Label>
                            <Input
                              className="h-9 font-mono bg-muted/30 border-primary/10 focus:border-primary/50"
                              placeholder="e.g. p. 12"
                              value={override.pageRef}
                              onChange={(e) => updateOverride({ pageRef: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Chapter / Section</Label>
                            <Input
                              className="h-9 bg-muted/30"
                              placeholder="e.g. Chapter 1"
                              value={override.chapter}
                              onChange={(e) => updateOverride({ chapter: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Scene Title (DM Facing)</Label>
                            <Input
                              className="h-9"
                              value={override.sceneTitle}
                              onChange={(e) => updateOverride({ sceneTitle: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Keyed Area</Label>
                            <Input
                              className="h-9 font-mono"
                              placeholder="e.g. C1"
                              value={override.keyedArea}
                              onChange={(e) => updateOverride({ keyedArea: e.target.value })}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </section>

                    <Tabs defaultValue="notes" className="w-full">
                      <TabsList className="w-full grid grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl">
                        <TabsTrigger value="notes" className="rounded-lg font-serif">DM Notes</TabsTrigger>
                        <TabsTrigger value="player" className="rounded-lg font-serif">Player Summary</TabsTrigger>
                        <TabsTrigger value="read-aloud" className="rounded-lg font-serif">Read Aloud</TabsTrigger>
                      </TabsList>
                      <TabsContent value="notes" className="mt-6 space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Private DM Notes</Label>
                          <Badge variant="secondary" className="text-[10px] bg-amber-900/20 text-amber-500 border-amber-900/30">PRIVATE</Badge>
                        </div>
                        <Textarea
                          className="min-h-[300px] leading-relaxed text-sm bg-card resize-none border-border shadow-inner focus:ring-primary/20"
                          placeholder="Enter your own notes from the book here. Monsters, DCs, hidden items, etc."
                          value={override.dmPrivateNote}
                          onChange={(e) => updateOverride({ dmPrivateNote: e.target.value })}
                        />
                      </TabsContent>
                      <TabsContent value="player" className="mt-6 space-y-4">
                        <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground px-1">Player Safe Summary</Label>
                        <Textarea
                          className="min-h-[300px] leading-relaxed text-sm bg-card resize-none border-border shadow-inner"
                          placeholder="Briefly summarize what players know or discovered here."
                          value={override.playerSafeSummary}
                          onChange={(e) => updateOverride({ playerSafeSummary: e.target.value })}
                        />
                      </TabsContent>
                      <TabsContent value="read-aloud" className="mt-6 space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Boxed Read-Aloud Text</Label>
                          <Badge variant="secondary" className="text-[10px] bg-blue-900/20 text-blue-500 border-blue-900/30">DM ONLY</Badge>
                        </div>
                        <Textarea
                          className="min-h-[300px] font-serif italic text-base leading-relaxed bg-primary/5 border-primary/10 shadow-inner"
                          placeholder="Copy your own read-aloud text here for quick table reference."
                          value={override.readAloud}
                          onChange={(e) => updateOverride({ readAloud: e.target.value })}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="space-y-8">
                    <section className="space-y-4">
                      <h3 className="font-serif text-xl text-primary flex items-center gap-2">
                        <Zap size={18} />
                        Mechanics
                      </h3>
                      <Card className="bg-muted/20 border-border">
                        <CardContent className="p-6 space-y-6">
                          <ListEditor
                            label="Skill Checks / DCs"
                            items={override.skillChecks}
                            onChange={(v) => updateOverride({ skillChecks: v })}
                            placeholder="e.g. DC 15 Athletics"
                          />
                          <Separator className="bg-border/50" />
                          <ListEditor
                            label="Saving Throws"
                            items={override.savingThrows}
                            onChange={(v) => updateOverride({ savingThrows: v })}
                            placeholder="e.g. DC 13 Dex"
                          />
                          <Separator className="bg-border/50" />
                          <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Difficulty</Label>
                            <select
                              className="w-full h-9 text-sm bg-muted/50 border border-border rounded-md px-3 outline-none"
                              value={override.encounterDifficulty}
                              onChange={(e) => updateOverride({ encounterDifficulty: e.target.value })}
                            >
                              <option value="">None / Narrative</option>
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                              <option value="deadly">Deadly</option>
                            </select>
                          </div>
                        </CardContent>
                      </Card>
                    </section>

                    <section className="space-y-4">
                      <h3 className="font-serif text-xl text-primary flex items-center gap-2">
                        <Tag size={18} />
                        Entities
                      </h3>
                      <Card className="bg-muted/20 border-border">
                        <CardContent className="p-6 space-y-6">
                          <ListEditor
                            label="Monsters"
                            items={override.linkedMonsters}
                            onChange={(v) => updateOverride({ linkedMonsters: v })}
                          />
                          <Separator className="bg-border/50" />
                          <ListEditor
                            label="NPCs"
                            items={override.linkedNPCs}
                            onChange={(v) => updateOverride({ linkedNPCs: v })}
                          />
                          <Separator className="bg-border/50" />
                          <ListEditor
                            label="Items / Treasure"
                            items={override.linkedItems}
                            onChange={(v) => updateOverride({ linkedItems: v })}
                          />
                        </CardContent>
                      </Card>
                    </section>

                    <section className="space-y-4">
                      <h3 className="font-serif text-xl text-primary flex items-center gap-2">
                        <ArrowRight size={18} />
                        Flow
                      </h3>
                      <Card className="bg-muted/20 border-border">
                        <CardContent className="p-6 space-y-4">
                          <ListEditor
                            label="Linked Next Nodes"
                            items={override.nextNodes}
                            onChange={(v) => updateOverride({ nextNodes: v })}
                            placeholder="Node ID"
                          />
                          <div className="pt-2">
                            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                              <Info size={10} className="inline mr-1" />
                              Linked nodes will appear as quick-jump buttons during the session.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </main>
    </div>
  );
}
