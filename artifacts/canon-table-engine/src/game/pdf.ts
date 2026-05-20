import type { ImportedPdfSource, SourceBookId } from "./types";

export function formatPdfFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function computeFileHash(file: Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function buildImportedPdfSource(file: File, sourceBookId: SourceBookId = "CM"): Promise<ImportedPdfSource> {
  const fileHash = await computeFileHash(file);
  return {
    id: `${Date.now()}-${fileHash.slice(0, 10)}`,
    sourceId: sourceBookId,
    sourceBook: file.name,
    fileName: file.name,
    fileHash,
    fileSize: file.size,
    importedAt: new Date().toISOString(),
    rawPdfStored: false,
    localOnly: true,
    detectedTitle: file.name,
    pageCount: 0,
    indexed: false,
    summary: `Imported local PDF file ${file.name}`,
  };
}
