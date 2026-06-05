import { useState, useRef } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSession } from "@/hooks/useSession";
import type { Character, NodeOverride, CombatState } from "@/types";
import {
  exportFullSession,
  exportDmPrep,
  exportCharacters,
  exportCombatLog,
  validateImport,
  validateDmPrepImport,
  validateCharactersImport,
  downloadFile,
} from "@/lib/sessionExport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Lock, 
  Trash2, 
  Clock, 
  FileJson, 
  Database,
  RefreshCcw,
  ShieldAlert,
  Save,
  Info,
  BookOpen,
  Users,
  Sword
} from "lucide-react";

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
    <Badge className="text-[10px] bg-green-900/20 text-green-500 border-green-900/30 flex items-center gap-1 font-bold uppercase tracking-widest">
      <Shield size={10} /> Safe to share
    </Badge>
  );
}

function PrivateBadge() {
  return (
    <Badge className="text-[10px] bg-amber-900/20 text-amber-500 border-amber-900/30 flex items-center gap-1 font-bold uppercase tracking-widest">
      <Lock size={10} /> Private Data
    </Badge>
  );
}

function ImportFeedback({ error, success }: { error?: string; success?: string }) {
  if (error) return (
    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
      <ShieldAlert size={14} className="shrink-0" /> 
      <span><strong>Import Failed:</strong> {error}</span>
    </div>
  );
  if (success) return (
    <div className="flex items-center gap-2 text-xs text-green-500 bg-green-950/20 border border-green-900/30 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
      <CheckCircle size={14} className="shrink-0" /> 
      <span><strong>Success:</strong> {success}</span>
    </div>
  );
  return null;
}

