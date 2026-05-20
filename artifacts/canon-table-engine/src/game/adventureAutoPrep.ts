import type { Adventure, AdventureNode } from "@/data/adventureSkeletons";
import type { AutoPrepSuggestion, ImportedPdfIndex } from "./types";
import type { NodeOverride } from "@/types";

function titleTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(" ")
    .filter((token) => token.length > 3);
}

function scorePageMatch(node: AdventureNode, page: ImportedPdfIndex["pageIndex"][number]): number {
  const tokens = titleTokens(node.label + " " + node.description);
  let score = 0;
  for (const token of tokens) {
    if (page.snippet.toLowerCase().includes(token)) score += 1;
    for (const heading of page.headings) {
      if (heading.toLowerCase().includes(token)) score += 2;
    }
  }
  return score;
}

export function generateAutoPrepSuggestions(
  adventure: Adventure,
  node: AdventureNode,
  override: NodeOverride,
  pdfIndexes: ImportedPdfIndex[],
): AutoPrepSuggestion[] {
  const suggestions: AutoPrepSuggestion[] = [];
  const searchText = `${node.label} ${node.description}`.toLowerCase();
  const scoredPages = pdfIndexes
    .flatMap((index) =>
      index.pageIndex.map((page) => ({ index, page, score: scorePageMatch(node, page) }))
    )
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = scoredPages[0];
  if (best) {
    const printedPage = best.page.printedPageRef || String(best.page.pdfPageIndex);
    if (!override.pageRef) {
      suggestions.push({
        fieldName: "pageRef",
        currentValue: override.pageRef,
        suggestedValue: printedPage,
        sourceFile: best.index.fileName,
        sourceBook: best.index.sourceBook,
        pageRef: printedPage,
        confidence: best.score >= 3 ? "high" : "medium",
        reason: `Matched node label to page ${printedPage} in ${best.index.fileName}.`,
      });
    }
    if (!override.chapter && best.page.headings.length > 0) {
      suggestions.push({
        fieldName: "chapter",
        currentValue: override.chapter,
        suggestedValue: best.page.headings[0],
        sourceFile: best.index.fileName,
        sourceBook: best.index.sourceBook,
        pageRef: printedPage,
        confidence: "medium",
        reason: `Suggested chapter from heading detected on page ${printedPage}.`,
      });
    }
    if (!override.keyedArea) {
      const keyed = best.page.headings.find((heading) => /Area\s+\d+/i.test(heading));
      if (keyed) {
        suggestions.push({
          fieldName: "keyedArea",
          currentValue: override.keyedArea,
          suggestedValue: keyed,
          sourceFile: best.index.fileName,
          sourceBook: best.index.sourceBook,
          pageRef: printedPage,
          confidence: "medium",
          reason: `Detected keyed area heading on page ${printedPage}.`,
        });
      }
    }
    if (!override.playerSafeSummary) {
      suggestions.push({
        fieldName: "playerSafeSummary",
        currentValue: override.playerSafeSummary,
        suggestedValue: `Run the official scene from ${best.index.sourceBook} page ${printedPage}.`,
        sourceFile: best.index.fileName,
        sourceBook: best.index.sourceBook,
        pageRef: printedPage,
        confidence: "high",
        reason: `Generated safe summary from the detected page reference.`,
      });
    }
  }

  if (!override.dmPrivateNote) {
    suggestions.push({
      fieldName: "dmPrivateNote",
      currentValue: override.dmPrivateNote,
      suggestedValue: "Use your official book notes to flesh this out. Keep private prep local-only.",
      sourceFile: "",
      sourceBook: "",
      pageRef: "",
      confidence: "low",
      reason: "Add a private note reminder for the DM.",
    });
  }

  const applyable = suggestions.filter((s) => s.fieldName !== "dmPrivateNote" || s.confidence !== "low");
  return suggestions;
}
