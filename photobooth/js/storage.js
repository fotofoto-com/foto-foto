// FOTO FOTO — storage.js (IndexedDB)
(function () {
  'use strict';
  const NAME = 'fotofoto', STORE = 'photos';
  const open = () => new Promise((res, rej) => {
    const r = indexedDB.open(NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const tx = async (mode, fn) => {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction(STORE, mode), q = fn(t.objectStore(STORE));
      t.oncomplete = () => res(q && q.result);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    });
  };
  window.FotoStore = {
    add: rec => tx('readwrite', s => s.add(rec)),
    all: () => tx('readonly', s => s.getAll()),
    remove: id => tx('readwrite', s => s.delete(id))
  };
})();
