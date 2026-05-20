import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Monster, NPC, Item, Spell, Trap } from "@/types";
import { SOURCE_BOOKS } from "@/data/sourceBooks";
import { MAGIC_SCHOOLS, ITEM_RARITIES, NPC_ATTITUDES } from "@/data/characterDefaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceChip } from "@/components/SourceChip";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertTriangle, Lock } from "lucide-react";

interface SourcebookStore {
  monsters: Monster[];
  npcs: NPC[];
  items: Item[];
  spells: Spell[];
  traps: Trap[];
}

const DEFAULT_STORE: SourcebookStore = { monsters: [], npcs: [], items: [], spells: [], traps: [] };

const PRIVATE_WARNING = "Private prep data may contain material from books you own. It stays local in your browser. Do not commit or share exported DM data if it contains copyrighted text.";

function newId() { return Math.random().toString(36).slice(2, 9); }

function SourceBookSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className="w-full h-8 text-xs bg-muted border border-border rounded px-2" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select source book…</option>
      {SOURCE_BOOKS.map((b) => <option key={b.id} value={b.id}>{b.shortTitle} — {b.title}</option>)}
    </select>
  );
}

function WarningBanner() {
  return (
    <div className="bg-amber-950/40 border border-amber-800/50 rounded p-2 text-xs text-amber-300 flex gap-2 mb-3">
      <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
      <span>{PRIVATE_WARNING}</span>
    </div>
  );
}

function PrivateBadge() {
  return <Badge className="text-xs bg-amber-900/50 text-amber-300 border-amber-700 flex items-center gap-1"><Lock size={9} /> Private</Badge>;
}

