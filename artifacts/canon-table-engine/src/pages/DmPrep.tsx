import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSession } from "@/hooks/useSession";
import { ADVENTURES, getAdventure, type AdventureNode } from "@/data/adventureSkeletons";
import type { NodeOverride } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, CheckCircle, ChevronRight, Save } from "lucide-react";

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
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [input, setInput] = useState("");
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap gap-1 mb-1">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs"
          >
            {item}
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-muted-foreground hover:text-destructive"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <Input
          className="h-7 text-xs"
          placeholder={`Add ${label.toLowerCase()}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              onChange([...items, input.trim()]);
              setInput("");
            }
          }}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
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
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
      <aside className="w-56 border-r border-border flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border">
          <select
            className="w-full text-xs bg-muted border border-border rounded px-2 py-1.5"
            value={selectedAdventureId}
            onChange={(e) => {
              setSelectedAdventureId(e.target.value);
              setSelectedNodeId("");
              updateSession({ adventureId: e.target.value });
            }}
            data-testid="select-adventure"
          >
            <option value="">Select adventure…</option>
            {ADVENTURES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {adventure?.nodes.map((node) => {
            const status = getNodeStatus(node);
            const active = selectedNodeId === node.id;
            return (
              <button
                key={node.id}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 border-b border-border/50 transition-colors ${
                  active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  updateSession({ currentNodeId: node.id });
                }}
                data-testid={`button-node-${node.id}`}
              >
                <span className="flex-shrink-0">
                  {status === "completed" ? (
                    <CheckCircle size={10} className="text-green-400" />
                  ) : status === "ready" ? (
                    <CheckCircle size={10} className="text-amber-400" />
                  ) : status === "partial" ? (
                    <ChevronRight size={10} className="text-blue-400" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full border border-muted-foreground/50 inline-block" />
                  )}
                </span>
                <span className="truncate">{node.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto p-4">
        {!override ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <BookOpenIcon size={48} className="mb-3 opacity-30" />
            <p className="text-sm">Select an adventure and node to begin prep.</p>
          </div>
        ) : (
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-primary">{selectedNode?.label}</h2>
              <div className="flex items-center gap-2">
                {saved && (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Save size={12} /> Saved
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    id="ready-to-run"
                    checked={override.readyToRun}
                    onCheckedChange={(v) => updateOverride({ readyToRun: v })}
                    data-testid="switch-ready-to-run"
                  />
                  <Label htmlFor="ready-to-run" className="text-xs">Ready to Run</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="completed"
                    checked={override.completed}
                    onCheckedChange={(v) => updateOverride({ completed: v })}
                    data-testid="switch-node-completed"
                  />
                  <Label htmlFor="completed" className="text-xs">Completed</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Page Reference *</Label>
                <Input
                  className="h-8 text-sm font-mono"
                  placeholder="e.g. 42"
                  value={override.pageRef}
                  onChange={(e) => updateOverride({ pageRef: e.target.value })}
                  data-testid="input-page-ref"
                />
              </div>
              <div>
                <Label className="text-xs">Chapter / Section</Label>
                <Input
                  className="h-8 text-sm"
                  placeholder="e.g. Chapter 2"
                  value={override.chapter}
                  onChange={(e) => updateOverride({ chapter: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Keyed Area</Label>
                <Input
                  className="h-8 text-sm font-mono"
                  placeholder="e.g. Area 3B"
                  value={override.keyedArea}
                  onChange={(e) => updateOverride({ keyedArea: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Scene Title Override</Label>
              <Input
                className="h-8 text-sm"
                value={override.sceneTitle}
                onChange={(e) => updateOverride({ sceneTitle: e.target.value })}
              />
            </div>

            <div className="bg-amber-950/40 border border-amber-800/50 rounded p-3 text-xs text-amber-300 flex gap-2">
              <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{PRIVATE_WARNING}</span>
            </div>

            <div>
              <Label className="text-xs">Player-Safe Summary</Label>
              <Textarea
                className="text-sm mt-1"
                rows={3}
                placeholder="What the players can see/know about this area…"
                value={override.playerSafeSummary}
                onChange={(e) => updateOverride({ playerSafeSummary: e.target.value })}
                data-testid="textarea-player-summary"
              />
            </div>

            <div>
              <Label className="text-xs">DM Private Note</Label>
              <Textarea
                className="text-sm mt-1"
                rows={4}
                placeholder="Your private DM notes for this node…"
                value={override.dmPrivateNote}
                onChange={(e) => updateOverride({ dmPrivateNote: e.target.value })}
                data-testid="textarea-dm-note"
              />
            </div>

            <div>
              <div className="text-xs font-medium text-amber-400 uppercase tracking-widest mb-1">
                PRIVATE — Read-Aloud Text
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                Your personal notes / read-aloud reference from books you own. Stays local only — do not share.
              </p>
              <Textarea
                className="text-sm font-mono"
                rows={3}
                placeholder="Your private read-aloud notes…"
                value={override.readAloud}
                onChange={(e) => updateOverride({ readAloud: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs">Encounter Difficulty</Label>
              <Input
                className="h-8 text-sm"
                placeholder="e.g. Medium — 3 goblins"
                value={override.encounterDifficulty}
                onChange={(e) => updateOverride({ encounterDifficulty: e.target.value })}
              />
            </div>

            <ChecksEditor
              label="Skill Checks / DCs"
              checks={override.skillChecks}
              onChange={(skillChecks) => updateOverride({ skillChecks })}
            />

            <ChecksEditor
              label="Saving Throws / DCs"
              checks={override.savingThrows}
              onChange={(savingThrows) => updateOverride({ savingThrows })}
            />

            <div className="grid grid-cols-2 gap-4">
              <ListEditor
                label="Linked NPCs"
                items={override.linkedNPCs}
                onChange={(linkedNPCs) => updateOverride({ linkedNPCs })}
              />
              <ListEditor
                label="Linked Monsters"
                items={override.linkedMonsters}
                onChange={(linkedMonsters) => updateOverride({ linkedMonsters })}
              />
              <ListEditor
                label="Linked Items / Treasure"
                items={override.linkedItems}
                onChange={(linkedItems) => updateOverride({ linkedItems })}
              />
              <ListEditor
                label="Linked Traps / Hazards"
                items={override.linkedTraps}
                onChange={(linkedTraps) => updateOverride({ linkedTraps })}
              />
            </div>

            <div>
              <Label className="text-xs">Next Node Links (node IDs, comma-separated)</Label>
              <Input
                className="h-8 text-sm font-mono"
                value={override.nextNodes.join(", ")}
                onChange={(e) =>
                  updateOverride({
                    nextNodes: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChecksEditor({
  label,
  checks,
  onChange,
}: {
  label: string;
  checks: { attribute: string; dc: number; description: string }[];
  onChange: (checks: { attribute: string; dc: number; description: string }[]) => void;
}) {
  const [attr, setAttr] = useState("");
  const [dc, setDc] = useState("");
  const [desc, setDesc] = useState("");

  const add = () => {
    if (!attr || !dc) return;
    onChange([...checks, { attribute: attr, dc: parseInt(dc) || 0, description: desc }]);
    setAttr("");
    setDc("");
    setDesc("");
  };

  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {checks.map((c, i) => (
        <div key={i} className="flex items-center gap-2 text-xs bg-muted rounded px-2 py-1">
          <span className="font-mono text-primary">{c.attribute} DC {c.dc}</span>
          {c.description && <span className="text-muted-foreground">{c.description}</span>}
          <button
            onClick={() => onChange(checks.filter((_, idx) => idx !== i))}
            className="ml-auto text-muted-foreground hover:text-destructive"
          >
            ×
          </button>
        </div>
      ))}
      <div className="flex gap-1">
        <Input
          className="h-7 text-xs w-24"
          placeholder="Attr (e.g. PER)"
          value={attr}
          onChange={(e) => setAttr(e.target.value)}
        />
        <Input
          className="h-7 text-xs w-16"
          placeholder="DC"
          value={dc}
          onChange={(e) => setDc(e.target.value)}
          type="number"
        />
        <Input
          className="h-7 text-xs"
          placeholder="Description (optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={add}>
          Add
        </Button>
      </div>
    </div>
  );
}

function BookOpenIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
