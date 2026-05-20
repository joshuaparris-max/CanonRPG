import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.js?url";
import type { ImportedPdf, PdfIndexEntry } from "@/types";

GlobalWorkerOptions.workerSrc = pdfjsWorker;

function makeId(prefix = "pdf"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

async function sha256(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function detectKind(text: string): PdfIndexEntry["kind"] {
  if (/\b(monster|creature)\b/i.test(text)) return "monster";
  if (/\b(npc|non-player character|villain|ally)\b/i.test(text)) return "npc";
  if (/\b(item|treasure|equipment|magic item)\b/i.test(text)) return "item";
  if (/\b(spell|cantrip|ritual)\b/i.test(text)) return "spell";
  if (/\b(trap|hazard|pitfall|ambush)\b/i.test(text)) return "trap";
  if (/\b(chapter|section|area|scene|encounter)\b/i.test(text)) return "chapter";
  return "other";
}

function makeIndexLabel(text: string): string {
  return text.split(/\. |; |\n/)[0]?.slice(0, 120) || text.slice(0, 120);
}

export async function parsePdfFile(file: File, sourceBook: string): Promise<ImportedPdf> {
  const buffer = await file.arrayBuffer();
  const fileHash = await sha256(buffer);
  const loadingTask = getDocument({ data: buffer });
  const pdf = await loadingTask.promise;
  const meta = await pdf.getMetadata().catch(() => null);
  const info = (meta as any)?.info as Record<string, unknown> | undefined;
  const metadata = (meta as any)?.metadata as { get: (key: string) => unknown } | undefined;
  const title = (info?.Title || metadata?.get?.("dc:title") || file.name)?.toString() || file.name;
  const pageCount = pdf.numPages;
  const indexEntries: PdfIndexEntry[] = [];

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = normalizeText(content.items.map((item: any) => item.str).join(" "));
    if (!text) continue;
    const kind = detectKind(text);
    const label = makeIndexLabel(text);
    indexEntries.push({
      id: `${fileHash}-${pageNumber}`,
      pageNumber,
      excerpt: label,
      label,
      kind,
    });
  }

  if (indexEntries.length === 0) {
    indexEntries.push({
      id: `${fileHash}-1`,
      pageNumber: 1,
      excerpt: title.slice(0, 120),
      label: title.slice(0, 120),
      kind: "other",
    });
  }

  return {
    id: makeId(fileHash),
    fileName: file.name,
    fileHash,
    sourceBook,
    importDate: new Date().toISOString(),
    pageCount,
    title,
    detectedTitle: title,
    detectedToc: [],
    pdfPageOffset: null,
    indexedStatus: "indexed",
    lastIndexedAt: new Date().toISOString(),
    indexEntries,
  };
}