export default function Sourcebook() {
  const [store, setStore] = useLocalStorage<SourcebookStore>("cte_sourcebook", DEFAULT_STORE);
  const [characters] = useLocalStorage<{ id: string; name: string }[]>("cte_characters", []);

  const updateList = <K extends keyof SourcebookStore>(key: K, items: SourcebookStore[K]) => {
    setStore((prev) => ({ ...prev, [key]: items }));
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="font-serif text-2xl text-primary mb-4">Sourcebook Data Entry</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Enter stats, NPCs, items, spells, and traps from books you own. All entries are private and local-only.
        Source book and page reference are required fields.
      </p>

      <Tabs defaultValue="monsters">
        <TabsList>
          <TabsTrigger value="monsters">Monsters ({store.monsters.length})</TabsTrigger>
          <TabsTrigger value="npcs">NPCs ({store.npcs.length})</TabsTrigger>
          <TabsTrigger value="items">Items ({store.items.length})</TabsTrigger>
          <TabsTrigger value="spells">Spells ({store.spells.length})</TabsTrigger>
          <TabsTrigger value="traps">Traps ({store.traps.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="monsters" className="mt-4">
          <MonsterTab monsters={store.monsters} onChange={(m) => updateList("monsters", m)} />
        </TabsContent>
        <TabsContent value="npcs" className="mt-4">
          <NpcTab npcs={store.npcs} onChange={(n) => updateList("npcs", n)} />
        </TabsContent>
        <TabsContent value="items" className="mt-4">
          <ItemTab items={store.items} onChange={(i) => updateList("items", i)} characters={characters} />
        </TabsContent>
        <TabsContent value="spells" className="mt-4">
          <SpellTab spells={store.spells} onChange={(s) => updateList("spells", s)} />
        </TabsContent>
        <TabsContent value="traps" className="mt-4">
          <TrapTab traps={store.traps} onChange={(t) => updateList("traps", t)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MonsterTab({ monsters, onChange }: { monsters: Monster[]; onChange: (m: Monster[]) => void }) {
  const empty: Omit<Monster, "id"> = { name: "", sourceBook: "", sourceId: "", pageRef: "", localOnly: true, enteredByUser: true, ac: 10, maxHP: 10, initiativeMod: 0, speedNote: "", attackBonus: 0, damageFormula: "1d6", savingThrowBonuses: "", conditionNotes: "", traitsActionsNotes: "", cr: "1", xp: 200 };
  const [form, setForm] = useState<Omit<Monster, "id">>(empty);
  const [adding, setAdding] = useState(false);
  const valid = form.name && form.sourceBook && form.sourceId && form.pageRef;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-base">Monster Combat Profiles</h2>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding}><Plus size={13} className="mr-1" />Add Monster</Button>
      </div>
      {adding && (
        <Card className="border-amber-800/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-serif">New Monster Entry</CardTitle>
              <PrivateBadge />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <WarningBanner />
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1"><Label className="text-xs">Name *</Label><Input className="h-7 text-xs" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} data-testid="input-monster-entry-name" /></div>
              <div><Label className="text-xs">Source Book *</Label><SourceBookSelect value={form.sourceBook} onChange={(v) => setForm((p) => ({ ...p, sourceBook: v }))} /></div>
              <div><Label className="text-xs">Source ID * (e.g. MM p.64)</Label><Input className="h-7 text-xs font-mono" value={form.sourceId} onChange={(e) => setForm((p) => ({ ...p, sourceId: e.target.value }))} /></div>
              <div><Label className="text-xs">Page Ref *</Label><Input className="h-7 text-xs font-mono" value={form.pageRef} onChange={(e) => setForm((p) => ({ ...p, pageRef: e.target.value }))} /></div>
              <div><Label className="text-xs">AC</Label><Input type="number" className="h-7 text-xs font-mono" value={form.ac} onChange={(e) => setForm((p) => ({ ...p, ac: parseInt(e.target.value) || 10 }))} /></div>
              <div><Label className="text-xs">Max HP</Label><Input type="number" className="h-7 text-xs font-mono" value={form.maxHP} onChange={(e) => setForm((p) => ({ ...p, maxHP: parseInt(e.target.value) || 1 }))} /></div>
              <div><Label className="text-xs">Initiative Mod</Label><Input type="number" className="h-7 text-xs font-mono" value={form.initiativeMod} onChange={(e) => setForm((p) => ({ ...p, initiativeMod: parseInt(e.target.value) || 0 }))} /></div>
              <div><Label className="text-xs">Speed Note</Label><Input className="h-7 text-xs" value={form.speedNote} onChange={(e) => setForm((p) => ({ ...p, speedNote: e.target.value }))} /></div>
              <div><Label className="text-xs">Attack Bonus</Label><Input type="number" className="h-7 text-xs font-mono" value={form.attackBonus} onChange={(e) => setForm((p) => ({ ...p, attackBonus: parseInt(e.target.value) || 0 }))} /></div>
              <div><Label className="text-xs">Damage Formula</Label><Input className="h-7 text-xs font-mono" value={form.damageFormula} onChange={(e) => setForm((p) => ({ ...p, damageFormula: e.target.value }))} /></div>
              <div><Label className="text-xs">CR</Label><Input className="h-7 text-xs font-mono" value={form.cr} onChange={(e) => setForm((p) => ({ ...p, cr: e.target.value }))} /></div>
              <div><Label className="text-xs">XP</Label><Input type="number" className="h-7 text-xs font-mono" value={form.xp} onChange={(e) => setForm((p) => ({ ...p, xp: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div><Label className="text-xs">Saving Throw Bonuses</Label><Input className="h-7 text-xs" placeholder="e.g. STR +3, DEX +1" value={form.savingThrowBonuses} onChange={(e) => setForm((p) => ({ ...p, savingThrowBonuses: e.target.value }))} /></div>
            <div><Label className="text-xs">Condition Notes (private)</Label><Input className="h-7 text-xs" value={form.conditionNotes} onChange={(e) => setForm((p) => ({ ...p, conditionNotes: e.target.value }))} /></div>
            <div><Label className="text-xs">Traits / Actions Notes (private — your own notes from the book)</Label><Textarea className="text-xs" rows={3} value={form.traitsActionsNotes} onChange={(e) => setForm((p) => ({ ...p, traitsActionsNotes: e.target.value }))} /></div>
            <div className="flex gap-2">
              <Button size="sm" disabled={!valid} onClick={() => { onChange([...monsters, { ...form, id: newId() }]); setForm(empty); setAdding(false); }}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {monsters.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-2 bg-card border border-border rounded text-sm" data-testid={`monster-${m.id}`}>
            <span className="font-medium">{m.name}</span>
            <SourceChip sourceId={m.sourceBook} pageRef={m.pageRef} />
            <span className="text-xs text-muted-foreground font-mono">AC {m.ac} HP {m.maxHP} CR {m.cr}</span>
            <PrivateBadge />
            <Button size="sm" variant="ghost" className="ml-auto h-6 px-1 text-destructive" onClick={() => onChange(monsters.filter((x) => x.id !== m.id))}><Trash2 size={11} /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NpcTab({ npcs, onChange }: { npcs: NPC[]; onChange: (n: NPC[]) => void }) {
  const empty: Omit<NPC, "id"> = { name: "", sourceBook: "", sourceId: "", pageRef: "", localOnly: true, enteredByUser: true, role: "", attitude: "Neutral", privateNotes: "", linkedNodeIds: "" };
  const [form, setForm] = useState<Omit<NPC, "id">>(empty);
  const [adding, setAdding] = useState(false);
  const valid = form.name && form.sourceBook && form.sourceId && form.pageRef;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-base">NPC References</h2>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding}><Plus size={13} className="mr-1" />Add NPC</Button>
      </div>
      {adding && (
        <Card className="border-amber-800/40">
          <CardContent className="pt-4 space-y-3">
            <WarningBanner />
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Name *</Label><Input className="h-7 text-xs" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
              <div><Label className="text-xs">Source Book *</Label><SourceBookSelect value={form.sourceBook} onChange={(v) => setForm((p) => ({ ...p, sourceBook: v }))} /></div>
              <div><Label className="text-xs">Source ID *</Label><Input className="h-7 text-xs font-mono" value={form.sourceId} onChange={(e) => setForm((p) => ({ ...p, sourceId: e.target.value }))} /></div>
              <div><Label className="text-xs">Page Ref *</Label><Input className="h-7 text-xs font-mono" value={form.pageRef} onChange={(e) => setForm((p) => ({ ...p, pageRef: e.target.value }))} /></div>
              <div><Label className="text-xs">Role</Label><Input className="h-7 text-xs" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} /></div>
              <div><Label className="text-xs">Attitude</Label>
                <select className="w-full h-7 text-xs bg-muted border border-border rounded px-2" value={form.attitude} onChange={(e) => setForm((p) => ({ ...p, attitude: e.target.value }))}>
                  {NPC_ATTITUDES.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div><Label className="text-xs">Linked Node IDs</Label><Input className="h-7 text-xs font-mono" value={form.linkedNodeIds} onChange={(e) => setForm((p) => ({ ...p, linkedNodeIds: e.target.value }))} /></div>
            <div><Label className="text-xs">Private Notes</Label><Textarea className="text-xs" rows={2} value={form.privateNotes} onChange={(e) => setForm((p) => ({ ...p, privateNotes: e.target.value }))} /></div>
            <div className="flex gap-2">
              <Button size="sm" disabled={!valid} onClick={() => { onChange([...npcs, { ...form, id: newId() }]); setForm(empty); setAdding(false); }}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {npcs.map((n) => (
          <div key={n.id} className="flex items-center gap-3 p-2 bg-card border border-border rounded text-sm">
            <span className="font-medium">{n.name}</span>
            <SourceChip sourceId={n.sourceBook} pageRef={n.pageRef} />
            <span className="text-xs text-muted-foreground">{n.role}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${n.attitude === "Friendly" ? "bg-green-900/40 text-green-300" : n.attitude === "Hostile" ? "bg-red-900/40 text-red-300" : "bg-muted text-muted-foreground"}`}>{n.attitude}</span>
            <PrivateBadge />
            <Button size="sm" variant="ghost" className="ml-auto h-6 px-1 text-destructive" onClick={() => onChange(npcs.filter((x) => x.id !== n.id))}><Trash2 size={11} /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemTab({ items, onChange, characters }: { items: Item[]; onChange: (i: Item[]) => void; characters: { id: string; name: string }[] }) {
  const empty: Omit<Item, "id"> = { name: "", sourceBook: "", sourceId: "", pageRef: "", localOnly: true, enteredByUser: true, rarity: "Common", itemType: "", assignedCharacterId: "", privateNotes: "" };
  const [form, setForm] = useState<Omit<Item, "id">>(empty);
  const [adding, setAdding] = useState(false);
  const valid = form.name && form.sourceBook && form.sourceId && form.pageRef;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-base">Items / Treasure</h2>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding}><Plus size={13} className="mr-1" />Add Item</Button>
      </div>
      {adding && (
        <Card className="border-amber-800/40">
          <CardContent className="pt-4 space-y-3">
            <WarningBanner />
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Name *</Label><Input className="h-7 text-xs" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
              <div><Label className="text-xs">Source Book *</Label><SourceBookSelect value={form.sourceBook} onChange={(v) => setForm((p) => ({ ...p, sourceBook: v }))} /></div>
              <div><Label className="text-xs">Source ID *</Label><Input className="h-7 text-xs font-mono" value={form.sourceId} onChange={(e) => setForm((p) => ({ ...p, sourceId: e.target.value }))} /></div>
              <div><Label className="text-xs">Page Ref *</Label><Input className="h-7 text-xs font-mono" value={form.pageRef} onChange={(e) => setForm((p) => ({ ...p, pageRef: e.target.value }))} /></div>
              <div><Label className="text-xs">Rarity</Label><select className="w-full h-7 text-xs bg-muted border border-border rounded px-2" value={form.rarity} onChange={(e) => setForm((p) => ({ ...p, rarity: e.target.value }))}>{ITEM_RARITIES.map((r) => <option key={r}>{r}</option>)}</select></div>
              <div><Label className="text-xs">Item Type</Label><Input className="h-7 text-xs" value={form.itemType} onChange={(e) => setForm((p) => ({ ...p, itemType: e.target.value }))} /></div>
              <div><Label className="text-xs">Assigned Character</Label><select className="w-full h-7 text-xs bg-muted border border-border rounded px-2" value={form.assignedCharacterId} onChange={(e) => setForm((p) => ({ ...p, assignedCharacterId: e.target.value }))}><option value="">None</option>{characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            </div>
            <div><Label className="text-xs">Private Notes</Label><Textarea className="text-xs" rows={2} value={form.privateNotes} onChange={(e) => setForm((p) => ({ ...p, privateNotes: e.target.value }))} /></div>
            <div className="flex gap-2">
              <Button size="sm" disabled={!valid} onClick={() => { onChange([...items, { ...form, id: newId() }]); setForm(empty); setAdding(false); }}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-2 bg-card border border-border rounded text-sm">
            <span className="font-medium">{item.name}</span>
            <SourceChip sourceId={item.sourceBook} pageRef={item.pageRef} />
            <span className="text-xs text-muted-foreground">{item.rarity} {item.itemType}</span>
            <PrivateBadge />
            <Button size="sm" variant="ghost" className="ml-auto h-6 px-1 text-destructive" onClick={() => onChange(items.filter((x) => x.id !== item.id))}><Trash2 size={11} /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpellTab({ spells, onChange }: { spells: Spell[]; onChange: (s: Spell[]) => void }) {
  const empty: Omit<Spell, "id"> = { name: "", sourceBook: "", sourceId: "", pageRef: "", localOnly: true, enteredByUser: true, level: 0, school: MAGIC_SCHOOLS[0], privateNotes: "" };
  const [form, setForm] = useState<Omit<Spell, "id">>(empty);
  const [adding, setAdding] = useState(false);
  const valid = form.name && form.sourceBook && form.sourceId && form.pageRef;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-base">Spell References</h2>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding}><Plus size={13} className="mr-1" />Add Spell</Button>
      </div>
      {adding && (
        <Card className="border-amber-800/40">
          <CardContent className="pt-4 space-y-3">
            <WarningBanner />
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Name *</Label><Input className="h-7 text-xs" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
              <div><Label className="text-xs">Source Book *</Label><SourceBookSelect value={form.sourceBook} onChange={(v) => setForm((p) => ({ ...p, sourceBook: v }))} /></div>
              <div><Label className="text-xs">Source ID *</Label><Input className="h-7 text-xs font-mono" value={form.sourceId} onChange={(e) => setForm((p) => ({ ...p, sourceId: e.target.value }))} /></div>
              <div><Label className="text-xs">Page Ref *</Label><Input className="h-7 text-xs font-mono" value={form.pageRef} onChange={(e) => setForm((p) => ({ ...p, pageRef: e.target.value }))} /></div>
              <div><Label className="text-xs">Level (0=Cantrip)</Label><Input type="number" min={0} max={9} className="h-7 text-xs font-mono" value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: parseInt(e.target.value) || 0 }))} /></div>
              <div><Label className="text-xs">School</Label><select className="w-full h-7 text-xs bg-muted border border-border rounded px-2" value={form.school} onChange={(e) => setForm((p) => ({ ...p, school: e.target.value }))}>{MAGIC_SCHOOLS.map((s) => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div><Label className="text-xs">Private Notes</Label><Textarea className="text-xs" rows={2} value={form.privateNotes} onChange={(e) => setForm((p) => ({ ...p, privateNotes: e.target.value }))} /></div>
            <div className="flex gap-2">
              <Button size="sm" disabled={!valid} onClick={() => { onChange([...spells, { ...form, id: newId() }]); setForm(empty); setAdding(false); }}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {spells.map((s) => (
          <div key={s.id} className="flex items-center gap-3 p-2 bg-card border border-border rounded text-sm">
            <span className="font-medium">{s.name}</span>
            <SourceChip sourceId={s.sourceBook} pageRef={s.pageRef} />
            <span className="text-xs text-muted-foreground">Level {s.level} {s.school}</span>
            <PrivateBadge />
            <Button size="sm" variant="ghost" className="ml-auto h-6 px-1 text-destructive" onClick={() => onChange(spells.filter((x) => x.id !== s.id))}><Trash2 size={11} /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrapTab({ traps, onChange }: { traps: Trap[]; onChange: (t: Trap[]) => void }) {
  const empty: Omit<Trap, "id"> = { name: "", sourceBook: "", sourceId: "", pageRef: "", localOnly: true, enteredByUser: true, triggerNote: "", dc: 13, saveCheckType: "DEX", damageFormula: "2d6", privateNotes: "" };
  const [form, setForm] = useState<Omit<Trap, "id">>(empty);
  const [adding, setAdding] = useState(false);
  const valid = form.name && form.sourceBook && form.sourceId && form.pageRef;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-base">Traps / Hazards</h2>
        <Button size="sm" onClick={() => setAdding(true)} disabled={adding}><Plus size={13} className="mr-1" />Add Trap</Button>
      </div>
      {adding && (
        <Card className="border-amber-800/40">
          <CardContent className="pt-4 space-y-3">
            <WarningBanner />
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Name *</Label><Input className="h-7 text-xs" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
              <div><Label className="text-xs">Source Book *</Label><SourceBookSelect value={form.sourceBook} onChange={(v) => setForm((p) => ({ ...p, sourceBook: v }))} /></div>
              <div><Label className="text-xs">Source ID *</Label><Input className="h-7 text-xs font-mono" value={form.sourceId} onChange={(e) => setForm((p) => ({ ...p, sourceId: e.target.value }))} /></div>
              <div><Label className="text-xs">Page Ref *</Label><Input className="h-7 text-xs font-mono" value={form.pageRef} onChange={(e) => setForm((p) => ({ ...p, pageRef: e.target.value }))} /></div>
              <div><Label className="text-xs">Trigger Note</Label><Input className="h-7 text-xs" value={form.triggerNote} onChange={(e) => setForm((p) => ({ ...p, triggerNote: e.target.value }))} /></div>
              <div><Label className="text-xs">DC</Label><Input type="number" className="h-7 text-xs font-mono" value={form.dc} onChange={(e) => setForm((p) => ({ ...p, dc: parseInt(e.target.value) || 13 }))} /></div>
              <div><Label className="text-xs">Save / Check</Label><Input className="h-7 text-xs font-mono" value={form.saveCheckType} onChange={(e) => setForm((p) => ({ ...p, saveCheckType: e.target.value }))} /></div>
              <div><Label className="text-xs">Damage Formula</Label><Input className="h-7 text-xs font-mono" value={form.damageFormula} onChange={(e) => setForm((p) => ({ ...p, damageFormula: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Private Notes</Label><Textarea className="text-xs" rows={2} value={form.privateNotes} onChange={(e) => setForm((p) => ({ ...p, privateNotes: e.target.value }))} /></div>
            <div className="flex gap-2">
              <Button size="sm" disabled={!valid} onClick={() => { onChange([...traps, { ...form, id: newId() }]); setForm(empty); setAdding(false); }}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="space-y-2">
        {traps.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-2 bg-card border border-border rounded text-sm">
            <span className="font-medium">{t.name}</span>
            <SourceChip sourceId={t.sourceBook} pageRef={t.pageRef} />
            <span className="text-xs font-mono text-muted-foreground">{t.saveCheckType} DC {t.dc} | {t.damageFormula}</span>
            <PrivateBadge />
            <Button size="sm" variant="ghost" className="ml-auto h-6 px-1 text-destructive" onClick={() => onChange(traps.filter((x) => x.id !== t.id))}><Trash2 size={11} /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
