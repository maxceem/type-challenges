# Type Challenges Web App

## Project Overview

This project is the web interface for the [TypeScript Type Challenges](https://github.com/type-challenges/type-challenges). It provides an interactive environment for users to solve TypeScript riddles directly in the browser, featuring real-time type checking, progress tracking, and a modern UI.

The application is built with **Next.js 16 (App Router)** and serves as a workspace member within the larger `type-challenges` monorepo.

## Tech Stack

*   **Framework:** Next.js 16 (App Router, Static Export)
*   **Language:** TypeScript 5.3
*   **Styling:** Tailwind CSS 4
*   **Editor:** Monaco Editor (via `@monaco-editor/react`)
    *   *Note: The project README references CodeMirror 6, but the codebase actually uses Monaco.*
*   **State/Persistence:** IndexedDB (via `idb`) for saving user progress locally.
*   **Build Tool:** Turbopack
*   **Package Manager:** pnpm (Workspace)

## Architecture

### Data Flow
1.  **Source of Truth:** The core challenge data resides in the root of the monorepo (outside this `app` directory).
2.  **Sync Process:** The `scripts/sync-challenges.ts` script reads raw challenge files (READMEs, tests, templates) from the workspace and aggregates them into a single manifest file: `data/challenges.json`.
3.  **Consumption:** The Next.js app reads `data/challenges.json` at build time (and runtime) to render the challenge list and details pages.

### Key Components
*   **`app/(main)/challenge/[id]/page.tsx`:** The core challenge view.
*   **`components/CodeEditor.tsx`:** Wraps Monaco Editor, configuring the in-browser TypeScript compiler with specific libs and settings to mimic the challenge environment.
*   **`lib/storage.ts` & `lib/indexeddb.ts`:** Manages user progress (completed/in-progress status, saved code) using the browser's IndexedDB.

## Building and Running

### Prerequisites
*   Node.js 20+
*   pnpm 8+

### Setup
Since this is part of a workspace, dependencies should generally be installed from the repo root.

```bash
# From the root of the type-challenges repo
pnpm install
```

### Development
To start the development server for the web app:

```bash
cd app
pnpm dev
```
*This command automatically runs `pnpm sync` before starting the Next.js server.*

### Building for Production
The app is designed to be exported as a static site.

```bash
cd app
pnpm build
```
Output will be generated in `app/out/`.

### Other Scripts
*   `pnpm sync`: Manually triggers the challenge data synchronization script.
*   `pnpm lint`: Runs ESLint.

## Directory Structure

*   **`app/`**: Next.js App Router pages and layouts.
*   **`components/`**: Reusable React components (UI, Editor, Layouts).
*   **`data/`**: Contains the generated `challenges.json` (do not edit manually).
*   **`lib/`**: Utility functions, storage logic, and editor context.
*   **`public/`**: Static assets (images, SVGs).
*   **`scripts/`**: Build and maintenance scripts (e.g., syncing challenges).
*   **`types/`**: TypeScript type definitions shared across the app.

## Development Conventions

*   **Styling:** Use Tailwind CSS utility classes.
*   **State Management:** React Context is used for global state like editor preferences and progress tracking.
*   **Type Checking:** The app relies on the browser-based TypeScript compiler (Monaco) for user code validation. Ensure `components/CodeEditor.tsx` configurations align with the expected challenge environment.
