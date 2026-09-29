import {
  addTask,
  clearCompleted,
  moveTask,
  removeTask,
  setFilter,
  setPriorityFilter,
  setQuery,
  taskStats,
  toggleTask,
  visibleTasks
} from "./task-store.js";
import {
  loadState,
  loadTheme,
  resolveTheme,
  saveState,
  saveTheme
} from "./persistence.js";

let state = loadState();
let themePreference = loadTheme();

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const priorityInput = document.querySelector("#task-priority");
const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#task-search");
const priorityFilter = document.querySelector("#priority-filter");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const clearCompletedButton = document.querySelector("#clear-completed");
const activeCount = document.querySelector("#active-count");
const totalCount = document.querySelector("#total-count");
const completedCount = document.querySelector("#completed-count");
const themeSelect = document.querySelector("#theme-select");
const statusRegion = document.querySelector("#status-region");

function announce(message) {
  statusRegion.textContent = "";
  requestAnimationFrame(() => {
    statusRegion.textContent = message;
  });
}

function persistAndRender(message = "") {
  saveState(state);
  render();
  if (message) announce(message);
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-card${task.completed ? " is-complete" : ""}`;

  const toggleLabel = document.createElement("label");
  toggleLabel.className = "task-check";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.setAttribute("aria-label", `Mark ${task.title} as ${task.completed ? "active" : "completed"}`);
  checkbox.addEventListener("change", () => {
    state = toggleTask(state, task.id);
    persistAndRender(task.completed ? "Task reopened." : "Task completed.");
  });
  const checkMark = document.createElement("span");
  checkMark.setAttribute("aria-hidden", "true");
  toggleLabel.append(checkbox, checkMark);

  const content = document.createElement("div");
  content.className = "task-content";

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const priority = document.createElement("span");
  priority.className = `priority-badge priority-${task.priority}`;
  priority.textContent = task.priority;

  const status = document.createElement("span");
  status.textContent = task.completed ? "Completed" : "Active";

  meta.append(priority, status);
  content.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const up = actionButton("↑", "Move task up", () => {
    state = moveTask(state, task.id, "up");
    persistAndRender("Task moved up.");
  });

  const down = actionButton("↓", "Move task down", () => {
    state = moveTask(state, task.id, "down");
    persistAndRender("Task moved down.");
  });

  const remove = actionButton("Delete", `Delete ${task.title}`, () => {
    state = removeTask(state, task.id);
    persistAndRender("Task deleted.");
  });
  remove.classList.add("danger-action");

  actions.append(up, down, remove);
  item.append(toggleLabel, content, actions);
  return item;
}

function actionButton(text, label, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "task-action";
  button.textContent = text;
  button.setAttribute("aria-label", label);
  button.addEventListener("click", handler);
  return button;
}

function render() {
  const tasks = visibleTasks(state);
  const stats = taskStats(state);

  taskList.replaceChildren(...tasks.map(createTaskElement));
  emptyState.hidden = tasks.length !== 0;

  activeCount.textContent = String(stats.active);
  completedCount.textContent = String(stats.completed);
  totalCount.textContent = String(stats.total);

  filterButtons.forEach((button) => {
    const selected = button.dataset.filter === state.filter;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });

  priorityFilter.value = state.priority;
  clearCompletedButton.disabled = stats.completed === 0;
}

function applyTheme() {
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  const resolved = resolveTheme(themePreference, Boolean(media?.matches));
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  themeSelect.value = themePreference;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim().replace(/\s+/g, " ");
  if (!title) {
    announce("Enter a task before adding it.");
    titleInput.focus();
    return;
  }

  const task = {
    id: globalThis.crypto?.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    priority: priorityInput.value,
    completed: false,
    createdAt: Date.now()
  };

  state = addTask(state, task);
  titleInput.value = "";
  priorityInput.value = "medium";
  persistAndRender("Task added.");
  titleInput.focus();
});

searchInput.addEventListener("input", () => {
  state = setQuery(state, searchInput.value);
  render();
});

priorityFilter.addEventListener("change", () => {
  state = setPriorityFilter(state, priorityFilter.value);
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state = setFilter(state, button.dataset.filter);
    render();
  });
});

clearCompletedButton.addEventListener("click", () => {
  state = clearCompleted(state);
  persistAndRender("Completed tasks cleared.");
});

themeSelect.addEventListener("change", () => {
  themePreference = saveTheme(themeSelect.value);
  applyTheme();
});

const themeMedia = window.matchMedia?.("(prefers-color-scheme: dark)");
themeMedia?.addEventListener?.("change", () => {
  if (themePreference === "system") applyTheme();
});

applyTheme();
render();
