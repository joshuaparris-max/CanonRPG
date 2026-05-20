import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SOURCE_BOOKS } from "@/data/sourceBooks";
import { formatPdfFileSize } from "@/game/pdf";
import { indexPdfFile } from "@/game/pdfImporter";
import type { ImportedPdfSource, SourceBookId } from "@/game/types";

interface PdfImportPanelProps {
  imports: ImportedPdfSource[];
  onImport: (imported: ImportedPdfSource) => void;
  onDelete: (id: string) => void;
}

function SourceBookSelect({ value, onChange }: { value: SourceBookId | ""; onChange: (value: SourceBookId | "") => void }) {
  return (
    <select className="w-full h-8 text-xs bg-muted border border-border rounded px-2" value={value} onChange={(event) => onChange(event.target.value as SourceBookId | "") }>
      <option value="">Select source book…</option>
      {SOURCE_BOOKS.map((book) => (
        <option key={book.id} value={book.id}>
          {book.shortTitle} — {book.title}
        </option>
      ))}
    </select>
  );
}

export function PdfImportPanel({ imports, onImport, onDelete }: PdfImportPanelProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sourceBookId, setSourceBookId] = useState<SourceBookId | "">("CM");

  const handleFile = async (file: File | null) => {
    if (!file) return;
    if (!sourceBookId) {
      setError("Select the source book that matches this PDF before importing.");
      return;
    }
    setError(null);
    setIsImporting(true);
    try {
      const { source } = await indexPdfFile(file, sourceBookId);
      onImport(source);
    } catch (e) {
      setError("Failed to read PDF file. Please try a different file.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="border-amber-800/40 mb-6">
      <CardHeader>
        <CardTitle className="text-base">Local PDF Import</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Import a local sourcebook PDF to keep a browser-only index of what you own. The PDF file is not uploaded anywhere; only metadata is stored locally.
        </p>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <SourceBookSelect value={sourceBookId} onChange={setSourceBookId} />
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90">
              {isImporting ? "Importing..." : "Choose PDF file"}
              <input
                type="file"
                accept="application/pdf"
                disabled={isImporting}
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
              />
            </label>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              Refresh list
            </Button>
          </div>
        </div>
        {error && <div className="text-xs text-destructive">{error}</div>}
        {imports.length > 0 && (
          <div className="space-y-2">
            {imports.map((entry) => (
              <div key={entry.id} className="rounded border border-border bg-muted p-3 text-sm">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-medium">{entry.fileName}</span>
                  <span className="text-xs text-muted-foreground">{formatPdfFileSize(entry.fileSize)}</span>
                  <span className="text-xs text-muted-foreground">Imported {new Date(entry.importedAt).toLocaleDateString()}</span>
                  <Button size="sm" variant="ghost" className="ml-auto" onClick={() => onDelete(entry.id)}>
                    Delete
                  </Button>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{entry.summary}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
