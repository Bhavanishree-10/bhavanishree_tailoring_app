// BHAVANISHREE TAILORING SHOP — உள்ளூர் தரவுத்தள அடுக்கு (IndexedDB)
// அனைத்து வாடிக்கையாளர் தரவும் இணையம் இல்லாமல் இந்த சாதனத்திலேயே சேமிக்கப்படுகிறது.

const DB_NAME = 'bhavanishree_db';
const DB_VERSION = 2;

const STORES = {
  customers: 'customers',
  measurements: 'measurements',
  patterns: 'patterns',
  meta: 'meta'
};

let dbInstance = null;

function uid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains(STORES.customers)) {
        const s = db.createObjectStore(STORES.customers, { keyPath: 'id' });
        s.createIndex('name', 'name', { unique: false });
        s.createIndex('phone', 'phone', { unique: false });
        s.createIndex('pinned', 'pinned', { unique: false });
        s.createIndex('deleted', 'deleted', { unique: false });
        s.createIndex('updatedAt', 'updatedAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.measurements)) {
        const s = db.createObjectStore(STORES.measurements, { keyPath: 'id' });
        s.createIndex('customerId', 'customerId', { unique: false });
        s.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // "patterns" = உடல் அளவு (Body Measurements) tab's standalone pattern sheets.
      // Deliberately NOT linked to the customers store in any way — its own
      // independent database, per the tab being a fully standalone tool.
      if (!db.objectStoreNames.contains(STORES.patterns)) {
        const s = db.createObjectStore(STORES.patterns, { keyPath: 'id' });
        s.createIndex('createdAt', 'createdAt', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta, { keyPath: 'key' });
      }
    };

    req.onsuccess = (e) => {
      dbInstance = e.target.result;
      dbInstance.onversionchange = () => dbInstance.close();
      resolve(dbInstance);
    };
    req.onerror = () => reject(req.error);
  });
}

function tx(storeName, mode) {
  return openDb().then((db) => db.transaction(storeName, mode).objectStore(storeName));
}

function reqToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(storeName) {
  return tx(storeName, 'readonly').then((store) => reqToPromise(store.getAll()));
}

// ---------------- வாடிக்கையாளர்கள் (Customers) ----------------

const Customers = {
  async add(data) {
    const now = Date.now();
    const record = {
      id: uid(),
      name: (data.name || '').trim(),
      phone: (data.phone || '').trim(),
      model: data.model, // 'blouse' | 'chudithar'
      cuttingType: data.cuttingType || null, // 'neer' | 'cross' — பிளவுஸ் மாடலுக்கு மட்டும்
      notes: data.notes || '',
      pinned: false,
      deleted: false,
      createdAt: now,
      updatedAt: now
    };
    const store = await tx(STORES.customers, 'readwrite');
    await reqToPromise(store.add(record));
    return record;
  },

  async update(id, changes) {
    const store = await tx(STORES.customers, 'readwrite');
    const existing = await reqToPromise(store.get(id));
    if (!existing) throw new Error('customer-not-found');
    const updated = { ...existing, ...changes, id, updatedAt: Date.now() };
    await reqToPromise(store.put(updated));
    return updated;
  },

  async get(id) {
    const store = await tx(STORES.customers, 'readonly');
    return reqToPromise(store.get(id));
  },

  async getAll({ includeDeleted = false } = {}) {
    const all = await getAllFromStore(STORES.customers);
    return includeDeleted ? all : all.filter((c) => !c.deleted);
  },

  async setPinned(id, pinned) {
    return this.update(id, { pinned: !!pinned });
  },

  async softDelete(id) {
    return this.update(id, { deleted: true, deletedAt: Date.now() });
  },

  async restore(id) {
    return this.update(id, { deleted: false, deletedAt: null });
  },

  async hardDelete(id) {
    const store = await tx(STORES.customers, 'readwrite');
    await reqToPromise(store.delete(id));
  },

  async search(query) {
    const all = await this.getAll();
    const q = (query || '').trim().toLowerCase();
    if (!q) return all;
    return all.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
  },

  async pinnedList() {
    const all = await this.getAll();
    return all.filter((c) => c.pinned).sort((a, b) => b.updatedAt - a.updatedAt);
  },

  async recentList(limit = 8) {
    const all = await this.getAll();
    return all.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
  }
};

// ---------------- அளவுகள் (Measurements) ----------------

