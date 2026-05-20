import type { SourceBookId } from "./types";

export function getSourceReferenceLabel(sourceBook: SourceBookId, sourceId: string, pageRef: string): string {
  return `${sourceBook} ${sourceId}${pageRef ? `, p.${pageRef}` : ""}`;
}

export function formatSourceReference(sourceBook: SourceBookId, pageRef: string): string {
  return `${sourceBook} p.${pageRef}`;
}
