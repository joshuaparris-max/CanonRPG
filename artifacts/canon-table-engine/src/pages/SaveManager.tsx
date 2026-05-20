import { useState, useRef } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSession } from "@/hooks/useSession";
import type { Character, NodeOverride, CombatState, ImportedPdf } from "@/types";
import {
  exportFullSession,
  exportDmPrep,
  exportSourcebookReferences,
  exportPdfLibrary,
  exportCharacters,
  exportCombatLog,
  validateImport,
  validateDmPrepImport,
  validateCharactersImport,
  downloadFile,
} from "@/lib/sessionExport";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Upload, AlertTriangle, CheckCircle, Shield, Lock, Trash2, Clock } from "lucide-react";

interface SourcebookStore {
  monsters: any[];
  npcs: any[];
  items: any[];
  spells: any[];
  traps: any[];
}

const DEFAULT_SOURCEBOOK: SourcebookStore = { monsters: [], npcs: [], items: [], spells: [], traps: [] };
const DEFAULT_COMBAT: CombatState = { isActive: false, combatants: [], round: 1, activeTurnIndex: 0, log: [] };

function SafeBadge() {
  return (
    <Badge className="text-xs bg-green-900/40 text-green-300 border-green-700 flex items-center gap-1">
      <Shield size={9} /> Safe to share
    </Badge>
  );
}

function PrivateBadge() {
  return (
    <Badge className="text-xs bg-amber-900/40 text-amber-300 border-amber-700 flex items-center gap-1">
      <Lock size={9} /> Private — do not share if it contains copied book material
    </Badge>
  );
}

function ImportFeedback({ error, success }: { error?: string; success?: string }) {
  if (error) return (
    <div className="flex items-center gap-2 text-xs text-red-300 bg-red-950/30 border border-red-800/40 rounded p-2">
      <AlertTriangle size={12} /> {error}
    </div>
  );
  if (success) return (
    <div className="flex items-center gap-2 text-xs text-green-300 bg-green-950/30 border border-green-800/40 rounded p-2">
      <CheckCircle size={12} /> {success}
    </div>
  );
  return null;
}

