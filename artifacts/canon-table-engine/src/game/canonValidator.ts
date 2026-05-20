import type { SourceInfo } from "./types";

export function validateSourceInfo(entry: Partial<SourceInfo>): string[] {
  const errors: string[] = [];
  if (!entry.sourceBook) errors.push("Missing sourceBook");
  if (!entry.sourceId) errors.push("Missing sourceId");
  if (!entry.pageRef) errors.push("Missing pageRef");
  if (!entry.canonStatus) errors.push("Missing canonStatus");
  return errors;
}

export function isValidCanonStatus(status: string): boolean {
  return [
    "official",
    "official-adaptation",
    "srd-basic",
    "placeholder-needs-source",
    "invalid-homebrew",
  ].includes(status);
}

export function getCanonWarnings(entry: Partial<SourceInfo>): string[] {
  const warnings: string[] = [];
  if (!entry.sourceBook) warnings.push("Missing official source book reference.");
  if (!entry.pageRef) warnings.push("Missing page reference.");
  if (!entry.canonStatus || entry.canonStatus === "placeholder-needs-source") warnings.push("Placeholder entry needs an official source.");
  if (entry.canonStatus === "invalid-homebrew") warnings.push("Invalid homebrew content detected.");
  return warnings;
}
