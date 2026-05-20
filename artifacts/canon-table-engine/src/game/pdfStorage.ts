import type { ImportedPdfSource, ImportedPdfIndex } from "./types";

const DB_NAME = "canon-table-engine-pdf";
const DB_VERSION = 1;
const STORE_SOURCES = "pdfSources";
const STORE_INDEXES = "pdfIndexes";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_SOURCES)) {
        db.createObjectStore(STORE_SOURCES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_INDEXES)) {
        db.createObjectStore(STORE_INDEXES, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("IndexedDB transaction aborted"));
  });
}

export async function saveImportedPdfSource(source: ImportedPdfSource): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_SOURCES, "readwrite");
  requestToPromise(tx.objectStore(STORE_SOURCES).put(source));
  return transactionComplete(tx);
}

export async function saveImportedPdfIndex(index: ImportedPdfIndex): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_INDEXES, "readwrite");
  requestToPromise(tx.objectStore(STORE_INDEXES).put(index));
  return transactionComplete(tx);
}

export async function loadAllImportedPdfSources(): Promise<ImportedPdfSource[]> {
  const db = await openDb();
  const tx = db.transaction(STORE_SOURCES, "readonly");
  const request = tx.objectStore(STORE_SOURCES).getAll();
  return requestToPromise(request);
}

export async function loadAllPdfIndexes(): Promise<ImportedPdfIndex[]> {
  const db = await openDb();
  const tx = db.transaction(STORE_INDEXES, "readonly");
  const request = tx.objectStore(STORE_INDEXES).getAll();
  return requestToPromise(request);
}

export async function getPdfIndexById(id: string): Promise<ImportedPdfIndex | undefined> {
  const db = await openDb();
  const tx = db.transaction(STORE_INDEXES, "readonly");
  const request = tx.objectStore(STORE_INDEXES).get(id);
  return requestToPromise(request);
}

export async function deleteImportedPdf(id: string): Promise<void> {
  const db = await openDb();
  const tx1 = db.transaction(STORE_SOURCES, "readwrite");
  const tx2 = db.transaction(STORE_INDEXES, "readwrite");
  requestToPromise(tx1.objectStore(STORE_SOURCES).delete(id));
  requestToPromise(tx2.objectStore(STORE_INDEXES).delete(id));
  await Promise.all([transactionComplete(tx1), transactionComplete(tx2)]);
}
