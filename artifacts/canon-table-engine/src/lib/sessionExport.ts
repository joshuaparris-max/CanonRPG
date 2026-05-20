import type { Character, SessionState, NodeOverride, CombatState } from "@/types";
import type { Monster, NPC, Item, Spell, Trap } from "@/types";

export interface SourcebookData {
  monsters: Monster[];
  npcs: NPC[];
  items: Item[];
  spells: Spell[];
  traps: Trap[];
}

export interface FullExport {
  schemaVersion: string;
  exportedAt: string;
  session: SessionState;
  characters: Character[];
  nodeOverrides: Record<string, NodeOverride>;
  sourcebook: SourcebookData;
  combat: CombatState;
}

export interface DmPrepExport {
  schemaVersion: string;
  exportedAt: string;
  nodeOverrides: Record<string, NodeOverride>;
  sourcebook: SourcebookData;
}

const SCHEMA_VERSION = "2.0.0";

export function exportFullSession(
  session: SessionState,
  characters: Character[],
  nodeOverrides: Record<string, NodeOverride>,
  sourcebook: SourcebookData,
  combat: CombatState
): string {
  const data: FullExport = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    session,
    characters,
    nodeOverrides,
    sourcebook,
    combat,
  };
  return JSON.stringify(data, null, 2);
}

export function exportDmPrep(
  nodeOverrides: Record<string, NodeOverride>,
  sourcebook: SourcebookData
): string {
  const data: DmPrepExport = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    nodeOverrides,
    sourcebook,
  };
  return JSON.stringify(data, null, 2);
}

export function exportCharacters(characters: Character[]): string {
  return JSON.stringify(
    { schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), characters },
    null,
    2
  );
}

export function exportCombatLog(log: string[]): string {
  return log.join("\n");
}

export function validateImport(json: string): { valid: boolean; error?: string; data?: FullExport } {
  try {
    const data = JSON.parse(json) as FullExport;
    if (!data.schemaVersion) {
      return { valid: false, error: "Missing schemaVersion field." };
    }
    if (data.schemaVersion !== SCHEMA_VERSION) {
      return {
        valid: false,
        error: `Schema version mismatch. Expected ${SCHEMA_VERSION}, got ${data.schemaVersion}. This file may be from a different version.`,
      };
    }
    if (!data.session) return { valid: false, error: "Missing session data." };
    if (!Array.isArray(data.characters)) return { valid: false, error: "Missing characters array." };
    return { valid: true, data };
  } catch (e) {
    return { valid: false, error: `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}` };
  }
}

export function validateDmPrepImport(json: string): { valid: boolean; error?: string; data?: DmPrepExport } {
  try {
    const data = JSON.parse(json) as DmPrepExport;
    if (!data.schemaVersion) return { valid: false, error: "Missing schemaVersion." };
    if (data.schemaVersion !== SCHEMA_VERSION) {
      return { valid: false, error: `Schema version mismatch. Expected ${SCHEMA_VERSION}, got ${data.schemaVersion}.` };
    }
    if (!data.nodeOverrides) return { valid: false, error: "Missing nodeOverrides data." };
    return { valid: true, data };
  } catch (e) {
    return { valid: false, error: `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}` };
  }
}

export function validateCharactersImport(json: string): { valid: boolean; error?: string; data?: Character[] } {
  try {
    const parsed = JSON.parse(json) as { schemaVersion?: string; characters?: Character[] };
    if (!parsed.schemaVersion) return { valid: false, error: "Missing schemaVersion." };
    if (!Array.isArray(parsed.characters)) return { valid: false, error: "Missing characters array." };
    return { valid: true, data: parsed.characters };
  } catch (e) {
    return { valid: false, error: `Invalid JSON: ${e instanceof Error ? e.message : "parse error"}` };
  }
}

export function generateSessionSummary(
  session: SessionState,
  characters: Character[],
  nodeOverrides: Record<string, NodeOverride>,
  adventureTitle: string
): string {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  
  const partyList = characters
    .map((c) => `- ${c.name} (${c.race} ${c.class} ${c.level}, HP ${c.currentHp}/${c.maxHp})`)
    .join("\n");

  const completed = Object.values(nodeOverrides).filter((n) => n.completed);
  const completedList = completed.map((n) => `- ${n.sceneTitle || n.id} (p. ${n.pageRef || "?"})`).join("\n");

  const current = nodeOverrides[session.currentNodeId];
  const currentInfo = current
    ? `**${current.sceneTitle || session.currentNodeId}** (p. ${current.pageRef || "?"}, ${current.keyedArea || ""})`
    : session.currentNodeId || "Not set";

  const recentLog = session.sessionLog.slice(-10).join("\n");

  return `# Session Summary

**Campaign Mode:** ${session.campaignMode || "Not set"}
**Adventure:** ${adventureTitle || "Not set"}
**Date:** ${date}

## Party
${partyList || "No characters in party."}

## Completed Nodes
${completedList || "None completed yet."}

## Current Node
${currentInfo}

## Recent Session Log
${recentLog || "No log entries."}

## DM Notes
${session.dmNotes || "None."}

---
*Generated by Canon Table Engine. Unofficial reference companion. Not affiliated with or endorsed by Wizards of the Coast.*
`;
}

export function downloadFile(content: string, filename: string, mimeType = "application/json") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
