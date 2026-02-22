#!/usr/bin/env node

/**
 * Backfill images for existing Ojisandex entries that have image: null.
 *
 * Usage:
 *   GEMINI_API_KEY=xxx node scripts/backfill-images.js
 *   GEMINI_API_KEY=xxx node scripts/backfill-images.js --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IMAGE_PROMPT } from './prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'public', 'data', 'entries.json');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');

function loadEntries() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveEntries(entries) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

async function generateImage(genAI, titleJa, descriptionJa, entryId) {
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
}

// Simple delay to avoid rate limiting
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY environment variable is required');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const entries = loadEntries();

    const missing = entries.filter((e) => !e.image);
    if (missing.length === 0) {
        console.log('✅ All entries already have images!');
        return;
    }

    console.log(`📖 Ojisandex — Backfilling images for ${missing.length} entries\n`);

    for (const entry of missing) {
        const padId = String(entry.id).padStart(3, '0');
        console.log(`  🎨 [No.${padId}] ${entry.title_ja} / ${entry.title_en}`);

        if (dryRun) {
            console.log(`     ⏩ Skipped (dry run)`);
            continue;
        }

        try {
            const imagePath = await generateImage(
                genAI,
                entry.title_ja,
                entry.description_ja,
                entry.id
            );

            if (imagePath) {
                entry.image = imagePath;
                console.log(`     ✅ Saved: ${imagePath}`);
            } else {
                console.log(`     ⚠️ No image returned by Gemini`);
            }
        } catch (err) {
            console.error(`     ❌ Failed: ${err.message}`);
        }

        // Wait 2 seconds between requests to avoid rate limits
        if (entry !== missing[missing.length - 1]) {
            console.log('     ⏳ Waiting 2s...');
            await sleep(2000);
        }
    }

    if (!dryRun) {
        saveEntries(entries);
        console.log(`\n✨ Done! Updated ${DATA_FILE}`);
    }
}

main().catch((err) => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
