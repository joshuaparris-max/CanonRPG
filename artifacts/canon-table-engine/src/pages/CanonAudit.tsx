import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSession } from "@/hooks/useSession";
import type { Character, NodeOverride, ImportedPdf } from "@/types";
import type { Monster, NPC, Item, Spell, Trap } from "@/types";
import { ADVENTURES, getAdventure } from "@/data/adventureSkeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertTriangle, CheckCircle, AlertCircle, Info } from "lucide-react";

interface SourcebookStore {
  monsters: Monster[];
  npcs: NPC[];
  items: Item[];
  spells: Spell[];
  traps: Trap[];
}

function FlagBadge({ type }: { type: "ok" | "warn" | "error" | "info" }) {
  const styles = {
    ok: "bg-green-900/40 text-green-300 border-green-700",
    warn: "bg-amber-900/40 text-amber-300 border-amber-700",
    error: "bg-red-900/40 text-red-300 border-red-700",
    info: "bg-blue-900/40 text-blue-300 border-blue-700",
  };
  const icons = {
    ok: <CheckCircle size={10} />,
    warn: <AlertTriangle size={10} />,
    error: <AlertCircle size={10} />,
    info: <Info size={10} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border ${styles[type]}`}>
      {icons[type]}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${score}%` }} />
    </div>
  );
}

