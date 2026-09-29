import { createInitialState, normalizeTask } from "./task-store.js";

const STORAGE_KEY = "focusqueue:state:v1";
const THEME_KEY = "focusqueue:theme";

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();

    const parsed = JSON.parse(raw);
    const tasks = Array.isArray(parsed?.tasks)
      ? parsed.tasks.map(normalizeTask).filter(Boolean)
      : [];

    return createInitialState(tasks);
  } catch {
    return createInitialState();
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      tasks: state.tasks
    }));
    return true;
  } catch {
    return false;
  }
}

export function loadTheme(storage = globalThis.localStorage) {
  try {
    const value = storage?.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function saveTheme(theme, storage = globalThis.localStorage) {
  const normalized = ["system", "light", "dark"].includes(theme) ? theme : "system";
  try {
    storage?.setItem(THEME_KEY, normalized);
  } catch {
    // Persistence is optional.
  }
  return normalized;
}

export function resolveTheme(theme, prefersDark = false) {
  return theme === "system" ? (prefersDark ? "dark" : "light") : theme;
}
