/**
 * Draf pengisian profil yang disimpan di perangkat (localStorage untuk isian, IndexedDB untuk file),
 * agar kandidat tidak perlu mengulang dari awal saat koneksi putus, halaman ter-refresh, atau tab tertutup.
 * Dihapus saat profil berhasil dikirim atau saat logout.
 */
const PREFIX = 'sarinahOnboardingDraft:';
const DB = 'sarinahOnboardingDraft';
const MAX_AGE_MS = 30 * 24 * 3600 * 1000;

export interface DraftFiles {
  cv: File | null;
  picture: File | null;
  portfolio: File[];
  docs: { key: string; file: File }[];
}

export interface DraftData {
  savedAt: number;
  step: number;
  profile: any;
  details: any;
  portfolioLinks: { title: string; url: string }[];
}

export class OnboardingDraft {
  private readonly key: string;

  constructor(owner: string) {
    this.key = PREFIX + (owner || 'anon').toLowerCase();
  }

  load(): DraftData | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const data = JSON.parse(raw) as DraftData;
      if (!data?.profile || Date.now() - data.savedAt > MAX_AGE_MS) { this.clear(); return null; }
      return data;
    } catch { return null; }
  }

  save(data: Omit<DraftData, 'savedAt'>): boolean {
    try { localStorage.setItem(this.key, JSON.stringify({ ...data, savedAt: Date.now() })); return true; } catch { return false; }
  }

  async saveFiles(files: DraftFiles): Promise<void> {
    try {
      const db = await open();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put(files, this.key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch { /* penyimpanan file opsional; isian teks tetap aman */ }
  }

  async loadFiles(): Promise<DraftFiles | null> {
    try {
      const db = await open();
      const result = await new Promise<DraftFiles | null>((resolve, reject) => {
        const req = db.transaction('files').objectStore('files').get(this.key);
        req.onsuccess = () => resolve((req.result as DraftFiles) || null);
        req.onerror = () => reject(req.error);
      });
      db.close();
      return result;
    } catch { return null; }
  }

  clear(): void {
    try { localStorage.removeItem(this.key); } catch { /* abaikan */ }
    open().then((db) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').delete(this.key); tx.oncomplete = () => db.close(); }).catch(() => undefined);
  }

  /** Hapus semua draf di perangkat (dipakai saat logout agar data tidak tertinggal di komputer bersama). */
  static clearAll(): void {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
    } catch { /* abaikan */ }
    try { indexedDB.deleteDatabase(DB); } catch { /* abaikan */ }
  }
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('files');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
