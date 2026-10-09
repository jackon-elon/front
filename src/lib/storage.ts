import { snapshotSchema, type Snapshot } from "../../shared/schema";
const database = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("agentlens", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("snapshots");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
export async function loadImport(): Promise<Snapshot | null> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const req = db
        .transaction("snapshots")
        .objectStore("snapshots")
        .get("import");
      req.onsuccess = () => {
        const parsed = snapshotSchema.safeParse(req.result);
        resolve(parsed.success ? parsed.data : null);
      };
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}
export async function saveImport(snapshot: Snapshot) {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("snapshots", "readwrite");
      transaction.objectStore("snapshots").put(snapshot, "import");
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}
export function readSetting<T>(key: string, fallback: T): T {
  try {
    const text = localStorage.getItem(`agentlens:${key}`);
    return text ? (JSON.parse(text) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function saveSetting(key: string, value: unknown) {
  localStorage.setItem(`agentlens:${key}`, JSON.stringify(value));
}
