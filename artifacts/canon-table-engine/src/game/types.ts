export type CanonStatus =
  | "official"
  | "official-adaptation"
  | "srd-basic"
  | "placeholder-needs-source"
  | "invalid-homebrew";

export type SourceBookId =
  | "PHB2014"
  | "MM2014"
  | "DMG2014"
  | "SCAG"
  | "CM"
  | "TFTYP"
  | "VGM"
  | "AL"
  | "AL_GUIDE"
  | "GGR";

export interface SourceInfo {
  sourceBook: SourceBookId;
  sourceId: string;
  pageRef: string;
  canonStatus: CanonStatus;
}

export interface AdventureNodeReference {
  id: string;
  title: string;
  pageRef?: string;
  chapter?: string;
  keyedArea?: string;
  sourceInfo?: SourceInfo;
}

export type PdfEntityType =
  | "monster"
  | "npc"
  | "treasure"
  | "savingThrow"
  | "keyedArea"
  | "ruleNote";

export type Confidence = "high" | "medium" | "low";

export interface DetectedEntity {
  type: PdfEntityType;
  name: string;
  pageRef?: string;
  confidence: Confidence;
  localOnly: true;
}

export interface PdfPageIndex {
  pdfPageIndex: number;
  printedPageRef?: string;
  headings: string[];
  snippet: string;
  detectedEntities: DetectedEntity[];
  confidence: Confidence;
}

export interface ImportedPdfIndex {
  id: string;
  sourceId: SourceBookId;
  sourceBook: string;
  fileName: string;
  fileHash: string;
  pageCount: number;
  importedAt: string;
  lastIndexedAt: string;
  pageIndex: PdfPageIndex[];
  localOnly: true;
}

export interface ImportedPdfSource {
  id: string;
  sourceId: SourceBookId;
  sourceBook: string;
  fileName: string;
  fileHash: string;
  fileSize: number;
  pageCount: number;
  importedAt: string;
  rawPdfStored: false;
  localOnly: true;
  detectedTitle?: string;
  detectedTOC?: string[];
  pdfPageOffset?: Record<number, string>;
  indexed: boolean;
  lastIndexedAt?: string;
  summary: string;
}

export interface AutoPrepSuggestion {
  fieldName:
    | "pageRef"
    | "chapter"
    | "keyedArea"
    | "playerSafeSummary"
    | "dmPrivateNote";
  currentValue: string;
  suggestedValue: string;
  sourceFile: string;
  sourceBook: string;
  pageRef: string;
  confidence: Confidence;
  reason: string;
}
