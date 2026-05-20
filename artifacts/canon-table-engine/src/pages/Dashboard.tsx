import { Link } from "wouter";
import { useSession } from "@/hooks/useSession";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CAMPAIGN_MODES, ADVENTURES } from "@/data/adventureSkeletons";
import type { Character, NodeOverride } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Map, Sword, BookOpen, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";

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
      ? "text-green-400"
      : readinessScore >= 50
      ? "text-amber-400"
      : "text-red-400";

  const completedNodes = Object.values(nodeOverrides).filter((n) => n.completed).length;
  const currentNode = session.currentNodeId ? nodeOverrides[session.currentNodeId] : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-primary tracking-wide">Campaign Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Select your campaign mode and begin your session.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CAMPAIGN_MODES.map((mode) => {
          const active = session.campaignMode === mode.id;
          const isRavnica = mode.id === "ravnica";
          return (
            <Card
              key={mode.id}
              className={`cursor-pointer border-2 transition-all ${
                active ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
              } ${isRavnica && !ravnicaCrossover ? "opacity-60" : ""}`}
              onClick={() => {
                if (isRavnica && !ravnicaCrossover) return;
                updateSession({ campaignMode: mode.id, adventureId: "", currentNodeId: "" });
              }}
              data-testid={`card-campaign-${mode.id}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-serif flex items-center justify-between">
                  {mode.title}
                  {active && <Badge className="text-xs">Active</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {isRavnica ? (
                  <div className="space-y-2">
                    <p>Setting-specific content (GGR). Requires explicit crossover mode.</p>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="ravnica-crossover"
                        checked={ravnicaCrossover}
                        onCheckedChange={(v) => {
                          setRavnicaCrossover(v);
                          if (!v && session.campaignMode === "ravnica") {
                            updateSession({ campaignMode: "" });
                          }
                        }}
                        data-testid="switch-ravnica-crossover"
                      />
                      <Label htmlFor="ravnica-crossover" className="text-xs">Enable crossover</Label>
                    </div>
                  </div>
                ) : (
                  <p>{mode.adventures.length} adventure{mode.adventures.length !== 1 ? "s" : ""} available</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {session.campaignMode && session.campaignMode !== "ravnica" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base">Select Adventure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAMPAIGN_MODES.find((m) => m.id === session.campaignMode)?.adventures.map((adv) => {
                const active = session.adventureId === adv.id;
                return (
                  <button
                    key={adv.id}
                    className={`text-left p-3 rounded border text-sm transition-all ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-muted-foreground"
                    }`}
                    onClick={() => updateSession({ adventureId: adv.id, currentNodeId: adv.nodes[0]?.id ?? "" })}
                    data-testid={`button-adventure-${adv.id}`}
                  >
                    <div className="font-medium">{adv.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {adv.sourceBook} · Starting Level {adv.startingLevel} · {adv.nodes.length} nodes
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <span className={readinessColor}>{readinessScore}%</span> Session Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {readinessChecks.map((check) => (
              <div key={check.label} className="flex items-center gap-2 text-sm">
                {check.ok ? (
                  <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle size={14} className="text-amber-400 flex-shrink-0" />
                )}
                <span className={check.ok ? "text-foreground" : "text-muted-foreground"}>
                  {check.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base">Current Session</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <Map size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">Adventure:</span>
              <span>{currentAdventure?.title ?? "Not selected"}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">Current node:</span>
              <span>{currentNode?.sceneTitle || session.currentNodeId || "Not set"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">Party size:</span>
              <span>{characters.length} character{characters.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">Nodes completed:</span>
              <span>{completedNodes}</span>
            </div>
            {session.lastSaved > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock size={12} />
                Last saved: {new Date(session.lastSaved).toLocaleTimeString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild data-testid="button-run-session">
          <Link href="/session"><Sword size={15} className="mr-2" /> Run Session</Link>
        </Button>
        <Button variant="outline" asChild data-testid="button-dm-prep">
          <Link href="/dm-prep"><BookOpen size={15} className="mr-2" /> DM Prep</Link>
        </Button>
        <Button variant="outline" asChild data-testid="button-characters">
          <Link href="/characters"><Users size={15} className="mr-2" /> Characters</Link>
        </Button>
      </div>
    </div>
  );
}
