#!/usr/bin/env node

/**
 * Backfill images for existing Ojisan Anti-pattern entries that have image: null.
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
import { loadEntries, saveEntries, IMAGES_DIR, DATA_FILE } from './utils.js';

/**
 * Generates an image for an entry.
 * @param {GoogleGenerativeAI} genAI - Gemini AI instance
 * @param {string} titleJa - Japanese title
 * @param {string} descriptionJa - Japanese description
 * @param {number} entryId - ID of the entry
 * @returns {Promise<string|null>} Path to the generated image or null if failed
 */
function generateImage(genAI, titleJa, descriptionJa, entryId) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
    });

    const prompt = IMAGE_PROMPT(titleJa, descriptionJa);
    return model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseModalities: ['image', 'text'],
        },
    })
    .then(function (result) {
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

                    return fs.promises.mkdir(IMAGES_DIR, { recursive: true })
                        .then(function () {
                            return fs.promises.writeFile(filepath, Buffer.from(imageData, 'base64'));
                        })
                        .then(function () {
                            return `./images/${filename}`;
                        });
                }
            }
        }

        return null;
    })
    .catch(function (err) {
        console.error(`  ⚠️ Image generation failed: ${err.message}`);
        return null;
    });
}

/**
 * Promisified timeout for delays.
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

/**
 * Main execution function.
 * @returns {Promise<void>}
 */
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

    const missing = entries.filter(function (e) { return !e.image; });
    if (missing.length === 0) {
        console.log('✅ All entries already have images!');
        return;
    }

    console.log(`📖 おじさんアンチパターン集 — Backfilling images for ${missing.length} entries\n`);

    for (const entry of missing) {
        const padId = String(entry.id).padStart(3, '0');
        console.log(`  🎨 [No.${padId}] ${entry.title_ja} / ${entry.title_en}`);

        if (dryRun) {
            console.log(`     ⏩ Skipped (dry run)`);
            continue;
        }

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
            console.log(`     ⚠️ No image returned by Gemini or failed`);
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

main().catch(function (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