export default function SaveManager() {
  const { session, resetSession, updateSession } = useSession();
  const [characters, setCharacters] = useLocalStorage<Character[]>("cte_characters", []);
  const [nodeOverrides, setNodeOverrides] = useLocalStorage<Record<string, NodeOverride>>("cte_node_overrides", {});
  const [sourcebook, setSourcebook] = useLocalStorage<SourcebookStore>("cte_sourcebook", DEFAULT_SOURCEBOOK);
  const [combat] = useLocalStorage<CombatState>("cte_combat", DEFAULT_COMBAT);

  const [feedback, setFeedback] = useState<{ id: string; error?: string; success?: string }>({ id: "" });
  const setFb = (id: string, result: { error?: string; success?: string }) => {
    setFeedback({ id, ...result });
    if (result.success) {
      setTimeout(() => setFeedback({ id: "" }), 3000);
    }
  };

  const fullSessionRef = useRef<HTMLInputElement>(null);
  const dmPrepRef = useRef<HTMLInputElement>(null);
  const charsRef = useRef<HTMLInputElement>(null);

  const lastSaved = session.lastSaved > 0
    ? new Date(session.lastSaved).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    : "No local data found";

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
        updateSession(data.session);
        setCharacters(data.characters);
        setNodeOverrides(data.nodeOverrides);
        setSourcebook(data.sourcebook);
        setFb("full", { success: "Full session imported successfully." });
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
        setNodeOverrides(result.data.nodeOverrides);
        setSourcebook(result.data.sourcebook);
        setFb("dmprep", { success: "DM Prep data imported successfully." });
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
        setFb("chars", { success: "Characters imported successfully." });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="font-serif text-3xl text-primary tracking-tight">Save Manager</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          All your campaign data is stored locally in your browser. Use this page to create backups, 
          transfer data between devices, or reset your current session.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="font-serif text-xl text-primary flex items-center gap-2">
              <Download size={20} />
              Export Backups
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-serif">Full Session Backup</CardTitle>
                    <PrivateBadge />
                  </div>
                  <CardDescription className="text-xs">
                    Complete campaign state: session, party, prep, and sourcebook data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full h-10 font-bold" 
                    onClick={() => downloadFile(exportFullSession(session, characters, nodeOverrides, sourcebook, combat), "canon_full_session.json")}
                  >
                    <FileJson size={16} className="mr-2" /> Export Full Backup
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-serif">DM Prep & Sourcebook</CardTitle>
                    <PrivateBadge />
                  </div>
                  <CardDescription className="text-xs">
                    Only your prepared nodes and local sourcebook entries.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-10 font-bold" 
                    onClick={() => downloadFile(exportDmPrep(nodeOverrides, sourcebook), "canon_dm_prep.json")}
                  >
                    <BookOpen size={16} className="mr-2" /> Export Prep Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-serif">Characters Only</CardTitle>
                    <SafeBadge />
                  </div>
                  <CardDescription className="text-xs">
                    Just the current party member data. Safe to share with players.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-10 font-bold" 
                    onClick={() => downloadFile(exportCharacters(characters), "canon_characters.json")}
                  >
                    <Users size={16} className="mr-2" /> Export Characters
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-serif">Combat Log</CardTitle>
                    <SafeBadge />
                  </div>
                  <CardDescription className="text-xs">
                    A plain text record of all events from your latest combat session.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full h-10 font-bold" 
                    disabled={combat.log.length === 0}
                    onClick={() => downloadFile(exportCombatLog(combat.log), "combat_log.txt", "text/plain")}
                  >
                    <Sword size={16} className="mr-2" /> Export Combat Log
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl text-primary flex items-center gap-2">
              <Upload size={20} />
              Import Data
            </h2>
            <Card className="bg-muted/30 border-dashed">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Import Full Backup</Label>
                    <Badge variant="outline" className="text-[10px] h-5 border-red-900/30 text-red-500 font-bold">OVERWRITES ALL</Badge>
                  </div>
                  <div className="flex gap-3">
                    <Input type="file" className="hidden" ref={fullSessionRef} onChange={handleImportFull} accept=".json" />
                    <Button variant="outline" className="flex-1 h-11" onClick={() => fullSessionRef.current?.click()}>
                      <Upload size={16} className="mr-2" /> Select Backup File
                    </Button>
                  </div>
                  {feedback.id === "full" && <ImportFeedback {...feedback} />}
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Import DM Prep</Label>
                    <Input type="file" className="hidden" ref={dmPrepRef} onChange={handleImportDmPrep} accept=".json" />
                    <Button variant="outline" size="sm" className="w-full h-10" onClick={() => dmPrepRef.current?.click()}>
                      <BookOpen size={14} className="mr-2" /> Select Prep File
                    </Button>
                    {feedback.id === "dmprep" && <ImportFeedback {...feedback} />}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Import Characters</Label>
                    <Input type="file" className="hidden" ref={charsRef} onChange={handleImportChars} accept=".json" />
                    <Button variant="outline" size="sm" className="w-full h-10" onClick={() => charsRef.current?.click()}>
                      <Users size={14} className="mr-2" /> Select Chars File
                    </Button>
                    {feedback.id === "chars" && <ImportFeedback {...feedback} />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="font-serif text-xl text-primary flex items-center gap-2">
              <Clock size={20} />
              Local Status
            </h2>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Last Local Sync</div>
                  <div className="text-sm font-mono text-green-500 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {lastSaved}
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Characters</span>
                    <span className="font-bold">{characters.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Prepared Nodes</span>
                    <span className="font-bold">{Object.keys(nodeOverrides).length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Sourcebook Entries</span>
                    <span className="font-bold">{sourcebook.monsters.length + sourcebook.npcs.length + sourcebook.items.length}</span>
                  </div>
                </div>

                <Separator className="bg-primary/10" />

                <div className="flex items-start gap-2 text-[10px] text-muted-foreground/80 italic leading-relaxed">
                  <Info size={12} className="shrink-0 mt-0.5" />
                  <p>Your data is stored only in this browser's local storage. Clearing browser data or using a different browser will start a fresh session.</p>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="font-serif text-xl text-destructive flex items-center gap-2">
              <ShieldAlert size={20} />
              Danger Zone
            </h2>
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="p-6 space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Resetting the session will clear your current adventure selection and session log, but will <strong>keep</strong> your characters and DM prep nodes.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground font-bold">
                      <RefreshCcw size={16} className="mr-2" /> Reset Session
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Current Session?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will clear your current adventure progress and session log. 
                        Your characters and DM preparation data will be preserved.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={resetSession} className="bg-destructive text-destructive-foreground">
                        Reset Session
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive text-xs">
                      <Trash2 size={14} className="mr-2" /> Clear All Local Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive flex items-center gap-2">
                        <ShieldAlert size={20} />
                        EXTREME ACTION
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-bold text-foreground">
                        This will permanently delete ALL characters, ALL DM preparation nodes, and ALL sourcebook data stored in this browser.
                        This action cannot be undone unless you have a backup file.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-destructive text-destructive-foreground"
                        onClick={() => {
                          localStorage.clear();
                          window.location.reload();
                        }}
                      >
                        Delete Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
