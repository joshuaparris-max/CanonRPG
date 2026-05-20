export const SOURCE_REFERENCE_FIELDS = ["sourceBook", "sourceId", "pageRef"] as const;

export function formatSourceReference(sourceBook: string, pageRef: string): string {
  return `${sourceBook} p.${pageRef}`;
}
