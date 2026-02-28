// ===== IndexedDB Setup =====
const DB_NAME = "BridgeAbleDB";
const DB_VERSION = 2;

let db;

// Open database
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("DB failed to open");

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("DB connected");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      // Users store (auth)
      if (!db.objectStoreNames.contains("users")) {
      // key: "email::role"
        const store = db.createObjectStore("users", { keyPath: "id" });
        store.createIndex("email", "email", { unique: false });
        store.createIndex("role", "role", { unique: false });
      }

      // Settings store
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }

      // Progress store
      if (!db.objectStoreNames.contains("progress")) {
        db.createObjectStore("progress", { keyPath: "lessonKey" });
      }

      // Sessions store (focus timer history)
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions", { autoIncrement: true }); 
      }
      // inside your onupgradeneeded:
      // ✅ Lessons store
      if (!db.objectStoreNames.contains("lessons")) {
        const store = db.createObjectStore("lessons", { keyPath: "lessonKey" });
        store.createIndex("title", "title", { unique: false });
      }
    };
  });
}

// ===== SETTINGS =====
function saveSetting(key, value) {
  const tx = db.transaction("settings", "readwrite");
  const store = tx.objectStore("settings");
  store.put({ key, value });
}

function getSetting(key) {
  return new Promise((resolve) => {
    const tx = db.transaction("settings", "readonly");
    const store = tx.objectStore("settings");
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result ? request.result.value : null);
    };
  });
}

// ===== PROGRESS =====
function saveProgress(lessonKey, completed) {
  const tx = db.transaction("progress", "readwrite");
  const store = tx.objectStore("progress");
  store.put({ lessonKey, completed, updatedAt: Date.now() });
}

function getProgress(lessonKey) {
  return new Promise((resolve) => {
    const tx = db.transaction("progress", "readonly");
    const store = tx.objectStore("progress");
    const request = store.get(lessonKey);

    request.onsuccess = () => {
      resolve(request.result || null);
    };
  });
}

// ===== FOCUS SESSION =====
function saveSession(durationMinutes) {
  const tx = db.transaction("sessions", "readwrite");
  const store = tx.objectStore("sessions");
  store.add({
    durationMinutes,
    completedAt: Date.now()
  });
}

// ===== GET ALL PROGRESS =====
function getAllProgress() {
  return new Promise((resolve) => {
    const tx = db.transaction("progress", "readonly");
    const store = tx.objectStore("progress");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
  });
}

// ===== GET ALL SESSIONS =====
function getAllSessions() {
  return new Promise((resolve) => {
    const tx = db.transaction("sessions", "readonly");
    const store = tx.objectStore("sessions");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
  });
}

function addOrUpdateLesson(lesson) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("lessons", "readwrite");
    const store = tx.objectStore("lessons");
    store.put(lesson);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

function getAllLessonsDB() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("lessons", "readonly");
    const store = tx.objectStore("lessons");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function getLessonDB(lessonKey) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("lessons", "readonly");
    const store = tx.objectStore("lessons");   // ✅ FIX
    const req = store.get(lessonKey);

    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function seedLessonsIfEmpty(seedLessons) {
  const existing = await getAllLessonsDB();
  if (existing.length > 0) return;

  for (const lesson of seedLessons) {
    await addOrUpdateLesson(lesson);
  }
}


function tx(storeName, mode = "readonly") {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

// ===== LESSONS API =====
async function upsertLesson(lesson) {
  await initDB();
  return new Promise((resolve, reject) => {
    const store = tx("lessons", "readwrite");
    const req = store.put(lesson);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

async function getLesson(lessonKey) {
  await initDB();
  return new Promise((resolve, reject) => {
    const store = tx("lessons", "readonly");
    const req = store.get(lessonKey);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function getAllLessons() {
  await initDB();
  return new Promise((resolve, reject) => {
    const store = tx("lessons", "readonly");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}