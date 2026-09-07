#!/usr/bin/env node

/**
 * Generate a single new Ojisan Anti-pattern entry using the Gemini API.
 * Appends the result to public/data/entries.json and saves the illustration to public/images/.
 *
 * Usage:
 *   GEMINI_API_KEY=xxx node scripts/generate-entry.js
 *   GEMINI_API_KEY=xxx node scripts/generate-entry.js --dry-run
 *   GEMINI_API_KEY=xxx node scripts/generate-entry.js --seed "居酒屋で店員に横柄なおじさん"
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT, GENERATE_ENTRY_PROMPT } from './prompts.js';
import { generateOjisanImage } from './image-service.js';
import { loadEntries, saveEntries } from './utils.js';

async function generateText(genAI, existingTitles, seedHint) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = GENERATE_ENTRY_PROMPT(existingTitles, seedHint);
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error(`Failed to parse JSON from model response: ${text}`);
    }

    return JSON.parse(jsonMatch[0]);
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const seedIdx = args.indexOf('--seed');
    const seedHint = seedIdx !== -1 ? args[seedIdx + 1] : null;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY environment variable is required');
        process.exit(1);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const entries = loadEntries();
    const existingTitles = entries.map((e) => e.title_ja);
    const nextId = entries.length > 0 ? Math.max(...entries.map((e) => e.id)) + 1 : 1;

    console.log(`📖 おじさんアンチパターン集 — Generating entry No.${String(nextId).padStart(3, '0')}`);
    if (seedHint) console.log(`  🌱 Seed: ${seedHint}`);

    // Generate text content
    console.log('  📝 Generating text...');
    const entryData = await generateText(genAI, existingTitles, seedHint);
    console.log(`  ✅ Title: ${entryData.title_ja} / ${entryData.title_en}`);

    if (dryRun) {
        console.log('\n🏃 Dry run — not saving. Generated content:');
        console.log(JSON.stringify(entryData, null, 2));
        return;
    }

    // Generate image
    console.log('  🎨 Generating illustration...');
    const imagePath = await generateOjisanImage(apiKey, genAI, entryData.title_ja, entryData.description_ja, nextId);

    // Assemble final entry
    const entry = {
        id: nextId,
        ...entryData,
        image: imagePath,
        created_at: new Date().toISOString(),
    };

    entries.push(entry);
    saveEntries(entries);

    console.log(`\n✨ Entry No.${String(nextId).padStart(3, '0')} saved successfully!`);
    console.log(`   ${entry.title_ja} (${entry.title_en})`);
}

main().catch((err) => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
