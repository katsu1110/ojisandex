# Guidelines for AI Agents (AGENTS.md)

This document provides context and guidelines for AI coding agents maintaining, extending, or debugging the "Ojisan Zukan" (ojisandex) repository.

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
- **Note on Base URL**: Be mindful of Vite's `base` configuration in `vite.config.js` (`/ojisandex/`). Fetch requests to public assets use `import.meta.env.BASE_URL` to prevent 404s when hosted on GitHub Pages.

### 3. Scripts (`scripts/`)
- Use `@google/generative-ai` SDK.
- Text generation: `gemini-2.5-flash`. Returns strictly formatted JSON.
- Image generation: `gemini-2.0-flash-exp`. The script extracts base64 image data and writes it to `public/images/`.
- Entry points: `npm run generate` triggers `scripts/generate-entry.js`.

### 4. CI/CD (`.github/workflows/`)
- `daily-generate.yml`: Handles automated generation and deployment via GitHub Pages.
- **Important Configuration**: The workflow is currently scheduled to run via cron on Tuesdays and Fridays to add new entries automatically. Do not remove or alter this schedule unless explicitly requested by the user.

## Common Agent Tasks

### Adding new frontend features:
- Modify `index.html` and `src/**/*.js`.
- Run `npm run dev` to verify. (Do not run generation scripts to test frontend changes, rely on existing `entries.json`).

### Modifying Generation Prompts:
- Edit `scripts/prompts.js`. The prompt forces Gemini to respond purely in JSON. Ensure any schema additions are reflected in the prompt string.
- The `IMAGE_PROMPT` enforces a black-and-white sketch style.

### Debugging Deployment Issues:
- Check `vite.config.js` (often `base` URL issues).
- Check `daily-generate.yml` for Node environments or missing `GEMINI_API_KEY` secrets in GitHub.

## Rules for Agents

1. **Do not introduce heavy frontend frameworks.** Stick to Vanilla JS and Vite.
2. **Handle errors gracefully.** If generation fails in `scripts/generate-entry.js`, the script is designed to catch it. Ensure new scripts do the same.
3. **Preserve localization.** All entries MUST have both `_ja` and `_en` suffixes for their fields as defined in the system prompt.
4. **No dynamic API calling from the client.** Do not inject the `GEMINI_API_KEY` into the frontend code. All generation must happen via Node.js scripts prior to build/deployment.
