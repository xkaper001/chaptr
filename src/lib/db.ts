import { RecentDirectory } from "../types";

const DB_NAME = "chaptr_directory_handles_db";
const STORE_NAME = "directory_handles";
const DB_VERSION = 1;

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Store a file system handle in IndexedDB
export async function saveDirectoryHandle(id: string, handle: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(handle, id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB failed to save handle:", err);
  }
}

// Retrieve a single file system handle from IndexedDB
export async function getDirectoryHandle(id: string): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB failed to retrieve handle:", err);
    return null;
  }
}

// Delete a handle
export async function deleteDirectoryHandle(id: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("IndexedDB failed to delete handle:", err);
  }
}

// Manage Recent Directories list in LocalStorage
export function getRecentDirectoriesList(): RecentDirectory[] {
  try {
    const raw = localStorage.getItem("chaptr_recent_directories");
    if (!raw) return [];
    return JSON.parse(raw) as RecentDirectory[];
  } catch {
    return [];
  }
}

export function saveRecentDirectoryItem(item: RecentDirectory): void {
  try {
    const list = getRecentDirectoriesList();
    const filtered = list.filter(i => i.id !== item.id);
    const updated = [item, ...filtered].slice(0, 8); // Keep up to 8 recents
    localStorage.setItem("chaptr_recent_directories", JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save recent directory index", err);
  }
}

export function removeRecentDirectoryItem(id: string): void {
  try {
    const list = getRecentDirectoriesList();
    const updated = list.filter(i => i.id !== id);
    localStorage.setItem("chaptr_recent_directories", JSON.stringify(updated));
    deleteDirectoryHandle(id);
  } catch (err) {
    console.error("Failed to remove recent item", err);
  }
}