export default function CanonAudit() {
  const { session } = useSession();
  const [characters] = useLocalStorage<Character[]>("cte_characters", []);
  const [nodeOverrides] = useLocalStorage<Record<string, NodeOverride>>("cte_node_overrides", {});
  const [sourcebook] = useLocalStorage<SourcebookStore>("cte_sourcebook", { monsters: [], npcs: [], items: [], spells: [], traps: [] });
  const [pdfLibrary] = useLocalStorage<ImportedPdf[]>("cte_pdf_library", []);
  const [ravnicaCrossover] = useLocalStorage("cte_ravnica_crossover", false);

  const pdfIndexCount = pdfLibrary.reduce((total, pdf) => total + (pdf.indexEntries?.length ?? 0), 0);
  const hasImportedPdfLibrary = pdfLibrary.length > 0;

  const currentAdventure = getAdventure(session.adventureId);

  const allNodeIds = currentAdventure?.nodes.map((n) => n.id) ?? [];
  const nodesWithPageRef = allNodeIds.filter((id) => nodeOverrides[id]?.pageRef);
  const nodesWithSourceId = allNodeIds.filter((id) => nodeOverrides[id]?.chapter || nodeOverrides[id]?.keyedArea);
  const readyNodes = allNodeIds.filter((id) => nodeOverrides[id]?.readyToRun);
  const completedNodes = allNodeIds.filter((id) => nodeOverrides[id]?.completed);

  const missingPageRefs = allNodeIds.filter((id) => !nodeOverrides[id]?.pageRef);

  const allEntries = [
    ...sourcebook.monsters,
    ...sourcebook.npcs,
    ...sourcebook.items,
    ...sourcebook.spells,
    ...sourcebook.traps,
  ];
  const validEntries = allEntries.filter((e) => e.name && e.sourceBook && e.sourceId && e.pageRef);
  const entryCompleteness = allEntries.length > 0 ? (validEntries.length / allEntries.length) * 100 : 100;

  const largePrivateFields = [
    ...Object.values(nodeOverrides).flatMap((n) => [n.dmPrivateNote, n.readAloud, n.playerSafeSummary]),
    ...sourcebook.monsters.map((m) => m.traitsActionsNotes),
    ...sourcebook.npcs.map((n) => n.privateNotes),
  ].filter((v) => v && v.length > 1500);

  const nodeScore = allNodeIds.length > 0 ? (nodesWithPageRef.length / allNodeIds.length) * 100 : 100;
  const adventureScore = allNodeIds.length > 0
    ? (readyNodes.length / allNodeIds.length) * 100
    : 0;
  const healthScore = Math.round((nodeScore * 0.4 + entryCompleteness * 0.4 + adventureScore * 0.2));

  const ravnicaWarning = session.campaignMode === "ravnica" && !ravnicaCrossover;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-primary">Canon Audit</h1>
        <p className="text-sm text-muted-foreground mt-1">Check your campaign data for missing references and copyright risk.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-base flex items-center justify-between">
            Canon Health Score
            <span className={`text-2xl font-mono ${healthScore >= 80 ? "text-green-400" : healthScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
              {healthScore}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ScoreBar score={healthScore} />
          <div className="grid grid-cols-3 gap-3 text-xs text-center">
            <div>
              <div className="text-muted-foreground">Node Refs</div>
              <div className="font-mono text-sm">{nodesWithPageRef.length}/{allNodeIds.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Entry Completeness</div>
              <div className="font-mono text-sm">{Math.round(entryCompleteness)}%</div>
            </div>
            <div>
              <div className="text-muted-foreground">Nodes Ready</div>
              <div className="font-mono text-sm">{readyNodes.length}/{allNodeIds.length}</div>
            </div>
          </div>

          {ravnicaWarning && (
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/30 border border-amber-800/40 rounded p-2">
              <AlertTriangle size={12} /> Ravnica (GGR) campaign mode active without explicit crossover toggle enabled.
            </div>
          )}
          {largePrivateFields.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/30 border border-amber-800/40 rounded p-2">
              <AlertTriangle size={12} /> {largePrivateFields.length} private data field{largePrivateFields.length !== 1 ? "s" : ""} over 1,500 characters — large private data, export carefully.
            </div>
          )}
          {missingPageRefs.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/30 border border-amber-800/40 rounded p-2">
              <AlertTriangle size={12} /> {missingPageRefs.length} node{missingPageRefs.length !== 1 ? "s" : ""} missing page references — use DM Prep to fill them in.
            </div>
          )}
        </CardContent>
      </Card>

      {hasImportedPdfLibrary && (
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-base">Imported PDF Library Audit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between gap-2">
              <span>{pdfLibrary.length} imported PDF file{pdfLibrary.length === 1 ? "" : "s"}</span>
              <Badge className="text-[10px] uppercase">Private</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>Index entries</div>
              <div className="font-mono">{pdfIndexCount}</div>
              <div>Latest imported</div>
              <div className="font-mono">{new Date(pdfLibrary[0].lastIndexedAt).toLocaleDateString()}</div>
            </div>
            <div className="text-[11px] text-amber-300">
              Imported PDFs are private and local-only. Do not export or commit PDFs or extracted text unless you intentionally store that export.
            </div>
          </CardContent>
        </Card>
      )}

      <Accordion type="multiple" defaultValue={["nodes", "characters"]}>
        <AccordionItem value="nodes">
          <AccordionTrigger className="font-serif text-sm">
            Adventure Nodes ({allNodeIds.length})
          </AccordionTrigger>
          <AccordionContent>
            {!currentAdventure ? (
              <p className="text-xs text-muted-foreground py-2">No adventure selected.</p>
            ) : (
              <div className="space-y-1">
                {currentAdventure.nodes.map((node) => {
                  const ov = nodeOverrides[node.id];
                  const hasPageRef = !!ov?.pageRef;
                  const ready = !!ov?.readyToRun;
                  const completed = !!ov?.completed;
                  return (
                    <div key={node.id} className="flex items-center gap-2 text-xs py-1 border-b border-border/30">
                      <span className="flex-1">{node.label}</span>
                      {hasPageRef ? <FlagBadge type="ok" /> : <FlagBadge type="warn" />}
                      <span className="text-muted-foreground">{hasPageRef ? `p.${ov?.pageRef}` : "No page ref"}</span>
                      {ready && <Badge className="text-xs bg-green-900/30 text-green-300 border-green-700">Ready</Badge>}
                      {completed && <Badge className="text-xs bg-blue-900/30 text-blue-300 border-blue-700">Done</Badge>}
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="local-monsters">
          <AccordionTrigger className="font-serif text-sm">
            Local Monsters ({sourcebook.monsters.length})
          </AccordionTrigger>
          <AccordionContent>
            {sourcebook.monsters.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No local monsters entered.</p>
            ) : (
              <div className="space-y-1">
                {sourcebook.monsters.map((m) => {
                  const complete = m.name && m.sourceBook && m.sourceId && m.pageRef;
                  return (
                    <div key={m.id} className="flex items-center gap-2 text-xs py-1 border-b border-border/30">
                      {complete ? <FlagBadge type="ok" /> : <FlagBadge type="warn" />}
                      <span className="flex-1">{m.name}</span>
                      <span className="font-mono text-muted-foreground">{m.sourceBook} p.{m.pageRef}</span>
                      {m.traitsActionsNotes && m.traitsActionsNotes.length > 1500 && (
                        <FlagBadge type="warn" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="npcs">
          <AccordionTrigger className="font-serif text-sm">NPCs ({sourcebook.npcs.length})</AccordionTrigger>
          <AccordionContent>
            {sourcebook.npcs.length === 0 ? <p className="text-xs text-muted-foreground py-2">No NPCs entered.</p> : (
              <div className="space-y-1">
                {sourcebook.npcs.map((n) => (
                  <div key={n.id} className="flex items-center gap-2 text-xs py-1 border-b border-border/30">
                    {(n.name && n.sourceBook && n.sourceId && n.pageRef) ? <FlagBadge type="ok" /> : <FlagBadge type="warn" />}
                    <span className="flex-1">{n.name}</span>
                    <span className="font-mono text-muted-foreground">{n.sourceBook} p.{n.pageRef}</span>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="items">
          <AccordionTrigger className="font-serif text-sm">Items / Treasure ({sourcebook.items.length})</AccordionTrigger>
          <AccordionContent>
            {sourcebook.items.length === 0 ? <p className="text-xs text-muted-foreground py-2">No items entered.</p> : (
              <div className="space-y-1">
                {sourcebook.items.map((i) => (
                  <div key={i.id} className="flex items-center gap-2 text-xs py-1 border-b border-border/30">
                    {(i.name && i.sourceBook && i.sourceId && i.pageRef) ? <FlagBadge type="ok" /> : <FlagBadge type="warn" />}
                    <span className="flex-1">{i.name}</span>
                    <span className="text-muted-foreground">{i.rarity}</span>
                    <span className="font-mono text-muted-foreground">{i.sourceBook} p.{i.pageRef}</span>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="characters">
          <AccordionTrigger className="font-serif text-sm">Characters ({characters.length})</AccordionTrigger>
          <AccordionContent>
            {characters.length === 0 ? <p className="text-xs text-muted-foreground py-2">No characters created.</p> : (
              <div className="space-y-1">
                {characters.map((c) => {
                  const hasSpells = c.spellSlots !== undefined;
                  return (
                    <div key={c.id} className="flex items-center gap-2 text-xs py-1 border-b border-border/30">
                      <FlagBadge type={c.name && c.maxHp > 0 ? "ok" : "warn"} />
                      <span className="flex-1">{c.name}</span>
                      <span className="text-muted-foreground">{c.race} {c.class} {c.level}</span>
                      <span className="font-mono">HP {c.currentHp}/{c.maxHp}</span>
                      <span className="font-mono">PP {c.passivePerception}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="campaign">
          <AccordionTrigger className="font-serif text-sm">Campaign Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Campaign Mode:</span>
                <span>{session.campaignMode || "Not set"}</span>
                {!session.campaignMode && <FlagBadge type="warn" />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Adventure:</span>
                <span>{currentAdventure?.title || "Not selected"}</span>
                {!session.adventureId && <FlagBadge type="warn" />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Ravnica Crossover:</span>
                <span>{ravnicaCrossover ? "Enabled" : "Disabled"}</span>
                {ravnicaWarning && <FlagBadge type="warn" />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Completed Nodes:</span>
                <span>{completedNodes.length} / {allNodeIds.length}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
