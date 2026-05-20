import type { Confidence, DetectedEntity, PdfPageIndex } from "./types";

const confidenceForMatches = (count: number): Confidence => {
  if (count >= 3) return "high";
  if (count >= 1) return "medium";
  return "low";
}

export function extractPrintedPageRef(text: string): string | undefined {
  const printedMatch = text.match(/(?:page|p\.|pg\.)\s*(\d{1,3})/i);
  return printedMatch?.[1];
}

export function extractHeadings(text: string): string[] {
  const headings = new Set<string>();
  const headingRegex = /(^|\n)\s*(Chapter\s+\d+|Area\s+\d+[A-Z]?|Section\s+\d+|Keyed Area\s+\d+|Part\s+\d+)/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(text)) !== null) {
    headings.add(match[2] || match[1] || match[0].trim());
  }
  return Array.from(headings).slice(0, 5);
}

export function detectEntities(text: string, pageIndex: number): DetectedEntity[] {
  const entities: DetectedEntity[] = [];

  const areaMatches = Array.from(text.matchAll(/Area\s+(\d+[A-Z]?)/gi));
  for (const match of areaMatches) {
    entities.push({
      type: "keyedArea",
      name: match[1],
      pageRef: undefined,
      confidence: "high",
      localOnly: true,
    });
  }

  const dcMatches = Array.from(text.matchAll(/DC\s*(\d{1,3})/gi));
  for (const match of dcMatches) {
    entities.push({
      type: "savingThrow",
      name: `DC ${match[1]}`,
      pageRef: undefined,
      confidence: "medium",
      localOnly: true,
    });
  }

  const treasureMatches = Array.from(text.matchAll(/treasure|magic item|loot|reward/gi));
  if (treasureMatches.length > 0) {
    entities.push({
      type: "treasure",
      name: "Treasure reference",
      pageRef: undefined,
      confidence: confidenceForMatches(treasureMatches.length),
      localOnly: true,
    });
  }

  const monsterMatches = Array.from(text.matchAll(/\b(Goblin|Kobold|Dragon|Zombie|Skeleton|Orc|Troll|Beholder|Mind Flayer|Goblin|Ogre|Giant)\b/gi));
  for (const match of monsterMatches) {
    entities.push({
      type: "monster",
      name: match[1],
      pageRef: undefined,
      confidence: "medium",
      localOnly: true,
    });
  }

  const npcMatches = Array.from(text.matchAll(/\b(NPC|Lord|Master|Captain|Wizard|Priest|Sage|Keeper|Archivist|Guard|Merchant)\b/gi));
  if (npcMatches.length > 0) {
    entities.push({
      type: "npc",
      name: npcMatches[0][0],
      pageRef: undefined,
      confidence: "low",
      localOnly: true,
    });
  }

  return entities;
}

export function buildPdfPageIndex(pageIndex: number, text: string): PdfPageIndex {
  return {
    pdfPageIndex: pageIndex,
    printedPageRef: extractPrintedPageRef(text),
    headings: extractHeadings(text),
    snippet: text.slice(0, 300).replace(/\s+/g, " ").trim(),
    detectedEntities: detectEntities(text, pageIndex),
    confidence: "medium",
  };
}
