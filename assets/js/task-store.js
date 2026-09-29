export const FILTERS = Object.freeze(["all", "active", "completed"]);
export const PRIORITIES = Object.freeze(["low", "medium", "high"]);

export function createInitialState(tasks = []) {
  return {
    tasks: Array.isArray(tasks) ? tasks.map(normalizeTask).filter(Boolean) : [],
    filter: "all",
    query: "",
    priority: "all"
  };
}

export function normalizeTask(task) {
  if (!task || typeof task !== "object") return null;

  const id = String(task.id || "").trim();
  const title = String(task.title || "").trim().replace(/\s+/g, " ");
  const priority = PRIORITIES.includes(task.priority) ? task.priority : "medium";
  const completed = Boolean(task.completed);
  const createdAt = Number(task.createdAt) || Date.now();

  if (!id || !title || title.length > 120) return null;

  return { id, title, priority, completed, createdAt };
}

export function addTask(state, task) {
  const normalized = normalizeTask(task);
  if (!normalized) return state;
  return { ...state, tasks: [...state.tasks, normalized] };
}

export function toggleTask(state, id) {
  return {
    ...state,
    tasks: state.tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    )
  };
}

export function removeTask(state, id) {
  return { ...state, tasks: state.tasks.filter((task) => task.id !== id) };
}

export function clearCompleted(state) {
  return { ...state, tasks: state.tasks.filter((task) => !task.completed) };
}

export function moveTask(state, id, direction) {
  const index = state.tasks.findIndex((task) => task.id === id);
  if (index < 0) return state;

  const targetIndex = direction === "up" ? index - 1 : direction === "down" ? index + 1 : index;
  if (targetIndex < 0 || targetIndex >= state.tasks.length || targetIndex === index) return state;

  const tasks = [...state.tasks];
  [tasks[index], tasks[targetIndex]] = [tasks[targetIndex], tasks[index]];
  return { ...state, tasks };
}

export function setFilter(state, filter) {
  return { ...state, filter: FILTERS.includes(filter) ? filter : "all" };
}

export function setQuery(state, query) {
  return { ...state, query: String(query || "").slice(0, 120) };
}

export function setPriorityFilter(state, priority) {
  return {
    ...state,
    priority: priority === "all" || PRIORITIES.includes(priority) ? priority : "all"
  };
}

export function visibleTasks(state) {
  const query = state.query.trim().toLowerCase();

  return state.tasks.filter((task) => {
    const statusMatch =
      state.filter === "all" ||
      (state.filter === "active" && !task.completed) ||
      (state.filter === "completed" && task.completed);

    const priorityMatch = state.priority === "all" || task.priority === state.priority;
    const queryMatch = !query || task.title.toLowerCase().includes(query);

    return statusMatch && priorityMatch && queryMatch;
  });
}

export function taskStats(state) {
  const total = state.tasks.length;
  const completed = state.tasks.filter((task) => task.completed).length;
  return { total, completed, active: total - completed };
}
