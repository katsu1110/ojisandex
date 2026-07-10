# Guidelines for AI Agents (AGENTS.md)

This document provides context and guidelines for AI coding agents maintaining, extending, or debugging the "おじさんアンチパターン集" (Ojisan Anti-pattern Collection) repository.

## Architecture & Responsibilities

The application is split into two distinct parts:
1. **Content Generation (Backend/Scripts)**: Node.js scripts connect to the Google Gemini API to produce JSON data and images.
2. **Frontend Presentation**: A static Vite-based website that fetches the JSON file and displays it.

There is no traditional backend server at runtime. The data is pre-generated and served statically.

### 1. Data Structure (`public/data/entries.json`)
This is the single source of truth for the encyclopedia. It contains an array of objects.
When maintaining data:
- Ensure uniqueness of `id` and `title_ja`.
- The `image` property points to a local file in `public/images/`.

### 2. Frontend (`src/`)
- Framework: strictly **Vanilla JavaScript** (no React, Vue, etc.).
- Styling: Plain CSS (`src/style.css`).
- Logic: `src/main.js` fetches `${base}data/entries.json` (via `import.meta.env.BASE_URL`) dynamically at runtime.
- **Note on Base URL**: The project is configured to use the root (`/`) as the base URL in `vite.config.js`. This is optimized for hosting on **Vercel** (`ojisandex.vercel.app`), which handles the actual deployment.

### 3. Scripts (`scripts/`)
- Use `@google/generative-ai` SDK.
- Text generation: Uses `gemini-2.5-flash` or `gemini-2.0-flash`. Returns strictly formatted JSON.
- Image generation: `gemini-2.0-flash-exp`. The script extracts base64 image data and writes it to `public/images/`.
- Entry points:
  - `npm run generate`: Triggers `scripts/generate-entry.js` (generates one entry).
  - `npm run generate:initial`: Triggers `scripts/generate-initial.js` (batch generation).
  - `node scripts/backfill-images.js`: Generates missing images for existing entries.

### 4. CI/CD (`.github/workflows/`)
- `daily-generate.yml`: Handles automated generation of entries and commits them to the repository.
- **Important Configuration**: The workflow is currently scheduled to run via cron every Sunday to add new entries automatically. Do not remove or alter this schedule unless explicitly requested by the user.

### 5. AI Skills (`.agents/`)
- This directory contains specialized skills for AI agents.
- `generate_ojisan_entry`: A skill for generating a new entry and its image manually. Use this if you need to perform the generation process outside of the existing Node.js scripts.

## Common Agent Tasks

### Adding new frontend features:
- Modify `index.html` and `src/**/*.js`.
- Run `npm run dev` to verify. (Do not run generation scripts to test frontend changes, rely on existing `entries.json`).

### Modifying Generation Prompts:
- Edit `scripts/prompts.js`. The prompt forces Gemini to respond purely in JSON. Ensure any schema additions are reflected in the prompt string.
- The `IMAGE_PROMPT` enforces a black-and-white sketch style.

### Debugging Deployment Issues:
- Check `vite.config.js` (base URL is currently `/`).
- Check `daily-generate.yml` for Node environments or missing `GEMINI_API_KEY` secrets in GitHub.

## Rules for Agents

1. **Do not introduce heavy frontend frameworks.** Stick to Vanilla JS and Vite.
2. **Handle errors gracefully.** If generation fails in scripts, ensure the error is caught and reported.
3. **Preserve localization.** All entries MUST have both `_ja` and `_en` suffixes for their fields as defined in the system prompt.
4. **No dynamic API calling from the client.** Do not inject the `GEMINI_API_KEY` into the frontend code. All generation must happen via Node.js scripts or agent skills prior to build/deployment.
