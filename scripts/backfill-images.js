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
import { loadEntries, saveEntries, generateImage, sleep, DATA_FILE } from './utils.js';

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

    const missing = entries.filter(function(e) {
        return !e.image;
    });
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

        try {
            const imageModel = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash-exp',
            });
            const imagePath = await generateImage(
                imageModel,
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

main().catch(function(err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
