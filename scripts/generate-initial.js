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

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT, GENERATE_ENTRY_PROMPT, SEED_ENTRIES } from './prompts.js';
import { loadEntries, saveEntries, generateImage, sleep } from './utils.js';

/**
 * Generate text for a new entry.
 * @param {Object} model - The Gemini API text model instance.
 * @param {Array<string>} existingTitles - List of existing titles to avoid duplicates.
 * @param {string|null} seedHint - Optional seed hint.
 * @returns {Promise<Object>} The generated entry text data.
 */
async function generateText(model, existingTitles, seedHint) {
    const prompt = GENERATE_ENTRY_PROMPT(existingTitles, seedHint);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error(`Failed to parse JSON from response:\n${text}`);
    }

    return JSON.parse(jsonMatch[0]);
}

/**
 * Main execution function.
 * @returns {Promise<void>}
 */
async function main() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY environment variable is required');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const textModel = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: SYSTEM_PROMPT,
    });
    const imageModel = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
    });

    let entries = loadEntries();
    const startId = entries.length > 0 ? Math.max(...entries.map(function(e) {
        return e.id;
    })) + 1 : 1;
    const total = SEED_ENTRIES.length;

    console.log('📖 おじさんアンチパターン集 — Initial Batch Generation');
    console.log(`   Generating ${total} entries starting from No.${String(startId).padStart(3, '0')}\n`);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < total; i++) {
        const entryId = startId + i;
        const seed = SEED_ENTRIES[i];
        const existingTitles = entries.map(function(e) {
            return e.title_ja;
        });

        console.log(`[${i + 1}/${total}] No.${String(entryId).padStart(3, '0')} — Seed: ${seed.split('—')[0].trim()}`);

        try {
            // Generate text
            console.log('  📝 Generating text...');
            const entryData = await generateText(textModel, existingTitles, seed);
            console.log(`  ✅ ${entryData.title_ja}`);

            // Generate image
            console.log('  🎨 Generating illustration...');
            const imagePath = await generateImage(imageModel, entryData.title_ja, entryData.description_ja, entryId);
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

main().catch(function(err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
