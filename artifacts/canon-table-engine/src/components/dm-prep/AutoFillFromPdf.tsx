import { useEffect, useMemo, useState } from "react";
import type { Adventure, AdventureNode } from "@/data/adventureSkeletons";
import type { NodeOverride } from "@/types";
import type { ImportedPdfIndex } from "@/game/types";
import { loadAllPdfIndexes } from "@/game/pdfStorage";
import { generateAutoPrepSuggestions } from "@/game/adventureAutoPrep";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Sparkles, Check } from "lucide-react";

interface AutoFillFromPdfProps {
  adventure: Adventure | undefined;
  node: AdventureNode | undefined;
  override: NodeOverride | null;
  onApply: (updates: Partial<NodeOverride>) => void;
}

export function AutoFillFromPdf({ adventure, node, override, onApply }: AutoFillFromPdfProps) {
  const [indexes, setIndexes] = useState<ImportedPdfIndex[]>([]);
  const [suggestions, setSuggestions] = useState<ReturnType<typeof generateAutoPrepSuggestions>>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadAllPdfIndexes().then(setIndexes).catch(() => setIndexes([]));
  }, []);

  const canSuggest = !!adventure && !!node && !!override && indexes.length > 0;

  const computedSuggestions = useMemo(() => {
    if (!canSuggest || !adventure || !node || !override) return [];
    return generateAutoPrepSuggestions(adventure, node, override, indexes);
  }, [adventure, node, override, indexes, canSuggest]);

  const handleSuggest = () => {
    if (!canSuggest) {
      setMessage(indexes.length === 0 ? "Import a PDF first to generate suggestions." : "Select an adventure and node first.");
      return;
    }
    setSuggestions(computedSuggestions);
    setMessage(computedSuggestions.length === 0 ? "No strong auto-fill suggestions found." : null);
  };

  const handleApply = () => {
    if (!override) {
      setMessage("No active node selected to apply suggestions.");
      return;
    }
    const updates: Partial<NodeOverride> = {};
    suggestions.forEach((suggestion) => {
      if (suggestion.fieldName in override) {
        updates[suggestion.fieldName as keyof NodeOverride] = suggestion.suggestedValue as any;
      }
    });
    onApply(updates);
    setMessage("Applied suggested fields to this node.");
  };

  return (
    <Card className="border-amber-800/40 mb-4">
      <CardHeader>
        <CardTitle className="text-base">Auto-Fill from Imported PDFs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Use locally imported official PDFs to suggest page references, chapter headings, keyed areas, and safe DM summary prompts.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleSuggest} disabled={!canSuggest}>
            <Sparkles size={14} className="mr-1" /> Generate Suggestions
          </Button>
          <Button size="sm" variant="outline" onClick={handleApply} disabled={suggestions.length === 0}>
            <Check size={14} className="mr-1" /> Apply Suggestions
          </Button>
        </div>
        {message && <div className="text-xs text-amber-300">{message}</div>}
        {indexes.length > 0 && (
          <div className="text-xs text-muted-foreground">Imported PDFs: {indexes.length}</div>
        )}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="rounded border border-border p-2 bg-muted text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="text-[10px] bg-blue-900/40 text-blue-200 border-blue-700">{suggestion.fieldName}</Badge>
                  <span>{suggestion.reason}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="font-medium">Current</div>
                    <div className="text-muted-foreground break-words">{suggestion.currentValue || "(empty)"}</div>
                  </div>
                  <div>
                    <div className="font-medium">Suggested</div>
                    <div className="text-muted-foreground break-words">{suggestion.suggestedValue}</div>
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Source: {suggestion.sourceFile || "generated"} {suggestion.pageRef ? `| p.${suggestion.pageRef}` : ""} | Confidence: {suggestion.confidence}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
