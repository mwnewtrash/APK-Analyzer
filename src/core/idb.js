// core/idb.js — HAND-MAINTAINED. Tiny promise wrapper around IndexedDB.
// Shared by scan history and interrupt-resume checkpoints. All failures
// surface as rejections — callers decide how to degrade. No DOM at import.
export function openDb(name, store, version = 1) {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(name, version);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(store)) {
          req.result.createObjectStore(store, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

function run(dbName, store, mode, op) {
  return openDb(dbName, store).then(
    (db) =>
      new Promise((resolve, reject) => {
        let req;
        try {
          req = op(db.transaction(store, mode).objectStore(store));
        } catch (e) {
          try { db.close(); } catch {}
          reject(e);
          return;
        }
        req.onsuccess = () => {
          const v = req.result;
          try { db.close(); } catch {}
          resolve(v);
        };
        req.onerror = () => {
          try { db.close(); } catch {}
          reject(req.error);
        };
      }),
  );
}

export const idbPut = (db, store, rec) => run(db, store, 'readwrite', (s) => s.put(rec));
export const idbGet = (db, store, id) => run(db, store, 'readonly', (s) => s.get(id));
export const idbAll = (db, store) => run(db, store, 'readonly', (s) => s.getAll());
export const idbDel = (db, store, id) => run(db, store, 'readwrite', (s) => s.delete(id));
