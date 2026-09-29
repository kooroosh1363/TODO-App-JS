# FocusQueue — Offline Task State Engine

FocusQueue modernizes the original 2023 JavaScript todo exercise into a dependency-free, offline-first task manager built around explicit state transitions and versioned browser persistence.

## What changed

The original interface exposed controls for filtering, completion, deletion, clearing, and drag-and-drop, but the JavaScript only appended new task text to `localStorage`. The list was not rendered from stored state, theme preference was not persisted, keyboard focus outlines were removed, and the README contained only two lines.

FocusQueue turns the exercise into a small state-management project instead of a static todo mockup.

## Features

- add tasks with priorities
- complete / reopen tasks
- delete individual tasks
- clear all completed tasks
- All / Active / Completed filters
- priority filtering
- title search
- accessible up/down reordering
- live task statistics
- System / Light / Dark themes
- versioned `localStorage` persistence
- safe fallback for corrupted stored data
- keyboard-visible focus states
- responsive layout
- reduced-motion support
- zero runtime dependencies

## Architecture

```text
task-store.js
  ├── task normalization
  ├── add / toggle / remove
  ├── filtering
  ├── reordering
  └── statistics

persistence.js
  ├── versioned task storage
  └── theme storage / resolution

scripts.js
  └── DOM orchestration + rendering
```

The core task logic is kept independent from the DOM so it can be tested directly.

## Local development

No package installation is required for the app itself.

Run any static server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Tests

```bash
npm test
```

Run the complete quality gate:

```bash
npm run check
```

The test suite covers state transitions, combined filters, bounded reordering, statistics, versioned persistence, corrupted-data recovery, and theme behavior.

## CI

Every pull request and push to `main` runs syntax checks and the Node test suite with GitHub Actions.

## GitHub Pages

Enable **Settings → Pages → Source → GitHub Actions**, then run **Actions → Deploy Pages → Run workflow**.

## Scope

FocusQueue is a local-only browser application. It does not sync tasks across devices, create user accounts, or send task data to a backend.

## License

MIT.
