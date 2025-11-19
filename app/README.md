# Type Challenges UI

This is the Next.js web application for [TypeScript Type Challenges](https://github.com/type-challenges/type-challenges). It provides an interactive environment to solve type challenges directly in the browser with real-time feedback and local progress tracking.

This UI is a fork aiming for a more comfortable navigation and solving experience.

## Tech Stack

- **Framework**: Next.js (App Router, Static Export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Editor**: Monaco Editor
- **State/Persistence**: IndexedDB (for user progress & settings)

## Getting Started (Development)

This application is part of a larger monorepo.

1. **Install Monorepo Dependencies**:
    From the **root of the `type-challenges` repository**:

    ```bash
    pnpm install
    ```

2. **Start Development Server**:

    From the **`app` directory**:

    ```bash
    pnpm dev
    ```

    The app will be available at [http://localhost:3000](http://localhost:3000).
    (This command automatically synchronizes challenge data.)

## Build for Production (Static Export)

From the **`app` directory**:

```bash
pnpm build
```

This generates a static website in the `app/out/` directory, suitable for deployment on platforms like GitHub Pages, Vercel, or Netlify.

## Available Scripts

*   `pnpm dev`: Starts the development server and syncs challenge data.
*   `pnpm build`: Builds the static site and syncs challenge data.
*   `pnpm lint`: Runs ESLint for code quality.
*   `pnpm sync`: Synchronizes challenge data from the monorepo.