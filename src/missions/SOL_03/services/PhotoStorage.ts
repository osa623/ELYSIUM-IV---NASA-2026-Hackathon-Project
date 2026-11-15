export interface Sol03PhotoRecord {
  id: string;
  timestamp: string;
  headingDegrees: number;
  pitchDegrees: number;
  direction: string;
  worldPosition: [number, number, number];
  dataUrl: string; // Base64 data URL stored in IndexedDB
  caption?: string;
  heading?: string;
}

const DB_NAME = "elysium_iv_db";
const STORE_NAME = "sol03_photos";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function savePhotoToStorage(photo: Sol03PhotoRecord): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(photo);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("[PhotoStorage] IndexedDB put failed, falling back to localStorage", e);
    try {
      const photos = getPhotosFromLocalStorage();
      const existingIdx = photos.findIndex(p => p.id === photo.id);
      if (existingIdx >= 0) photos[existingIdx] = photo;
      else photos.push(photo);
      localStorage.setItem("elysium_iv_sol03_photos_fallback", JSON.stringify(photos));
    } catch (err) {
      console.error("[PhotoStorage] Storage quota error", err);
    }
  }
}

export async function getPhotosFromStorage(): Promise<Sol03PhotoRecord[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return getPhotosFromLocalStorage();
  }
}

export async function deletePhotoFromStorage(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const photos = getPhotosFromLocalStorage().filter(p => p.id !== id);
    localStorage.setItem("elysium_iv_sol03_photos_fallback", JSON.stringify(photos));
  }
}

function getPhotosFromLocalStorage(): Sol03PhotoRecord[] {
  try {
    const raw = localStorage.getItem("elysium_iv_sol03_photos_fallback");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
