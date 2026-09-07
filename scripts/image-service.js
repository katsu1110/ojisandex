import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IMAGE_PROMPT } from './prompts.js';
import { IMAGES_DIR } from './utils.js';

// Candidate models for image generation to try in order
const CANDIDATE_MODELS = [
    'gemini-2.5-flash-image',
    'gemini-2.0-flash',
    'imagen-3.0-generate-002',
];

/**
 * Attempts to generate an image using the standard Gemini generateContent with responseModalities.
 */
async function tryGenerateWithGemini(genAI, modelName, prompt) {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    const response = result.response;
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return {
                    data: part.inlineData.data,
                    mimeType: part.inlineData.mimeType || 'image/png',
                };
            }
        }
    }
    return null;
}

/**
 * Fallback: Attempts to call Imagen 3 REST predict endpoint directly with the API key.
 */
async function tryGenerateWithImagenRest(apiKey, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
                sampleCount: 1,
                aspectRatio: '1:1',
            },
        }),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Imagen predict failed HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = await res.json();
    if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
        return {
            data: data.predictions[0].bytesBase64Encoded,
            mimeType: data.predictions[0].mimeType || 'image/png',
        };
    }
    return null;
}

/**
 * Dispatches image generation with fallback across supported models/endpoints.
 */
export async function generateOjisanImage(apiKey, genAI, titleJa, descriptionJa, entryId) {
    const prompt = IMAGE_PROMPT(titleJa, descriptionJa);

    // 1. Try candidates via generateContent
    for (const modelName of CANDIDATE_MODELS) {
        try {
            console.log(`     [image] trying model: ${modelName}`);
            const img = await tryGenerateWithGemini(genAI, modelName, prompt);
            if (img) {
                return await saveImageToFile(img.data, img.mimeType, entryId);
            }
        } catch (err) {
            console.log(`     [image] ${modelName} failed: ${err.message}`);
        }
    }

    // 2. Fallback to Imagen 3 REST predict endpoint
    try {
        console.log(`     [image] trying Imagen 3 REST predict`);
        const img = await tryGenerateWithImagenRest(apiKey, prompt);
        if (img) {
            return await saveImageToFile(img.data, img.mimeType, entryId);
        }
    } catch (err) {
        console.log(`     [image] Imagen 3 REST failed: ${err.message}`);
    }

    return null;
}

async function saveImageToFile(base64Data, mimeType, entryId) {
    const ext = mimeType.includes('png') ? 'png' : mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'webp';
    const filename = `ojisan-${String(entryId).padStart(3, '0')}.${ext}`;
    const filepath = path.join(IMAGES_DIR, filename);

    await fs.promises.mkdir(IMAGES_DIR, { recursive: true });
    await fs.promises.writeFile(filepath, Buffer.from(base64Data, 'base64'));

    return `./images/${filename}`;
}
