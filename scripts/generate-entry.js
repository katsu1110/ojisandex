#!/usr/bin/env node

/**
 * Generate a single new Ojisandex entry using Gemini API.
 *
 * Usage:
 *   GEMINI_API_KEY=xxx node scripts/generate-entry.js
 *   GEMINI_API_KEY=xxx node scripts/generate-entry.js --seed "テーマのヒント"
 *   GEMINI_API_KEY=xxx node scripts/generate-entry.js --dry-run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT, GENERATE_ENTRY_PROMPT, IMAGE_PROMPT } from './prompts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'public', 'data', 'entries.json');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');

function loadEntries() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveEntries(entries) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

async function generateText(genAI, existingTitles, seedHint) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_PROMPT,
    });

    const prompt = GENERATE_ENTRY_PROMPT(existingTitles, seedHint);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error(`Failed to parse JSON from Gemini response:\n${text}`);
    }

    return JSON.parse(jsonMatch[0]);
}

async function generateImage(genAI, titleJa, descriptionJa, entryId) {
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

        // Extract image from response
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

                    console.log(`  📸 Image saved: ${filename}`);
                    return `./images/${filename}`;
                }
            }
        }

        console.log('  ⚠️ No image generated, using placeholder');
        return null;
    } catch (err) {
        console.error(`  ⚠️ Image generation failed: ${err.message}`);
        return null;
    }
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

    console.log(`📖 Ojisandex — Generating entry No.${String(nextId).padStart(3, '0')}`);
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
    const imagePath = await generateImage(genAI, entryData.title_ja, entryData.description_ja, nextId);

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
