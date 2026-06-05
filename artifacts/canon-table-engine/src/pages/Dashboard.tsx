import { Link } from "wouter";
import { useSession } from "@/hooks/useSession";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CAMPAIGN_MODES, ADVENTURES } from "@/data/adventureSkeletons";
import type { Character, NodeOverride } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Map, 
  Sword, 
  BookOpen, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ChevronRight,
  Shield,
  ClipboardList,
  Save,
  Play
} from "lucide-react";

export default function Dashboard() {
  const { session, updateSession } = useSession();
  const [characters] = useLocalStorage<Character[]>("cte_characters", []);
  const [nodeOverrides] = useLocalStorage<Record<string, NodeOverride>>("cte_node_overrides", {});
  const [ravnicaCrossover, setRavnicaCrossover] = useLocalStorage("cte_ravnica_crossover", false);

  const currentAdventure = ADVENTURES.find((a) => a.id === session.adventureId);

  const readinessChecks = [
    { label: "Campaign mode selected", ok: !!session.campaignMode },
    { label: "Adventure selected", ok: !!session.adventureId },
    { label: "Party has characters", ok: characters.length > 0 },
    {
      label: "Current node set",
      ok: !!session.currentNodeId && !!nodeOverrides[session.currentNodeId]?.pageRef,
    },
  ];
  const readyCount = readinessChecks.filter((c) => c.ok).length;
  const readinessScore = Math.round((readyCount / readinessChecks.length) * 100);
  const readinessColor =
    readinessScore === 100
      ? "text-green-500"
      : readinessScore >= 50
      ? "text-amber-500"
      : "text-red-500";

  const completedNodes = Object.values(nodeOverrides).filter((n) => n.completed).length;
  const currentNode = session.currentNodeId ? nodeOverrides[session.currentNodeId] : null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-primary tracking-tight">Campaign Dashboard</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Welcome back, DM. Manage your campaign settings, track preparation progress, and jump into your next session.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/save-manager"><Save size={14} className="mr-2" /> Backups</Link>
          </Button>
        </div>
      </header>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Quick Start</p>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Select a campaign mode and adventure, then use Save Manager to export your local session before you reset or change campaigns.
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/save-manager">Backup now</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div>All game state is stored locally in your browser.</div>
            <div>Private DM prep should be exported only when you want a backup.</div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-primary flex items-center gap-2">
            <Map size={20} />
            Campaign Mode
          </h2>
          {session.campaignMode && (
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
              Current: {CAMPAIGN_MODES.find(m => m.id === session.campaignMode)?.title}
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CAMPAIGN_MODES.map((mode) => {
            const active = session.campaignMode === mode.id;
            const isRavnica = mode.id === "ravnica";
            return (
              <Card
                key={mode.id}
                className={`group relative overflow-hidden cursor-pointer border-2 transition-all duration-300 hover:shadow-lg ${
                  active 
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                    : "border-border hover:border-muted-foreground/50"
                } ${isRavnica && !ravnicaCrossover ? "opacity-60" : ""}`}
                onClick={() => {
                  if (isRavnica && !ravnicaCrossover) return;
                  updateSession({ campaignMode: mode.id, adventureId: "", currentNodeId: "" });
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-serif text-lg">
                      {mode.title}
                    </CardTitle>
                    {active && (
                      <div className="bg-primary text-primary-foreground p-1 rounded-full">
                        <CheckCircle size={14} />
                      </div>
                    )}
                  </div>
                  <CardDescription className="text-xs">
                    {isRavnica 
                      ? "Guildmasters' Guide to Ravnica setting" 
                      : `${mode.adventures.length} Adventure Scaffolds`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {isRavnica ? (
                    <div className="space-y-3 pt-2" onClick={(e) => e.stopPropagation()}>
                      <p className="leading-relaxed">Setting-specific content (GGR). Requires explicit crossover mode to enable Ravnica options.</p>
                      <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md border border-border">
                        <Switch
                          id="ravnica-crossover"
                          checked={ravnicaCrossover}
                          onCheckedChange={(v) => {
                            setRavnicaCrossover(v);
                            if (!v && session.campaignMode === "ravnica") {
                              updateSession({ campaignMode: "" });
                            }
                          }}
                        />
                        <Label htmlFor="ravnica-crossover" className="text-[10px] font-bold uppercase tracking-wider cursor-pointer">Enable crossover</Label>
                      </div>
                    </div>
                  ) : (
                    <p className="italic">Ready for official adventures.</p>
                  )}
                </CardContent>
                {active && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary" />}
              </Card>
            );
          })}
        </div>
      </section>

      {session.campaignMode && session.campaignMode !== "ravnica" && (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <h2 className="font-serif text-xl text-primary flex items-center gap-2">
            <BookOpen size={20} />
            Select Adventure
          </h2>
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CAMPAIGN_MODES.find((m) => m.id === session.campaignMode)?.adventures.map((adv) => {
                  const active = session.adventureId === adv.id;
                  return (
                    <button
                      key={adv.id}
                      className={`group text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                        active
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border bg-card hover:border-muted-foreground/50"
                      }`}
                      onClick={() => updateSession({ adventureId: adv.id, currentNodeId: adv.nodes[0]?.id ?? "" })}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-serif font-bold">{adv.title}</div>
                        {active && <Badge className="text-[10px] h-4">Selected</Badge>}
                      </div>
                      <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                        <span>{adv.sourceBook}</span>
                        <span>•</span>
                        <span>Level {adv.startingLevel}</span>
                        <span>•</span>
                        <span>{adv.nodes.length} Nodes</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center justify-between">
              Status
              <span className={`text-2xl font-bold ${readinessColor}`}>{readinessScore}%</span>
            </CardTitle>
            <CardDescription className="text-xs">Session Readiness Checklist</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {readinessChecks.map((check) => (
                <div key={check.label} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/30">
                  <span className={check.ok ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {check.label}
                  </span>
                  {check.ok ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <AlertTriangle size={16} className="text-amber-500" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="pt-2">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${readinessScore === 100 ? 'bg-green-500' : 'bg-primary'}`} 
                  style={{ width: `${readinessScore}%` }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Clock size={18} className="text-primary" />
              Active Session
            </CardTitle>
            <CardDescription className="text-xs">Currently loaded campaign state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Adventure</Label>
                  <p className="font-serif text-lg truncate">{currentAdventure?.title ?? "None Selected"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Current Node</Label>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <ChevronRight size={14} className="text-primary" />
                    {currentNode?.sceneTitle || session.currentNodeId || "Not Set"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-lg border border-border">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Party</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">{characters.length}</span>
                      <span className="text-xs text-muted-foreground">Members</span>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Progress</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">{completedNodes}</span>
                      <span className="text-xs text-muted-foreground">Nodes</span>
                    </div>
                  </div>
                </div>
                
                {session.lastSaved > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-2 rounded-md border border-primary/10">
                    <Clock size={12} className="text-primary" />
                    <span>Last local sync: {new Date(session.lastSaved).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-6 right-6 md:static md:flex md:flex-wrap md:gap-4 md:pt-4">
        <Button size="lg" className="shadow-xl md:shadow-none h-14 md:h-11 px-8 text-base md:text-sm rounded-full md:rounded-md" asChild>
          <Link href="/session">
            <Play size={18} className="mr-2 fill-current" /> 
            Run Session
          </Link>
        </Button>
        <div className="hidden md:flex gap-3">
          <Button variant="outline" size="lg" className="h-11 px-6" asChild>
            <Link href="/dm-prep"><BookOpen size={18} className="mr-2" /> Prep Nodes</Link>
          </Button>
          <Button variant="outline" size="lg" className="h-11 px-6" asChild>
            <Link href="/characters"><Users size={18} className="mr-2" /> Manage Party</Link>
          </Button>
          <Button variant="outline" size="lg" className="h-11 px-6" asChild>
            <Link href="/combat"><Shield size={18} className="mr-2" /> Combat Tracker</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
