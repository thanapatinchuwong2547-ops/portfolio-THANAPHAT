// Native IndexedDB Manager for Thanaphat Portfolio
// Enables storing videos, audio clips, custom fonts, images, and documents without size limits

const DB_NAME = "ThanaphatPortfolioDB";
const DB_VERSION = 1;
const STORE_NAME = "uploaded_assets";

class AssetDB {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("category", "category", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error("IndexedDB open error:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  // Save an uploaded file
  async saveAsset(file, category = "general", customId = null) {
    const db = await this.ensureDB();
    const id = customId || `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async () => {
        const record = {
          id: id,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          category: category, // "image" | "video" | "audio" | "font" | "document"
          createdAt: new Date().toISOString(),
          data: reader.result // Data URL (base64)
        };

        const tx = db.transaction([STORE_NAME], "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(record);

        req.onsuccess = () => resolve(record);
        req.onerror = (e) => reject(e.target.error);
      };

      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  // Retrieve an asset by ID
  async getAsset(id) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // Retrieve all assets or filter by category
  async getAllAssets(categoryFilter = null) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        let results = req.result || [];
        if (categoryFilter) {
          results = results.filter(item => item.category === categoryFilter);
        }
        resolve(results);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // Delete an asset
  async deleteAsset(id) {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  // Clear all assets
  async clearAll() {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  }
}

window.assetDB = new AssetDB();