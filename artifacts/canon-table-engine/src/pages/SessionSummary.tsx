import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSession } from "@/hooks/useSession";
import type { Character, NodeOverride } from "@/types";
import { getAdventure } from "@/data/adventureSkeletons";
import { generateSessionSummary, downloadFile } from "@/lib/sessionExport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Printer, RefreshCw } from "lucide-react";

export default function SessionSummary() {
  const { session } = useSession();
  const [characters] = useLocalStorage<Character[]>("cte_characters", []);
  const [nodeOverrides] = useLocalStorage<Record<string, NodeOverride>>("cte_node_overrides", {});

  const adventure = getAdventure(session.adventureId);
  const [summary, setSummary] = useState(() =>
    generateSessionSummary(session, characters, nodeOverrides, adventure?.title ?? "")
  );

  const regenerate = () => {
    setSummary(generateSessionSummary(session, characters, nodeOverrides, adventure?.title ?? ""));
  };

  const exportMd = () => {
    downloadFile(summary, `session-summary-${Date.now()}.md`, "text/markdown");
  };

  const exportJson = () => {
    const data = {
      schemaVersion: "2.0.0",
      exportedAt: new Date().toISOString(),
      campaignMode: session.campaignMode,
      adventure: adventure?.title,
      adventureId: session.adventureId,
      currentNodeId: session.currentNodeId,
      characters: characters.map((c) => ({
        name: c.name,
        race: c.race,
        class: c.class,
        level: c.level,
        currentHp: c.currentHp,
        maxHp: c.maxHp,
      })),
      completedNodes: Object.values(nodeOverrides)
        .filter((n) => n.completed)
        .map((n) => ({ id: n.id, title: n.sceneTitle, pageRef: n.pageRef })),
      sessionLog: session.sessionLog,
      dmNotes: session.dmNotes,
    };
    downloadFile(JSON.stringify(data, null, 2), `session-summary-${Date.now()}.json`);
  };

  return (
    <div className="print-summary p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-primary">Session Summary</h1>
          <p className="text-sm text-muted-foreground mt-1">Auto-generated from your current session state.</p>
        </div>
        <div className="print-hidden flex gap-2">
          <Button size="sm" variant="outline" onClick={regenerate} data-testid="button-regenerate-summary">
            <RefreshCw size={13} className="mr-1" /> Regenerate
          </Button>
          <Button size="sm" variant="outline" onClick={exportMd} data-testid="button-export-md">
            <Download size={13} className="mr-1" /> Export .md
          </Button>
          <Button size="sm" variant="outline" onClick={exportJson} data-testid="button-export-json">
            <Download size={13} className="mr-1" /> Export JSON
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.print()} data-testid="button-print-summary">
            <Printer size={13} className="mr-1" /> Print
          </Button>
        </div>
      </div>

      <Card className="print-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-serif">Summary Preview</CardTitle>
            <span className="text-xs text-muted-foreground font-mono">Markdown</span>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap font-mono text-xs text-foreground bg-muted rounded p-4 overflow-y-auto max-h-[60vh]" data-testid="text-session-summary">
            {summary}
          </pre>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="bg-card border border-border rounded p-3">
          <div className="text-muted-foreground text-xs">Party Size</div>
          <div className="font-mono text-lg">{characters.length}</div>
        </div>
        <div className="bg-card border border-border rounded p-3">
          <div className="text-muted-foreground text-xs">Nodes Completed</div>
          <div className="font-mono text-lg">{Object.values(nodeOverrides).filter((n) => n.completed).length}</div>
        </div>
        <div className="bg-card border border-border rounded p-3">
          <div className="text-muted-foreground text-xs">Log Entries</div>
          <div className="font-mono text-lg">{session.sessionLog.length}</div>
        </div>
      </div>
    </div>
  );
}
