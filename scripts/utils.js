import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { IMAGE_PROMPT } from './prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
export const DATA_FILE = path.join(ROOT, 'public', 'data', 'entries.json');
export const IMAGES_DIR = path.join(ROOT, 'public', 'images');

/**
 * Load entries from the data file.
 * @returns {Array<Object>} The loaded entries.
 */
export function loadEntries() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

/**
 * Save entries to the data file.
 * @param {Array<Object>} entries - The entries to save.
 * @returns {void}
 */
export function saveEntries(entries) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms - The number of milliseconds to sleep.
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(function(resolve) {
        setTimeout(resolve, ms);
    });
}

/**
 * Generate an image using Gemini.
 * @param {Object} model - The Gemini model instance.
 * @param {string} titleJa - The title in Japanese.
 * @param {string} descriptionJa - The description in Japanese.
 * @param {number} entryId - The entry ID.
 * @returns {Promise<string|null>} The image path or null if generation fails.
 */
export function generateImage(model, titleJa, descriptionJa, entryId) {
    const prompt = IMAGE_PROMPT(titleJa, descriptionJa);

    return model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseModalities: ['image', 'text'],
        },
    }).then(function(result) {
        const response = result.response;
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            const parts = candidates[0].content.parts;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part.inlineData) {
                    const imageData = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    const ext = mimeType.includes('png') ? 'png' : 'webp';
                    const filename = `ojisan-${String(entryId).padStart(3, '0')}.${ext}`;
                    const filepath = path.join(IMAGES_DIR, filename);

                    fs.mkdirSync(IMAGES_DIR, { recursive: true });
                    fs.writeFileSync(filepath, Buffer.from(imageData, 'base64'));

                    return `./images/${filename}`;
                }
            }
        }
        return null;
    }).catch(function(err) {
        console.error(`  ⚠️ Image generation failed: ${err.message}`);
        return null;
    });
}