export default function SaveManager() {
  const { session, resetSession } = useSession();
  const [characters, setCharacters] = useLocalStorage<Character[]>("cte_characters", []);
  const [nodeOverrides, setNodeOverrides] = useLocalStorage<Record<string, NodeOverride>>("cte_node_overrides", {});
  const [sourcebook, setSourcebook] = useLocalStorage<SourcebookStore>("cte_sourcebook", DEFAULT_SOURCEBOOK);
  const [pdfLibrary] = useLocalStorage<ImportedPdf[]>("cte_pdf_library", []);
  const [combat] = useLocalStorage<CombatState>("cte_combat", DEFAULT_COMBAT);

  const [feedback, setFeedback] = useState<{ id: string; error?: string; success?: string }>({ id: "" });
  const setFb = (id: string, result: { error?: string; success?: string }) => setFeedback({ id, ...result });

  const fullSessionRef = useRef<HTMLInputElement>(null);
  const dmPrepRef = useRef<HTMLInputElement>(null);
  const charsRef = useRef<HTMLInputElement>(null);

  const lastSaved = session.lastSaved > 0
    ? new Date(session.lastSaved).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })
    : "Never";

  const handleImportFull = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = validateImport(ev.target?.result as string);
      if (!result.valid || !result.data) {
        setFb("full", { error: result.error });
      } else {
        const data = result.data;
        resetSession();
        setCharacters(data.characters);
        setNodeOverrides(data.nodeOverrides ?? {});
        setSourcebook(data.sourcebook ?? DEFAULT_SOURCEBOOK);
        setFb("full", { success: `Imported session data (schema v${data.schemaVersion}, exported ${new Date(data.exportedAt).toLocaleDateString()}).` });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportDmPrep = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = validateDmPrepImport(ev.target?.result as string);
      if (!result.valid || !result.data) {
        setFb("dmprep", { error: result.error });
      } else {
        setNodeOverrides(result.data.nodeOverrides ?? {});
        setSourcebook(result.data.sourcebook ?? DEFAULT_SOURCEBOOK);
        setFb("dmprep", { success: "DM Prep data imported." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportChars = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = validateCharactersImport(ev.target?.result as string);
      if (!result.valid || !result.data) {
        setFb("chars", { error: result.error });
      } else {
        setCharacters(result.data);
        setFb("chars", { success: `Imported ${result.data.length} character${result.data.length !== 1 ? "s" : ""}.` });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const actions = [
    {
      id: "full",
      title: "Full Session",
      description: "Session state, characters, DM prep data, sourcebook entries, combat log.",
      badge: <PrivateBadge />,
      onExport: () => {
        const data = exportFullSession(session, characters, nodeOverrides, sourcebook as any, combat);
        downloadFile(data, `cte-full-session-${Date.now()}.json`);
      },
      onImport: () => fullSessionRef.current?.click(),
      importRef: fullSessionRef,
      onImportChange: handleImportFull,
    },
    {
      id: "dmprep",
      title: "DM Prep Data",
      description: "Node overrides and sourcebook entries only. May contain your private notes.",
      badge: <PrivateBadge />,
      onExport: () => {
        const data = exportDmPrep(nodeOverrides, sourcebook as any);
        downloadFile(data, `cte-dm-prep-${Date.now()}.json`);
      },
      onImport: () => dmPrepRef.current?.click(),
      importRef: dmPrepRef,
      onImportChange: handleImportDmPrep,
    },
    {
      id: "chars",
      title: "Characters",
      description: "Character stats only. Safe to share if you haven't added private notes.",
      badge: <SafeBadge />,
      onExport: () => {
        const data = exportCharacters(characters);
        downloadFile(data, `cte-characters-${Date.now()}.json`);
      },
      onImport: () => charsRef.current?.click(),
      importRef: charsRef,
      onImportChange: handleImportChars,
    },
    {
      id: "sourcebook-references",
      title: "Sourcebook References",
      description: "Safe export of source references without private notes.",
      badge: <SafeBadge />,
      onExport: () => {
        const data = exportSourcebookReferences(sourcebook as any);
        downloadFile(data, `cte-sourcebook-references-${Date.now()}.json`);
      },
      onImport: undefined,
      importRef: undefined,
      onImportChange: undefined,
    },
    {
      id: "pdf-library",
      title: "PDF Library",
      description: "Imported PDF metadata and index entries. Private only.",
      badge: <PrivateBadge />,
      onExport: () => {
        const data = exportPdfLibrary(pdfLibrary);
        downloadFile(data, `cte-pdf-library-${Date.now()}.json`);
      },
      onImport: undefined,
      importRef: undefined,
      onImportChange: undefined,
    },
    {
      id: "combatlog",
      title: "Combat Log",
      description: "Text export of the current combat log.",
      badge: <SafeBadge />,
      onExport: () => {
        const data = exportCombatLog(combat.log);
        downloadFile(data, `cte-combat-log-${Date.now()}.txt`, "text/plain");
      },
      onImport: undefined,
      importRef: undefined,
      onImportChange: undefined,
    },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-primary">Save Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">Export and import your session data. All data lives locally in your browser.</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 text-sm">
            <Clock size={14} className="text-muted-foreground" />
            <span className="text-muted-foreground">Last saved:</span>
            <span className={session.lastSaved > 0 ? "text-green-300" : "text-muted-foreground"}>{lastSaved}</span>
            <Badge variant="outline" className="text-xs font-mono ml-auto">Schema v{session.schemaVersion || "2.0.0"}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3 text-center text-xs">
            <div>
              <div className="text-muted-foreground">Characters</div>
              <div className="font-mono text-base">{characters.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Node Overrides</div>
              <div className="font-mono text-base">{Object.keys(nodeOverrides).length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Sourcebook Entries</div>
              <div className="font-mono text-base">
                {(sourcebook.monsters?.length ?? 0) + (sourcebook.npcs?.length ?? 0) + (sourcebook.items?.length ?? 0) + (sourcebook.spells?.length ?? 0) + (sourcebook.traps?.length ?? 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {actions.map((action) => (
          <Card key={action.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{action.title}</span>
                    {action.badge}
                  </div>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                  {feedback.id === action.id && (
                    <div className="mt-2">
                      <ImportFeedback error={feedback.error} success={feedback.success} />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={action.onExport}
                    data-testid={`button-export-${action.id}`}
                  >
                    <Download size={12} className="mr-1" /> Export
                  </Button>
                  {action.onImport && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={action.onImport}
                        data-testid={`button-import-${action.id}`}
                      >
                        <Upload size={12} className="mr-1" /> Import
                      </Button>
                      <input
                        ref={action.importRef as React.RefObject<HTMLInputElement>}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={action.onImportChange}
                      />
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-red-900/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">Reset Session</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Clears session state, log, and DM notes. Characters and sourcebook data are preserved.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" data-testid="button-reset-session">
                  <Trash2 size={12} className="mr-1" /> Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear session state, campaign selection, current node, and session log.
                    Characters and sourcebook entries will be preserved.
                    Export your session first if you want to keep your progress.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetSession}>Reset Session</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground border border-border rounded p-3 space-y-1">
        <p className="font-medium text-foreground">How to move to a new Replit account:</p>
        <ol className="list-decimal ml-4 space-y-0.5">
          <li>Export Full Session JSON and Characters JSON on this account.</li>
          <li>In the new account, open the Canon Table Engine app.</li>
          <li>Go to Save Manager and Import Full Session JSON.</li>
          <li>Import Characters JSON separately if needed.</li>
        </ol>
        <p className="text-amber-300/80 mt-2">
          DM prep exports may contain your private notes from books you own. Treat them as private files.
        </p>
      </div>
    </div>
  );
}
