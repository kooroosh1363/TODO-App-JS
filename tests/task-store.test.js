import test from "node:test";
import assert from "node:assert/strict";
import {
  addTask,
  clearCompleted,
  createInitialState,
  moveTask,
  removeTask,
  setFilter,
  setPriorityFilter,
  setQuery,
  taskStats,
  toggleTask,
  visibleTasks
} from "../assets/js/task-store.js";
import {
  loadState,
  loadTheme,
  resolveTheme,
  saveState,
  saveTheme
} from "../assets/js/persistence.js";

const sampleTasks = [
  { id:"1", title:"Review retry policy", priority:"high", completed:false, createdAt:1 },
  { id:"2", title:"Update README", priority:"low", completed:true, createdAt:2 },
  { id:"3", title:"Add keyboard tests", priority:"medium", completed:false, createdAt:3 }
];

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
    removeItem: (key) => map.delete(key)
  };
}

test("task state supports add, toggle, remove, and clear-completed", () => {
  let state=createInitialState(sampleTasks);
  state=toggleTask(state,"1");
  assert.equal(state.tasks[0].completed,true);

  state=addTask(state,{id:"4",title:"Ship release",priority:"high",completed:false,createdAt:4});
  assert.equal(state.tasks.length,4);

  state=removeTask(state,"3");
  assert.equal(state.tasks.some(task=>task.id==="3"),false);

  state=clearCompleted(state);
  assert.deepEqual(state.tasks.map(task=>task.id),["4"]);
});

test("filters combine status, priority, and query", () => {
  let state=createInitialState(sampleTasks);
  state=setFilter(state,"active");
  state=setPriorityFilter(state,"high");
  state=setQuery(state,"retry");

  assert.deepEqual(visibleTasks(state).map(task=>task.id),["1"]);
});

test("reordering is deterministic and bounded", () => {
  let state=createInitialState(sampleTasks);
  state=moveTask(state,"2","up");
  assert.deepEqual(state.tasks.map(task=>task.id),["2","1","3"]);

  const unchanged=moveTask(state,"2","up");
  assert.deepEqual(unchanged.tasks.map(task=>task.id),["2","1","3"]);
});

test("task stats remain consistent", () => {
  assert.deepEqual(taskStats(createInitialState(sampleTasks)),{
    total:3,
    completed:1,
    active:2
  });
});

test("versioned persistence round-trips valid task data", () => {
  const storage=memoryStorage();
  const state=createInitialState(sampleTasks);

  assert.equal(saveState(state,storage),true);
  assert.deepEqual(loadState(storage).tasks,state.tasks);
});

test("corrupted persisted state falls back safely", () => {
  const storage=memoryStorage();
  storage.setItem("focusqueue:state:v1","{broken-json");
  assert.deepEqual(loadState(storage).tasks,[]);
});

test("theme policy supports system, light, and dark", () => {
  const storage=memoryStorage();

  assert.equal(saveTheme("dark",storage),"dark");
  assert.equal(loadTheme(storage),"dark");
  assert.equal(resolveTheme("system",true),"dark");
  assert.equal(resolveTheme("system",false),"light");
});
