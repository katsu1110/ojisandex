#!/usr/bin/env node

/**
 * Generate the initial batch of 20 Ojisan Anti-pattern entries.
 *
 * Usage:
 *   GEMINI_API_KEY=xxx node scripts/generate-initial.js
 *
 * This will generate 20 entries using the seed list from prompts.js.
 * Each entry includes text content and an illustration.
 * There is a delay between API calls to avoid rate limiting.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SEED_ENTRIES } from './prompts.js';
import { loadEntries, saveEntries, IMAGES_DIR, sleep, generateText, generateImage } from './utils.js';

async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY environment variable is required');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    let entries = loadEntries();
    const startId = entries.length > 0 ? Math.max(...entries.map((e) => e.id)) + 1 : 1;
    const total = SEED_ENTRIES.length;

    console.log('📖 おじさんアンチパターン集 — Initial Batch Generation');
    console.log(`   Generating ${total} entries starting from No.${String(startId).padStart(3, '0')}\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < total; i++) {
        const entryId = startId + i;
        const seed = SEED_ENTRIES[i];
        const existingTitles = entries.map((e) => e.title_ja);

        console.log(`[${i + 1}/${total}] No.${String(entryId).padStart(3, '0')} — Seed: ${seed.split('—')[0].trim()}`);

        try {
            // Generate text
            console.log('  📝 Generating text...');
            const entryData = await generateText(genAI, existingTitles, seed);
            console.log(`  ✅ ${entryData.title_ja}`);

            // Generate image
            console.log('  🎨 Generating illustration...');
            const imagePath = await generateImage(genAI, entryData.title_ja, entryData.description_ja, entryId);
            if (imagePath) {
                console.log(`  📸 Image saved`);
            } else {
                console.log(`  ⚠️ Using placeholder`);
            }

            // Save entry
            const entry = {
                id: entryId,
                ...entryData,
                image: imagePath,
                created_at: new Date().toISOString(),
            };

            entries.push(entry);
            saveEntries(entries);
            successCount++;

            console.log('');

            // Rate limiting — wait between calls
            if (i < total - 1) {
                console.log('  ⏳ Waiting 5s for rate limiting...\n');
                await sleep(5000);
            }
        } catch (err) {
            console.error(`  ❌ Failed: ${err.message}\n`);
            failCount++;
            // Continue with next entry
            await sleep(3000);
        }
    }

    console.log('═══════════════════════════════════════');
    console.log(`✨ Generation complete!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📊 Total entries: ${entries.length}`);
}

main().catch((err) => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
