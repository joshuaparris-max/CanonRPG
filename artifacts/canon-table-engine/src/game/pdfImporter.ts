import { computeFileHash } from "./pdf";
import type { ImportedPdfSource, ImportedPdfIndex, SourceBookId } from "./types";
import { buildPdfPageIndex } from "./pageMapper";
import { saveImportedPdfSource, saveImportedPdfIndex, getPdfIndexById } from "./pdfStorage";

const PDFJS_VERSION = "5.7.284";
const PDFJS_BASE = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VERSION}/legacy/build`;

async function loadPdfJs() {
  const pdfjs = await import(/* @vite-ignore */ `${PDFJS_BASE}/pdf.js`);
  (pdfjs as any).GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.js`;
  return pdfjs as any;
}

function normalizeFileName(fileName: string): string {
  return fileName.replace(/\s+/g, " ").trim();
}

async function getPageText(page: any): Promise<string> {
  const content = await page.getTextContent();
  const items = content.items as Array<{ str?: string } | string>;
  return items.map((item) => (typeof item === "string" ? item : item.str ?? "")).join(" ");
}

export async function indexPdfFile(file: File, sourceBookId: SourceBookId): Promise<{ source: ImportedPdfSource; index: ImportedPdfIndex }> {
  const fileHash = await computeFileHash(file);
  const fileName = normalizeFileName(file.name);
  const data = new Uint8Array(await file.arrayBuffer());
  const pdfjsLib = await loadPdfJs();
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pageCount = pdf.numPages;
  const pages = [] as ImportedPdfIndex["pageIndex"];

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const text = await getPageText(page);
    pages.push(buildPdfPageIndex(pageNumber, text));
  }

  const importedAt = new Date().toISOString();
  const source: ImportedPdfSource = {
    id: `${Date.now()}-${fileHash.slice(0, 10)}`,
    sourceId: sourceBookId,
    sourceBook: fileName,
    fileName,
    fileHash,
    fileSize: file.size,
    pageCount,
    importedAt,
    rawPdfStored: false,
    localOnly: true,
    detectedTitle: fileName,
    detectedTOC: [],
    indexed: true,
    lastIndexedAt: importedAt,
    summary: `Imported local PDF file ${fileName}`,
  };

  const index: ImportedPdfIndex = {
    id: source.id,
    sourceId: source.sourceId,
    sourceBook: source.sourceBook,
    fileName: source.fileName,
    fileHash: source.fileHash,
    pageCount: source.pageCount,
    importedAt: source.importedAt,
    lastIndexedAt: importedAt,
    pageIndex: pages,
    localOnly: true,
  };

  await saveImportedPdfSource(source);
  await saveImportedPdfIndex(index);
  return { source, index };
}

export async function reindexImportedPdf(source: ImportedPdfSource, file: File): Promise<ImportedPdfIndex> {
  const { index } = await indexPdfFile(file, source.sourceId);
  return index;
}

export async function loadPdfIndex(id: string): Promise<ImportedPdfIndex | undefined> {
  return await getPdfIndexById(id);
}
