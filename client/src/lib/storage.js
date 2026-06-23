// ===========================================================================
// storage.js  —  tiny helpers to save/load data in the browser
// ---------------------------------------------------------------------------
// localStorage is a small built-in key/value box the browser keeps even after
// you close the tab. We use it so your expenses and "this influenced me" marks
// are still there when you come back. Everything stays on YOUR device.
// ===========================================================================

const PREFIX = "mindfulmoney:";

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // If storage is full or blocked, we just skip — the app still works.
  }
}