const Measurements = {
  async add(customerId, model, fields) {
    const record = {
      id: uid(),
      customerId,
      model,
      fields, // { fieldKey: numberOrString }
      createdAt: Date.now()
    };
    const store = await tx(STORES.measurements, 'readwrite');
    await reqToPromise(store.add(record));
    return record;
  },

  async getByCustomer(customerId) {
    const store = await tx(STORES.measurements, 'readonly');
    const idx = store.index('customerId');
    const all = await reqToPromise(idx.getAll(customerId));
    return all.sort((a, b) => b.createdAt - a.createdAt);
  },

  async getLatest(customerId) {
    const list = await this.getByCustomer(customerId);
    return list.length ? list[0] : null;
  },

  async get(id) {
    const store = await tx(STORES.measurements, 'readonly');
    return reqToPromise(store.get(id));
  },

  async remove(id) {
    const store = await tx(STORES.measurements, 'readwrite');
    await reqToPromise(store.delete(id));
  }
};

// ---------------- உடல் அளவு பேட்டர்ன் (Standalone Body-Measurement Patterns) ----------------
// Fully independent of the Customers/Measurements stores above — no customerId,
// no link. Each record is just a name-if-you-want-it label + the 14 raw body
// measurements + when it was made.

const Patterns = {
  async add(label, fields) {
    const record = {
      id: uid(),
      label: (label || '').trim(),
      fields, // { backLength, fullChest, upperChest, lowerBust, waist, shoulder, ... }
      deleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const store = await tx(STORES.patterns, 'readwrite');
    await reqToPromise(store.add(record));
    return record;
  },

  async update(id, label, fields) {
    const store = await tx(STORES.patterns, 'readwrite');
    const existing = await reqToPromise(store.get(id));
    if (!existing) throw new Error('pattern-not-found');
    const updated = { ...existing, label: (label || '').trim(), fields, updatedAt: Date.now() };
    await reqToPromise(store.put(updated));
    return updated;
  },

  async get(id) {
    const store = await tx(STORES.patterns, 'readonly');
    return reqToPromise(store.get(id));
  },

  async getAll({ includeDeleted = false } = {}) {
    const all = await getAllFromStore(STORES.patterns);
    const filtered = includeDeleted ? all : all.filter((p) => !p.deleted);
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  },

  async search(query) {
    const all = await this.getAll();
    const q = (query || '').trim().toLowerCase();
    if (!q) return all;
    return all.filter((p) => (p.label || '').toLowerCase().includes(q));
  },

  async softDelete(id) {
    const store = await tx(STORES.patterns, 'readwrite');
    const existing = await reqToPromise(store.get(id));
    if (!existing) throw new Error('pattern-not-found');
    const updated = { ...existing, deleted: true, deletedAt: Date.now() };
    await reqToPromise(store.put(updated));
    return updated;
  },

  async restore(id) {
    const store = await tx(STORES.patterns, 'readwrite');
    const existing = await reqToPromise(store.get(id));
    if (!existing) throw new Error('pattern-not-found');
    const updated = { ...existing, deleted: false, deletedAt: null };
    await reqToPromise(store.put(updated));
    return updated;
  },

  async hardDelete(id) {
    const store = await tx(STORES.patterns, 'readwrite');
    await reqToPromise(store.delete(id));
  },

  // Kept as an alias in case anything else calls remove() — now soft-deletes
  // instead of permanently destroying the record.
  async remove(id) {
    return this.softDelete(id);
  }
};

// ---------------- காப்புப்பிரதி (Backup / Restore) ----------------

const Backup = {
  async exportAll() {
    const [customers, measurements, patterns] = await Promise.all([
      getAllFromStore(STORES.customers),
      getAllFromStore(STORES.measurements),
      getAllFromStore(STORES.patterns)
    ]);
    return {
      app: 'bhavanishree-tailoring-shop',
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
      data: { customers, measurements, patterns }
    };
  },

  // merge = true: add to existing data, keeping both (ids are unique so no collision).
  // merge = false: wipe existing data first, then load backup exactly.
  async importAll(payload, { merge = false } = {}) {
    if (!payload || !payload.data || !Array.isArray(payload.data.customers)) {
      throw new Error('invalid-backup-file');
    }
    const db = await openDb();
    const storeNames = [STORES.customers, STORES.measurements, STORES.patterns];
    const transaction = db.transaction(storeNames, 'readwrite');

    if (!merge) {
      storeNames.forEach((name) => transaction.objectStore(name).clear());
    }

    const put = (storeName, record) => transaction.objectStore(storeName).put(record);

    (payload.data.customers || []).forEach((c) => put(STORES.customers, c));
    (payload.data.measurements || []).forEach((m) => put(STORES.measurements, m));
    (payload.data.patterns || []).forEach((p) => put(STORES.patterns, p));

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  },

  async wipeAll() {
    const db = await openDb();
    const storeNames = [STORES.customers, STORES.measurements, STORES.patterns];
    const transaction = db.transaction(storeNames, 'readwrite');
    storeNames.forEach((name) => transaction.objectStore(name).clear());
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  }
};

window.DB = { openDb, Customers, Measurements, Patterns, Backup, uid };