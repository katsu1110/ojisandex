import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
export const DATA_FILE = path.join(ROOT, 'public', 'data', 'entries.json');
export const IMAGES_DIR = path.join(ROOT, 'public', 'images');

/**
 * Loads entries from the data file.
 * @returns {Array<Object>} List of entries
 */
export function loadEntries() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

/**
 * Saves entries to the data file.
 * @param {Array<Object>} entries - List of entries to save
 * @returns {void}
 */
export function saveEntries(entries) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}
