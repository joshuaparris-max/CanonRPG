import type { CanonReference } from "@/game/types";

export function validateCanonReference(ref: CanonReference): boolean {
  return Boolean(ref.sourceBook && ref.sourceId && ref.pageRef);
}
