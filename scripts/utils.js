import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SYSTEM_PROMPT, GENERATE_ENTRY_PROMPT, IMAGE_PROMPT } from "./prompts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');
export const DATA_FILE = path.join(ROOT, 'public', 'data', 'entries.json');
export const IMAGES_DIR = path.join(ROOT, 'public', 'images');

export function loadEntries() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

export function saveEntries(entries) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}
export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateText(genAI, existingTitles, seedHint) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = GENERATE_ENTRY_PROMPT(existingTitles, seedHint);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error(`Failed to parse JSON from Gemini response:\n${text}`);
    }

    return JSON.parse(jsonMatch[0]);
}

export async function generateImage(genAI, titleJa, descriptionJa, entryId) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash-exp',
        });

        const prompt = IMAGE_PROMPT(titleJa, descriptionJa);
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseModalities: ['image', 'text'],
            },
        });

        const response = result.response;
        const candidates = response.candidates;
        if (candidates && candidates.length > 0) {
            const parts = candidates[0].content.parts;
            for (const part of parts) {
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
    } catch (err) {
        console.error(`  ⚠️ Image generation failed: ${err.message}`);
        return null;
    }
}
