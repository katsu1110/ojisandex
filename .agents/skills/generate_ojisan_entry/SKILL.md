---
name: generate_ojisan_entry
description: Generates a new entry (both JSON data and a pencil-sketch illustration) for the Ojisan Anti-pattern Collection (おじさんアンチパターン集) and records it in entries.json.
---
# Generate Ojisan Entry Skill

When the user asks you to "generate a new entry", "generate an entry with an image", or similar, you should perform a two-phase process to create both the entry text and its corresponding illustration for the "おじさんアンチパターン集" (Ojisan Anti-pattern Collection) application.

## Phase 1: Entry Text Generation

1. **Read Existing Titles**: First, read `public/data/entries.json` to get a list of existing `title_ja` values so you don't generate duplicates.
2. **Generate JSON**: Use the system prompt style and schema rules to generate a new entry. The schema is as follows (ensure it's output as strict JSON):
   ```json
   {
     "title_ja": "〇〇おじさん（キャッチーな和名）",
     "title_en": "English title (The + descriptive name)",
     "description_ja": "3〜4文のユーモラスな説明文。生態、行動パターン、特徴を描写。ポケモン図鑑風の語り口で。",
     "description_en": "3-4 sentence humorous description in English. Same content as Japanese but naturally localized.",
     "habitat_ja": "主な出没場所（簡潔に）",
     "habitat_en": "Primary habitat (concise)",
     "danger_level": 3,
     "encounter_ja": "遭遇率（例：よく見かける、まれ、季節限定）",
     "encounter_en": "Encounter rate (e.g., Common, Rare, Seasonal)",
     "ability_ja": "特技や必殺技（ユーモラスに）",
     "ability_en": "Special ability (humorous)",
     "category_ja": "カテゴリー（例：居酒屋系、通勤系、公園系、ネット系）",
     "category_en": "Category (e.g., Izakaya Type, Commuter Type, Park Type, Internet Type)"
   }
   ```
   *Note: `danger_level` is 1-5. Make it humorous and avoid targeting specific individuals.*

## Phase 2: Image Generation

1. **Tool Usage**: Use the `generate_image` tool.
2. **Prompt Template**: You MUST use the exact styling prompt below. Replace `[ENTRY_TITLE]` and `[ENTRY_DESCRIPTION]` with the `title_ja` and `description_ja` you generated in Phase 1:

```text
黒と白の鉛筆スケッチで、以下の「おじさん」を描いてください:

タイトル: [ENTRY_TITLE]
説明: [ENTRY_DESCRIPTION]

スタイル:
- 白い背景に黒鉛筆のスケッチ
- デフォルメされた可愛らしいイラスト
- 漫画風のタッチ
- 表情豊かで特徴的なポーズ
- 中年男性のキャラクター
- シンプルで特徴的な服装や小道具
- 線画スタイル、ハッチング（斜線）で陰影をつける

重要: テキストや文字は含めないでください。イラストのみ。
```

## Phase 3: Post-Processing

After successfully generating the JSON and the image:
1. Move the generated artifact image file to the `public/images/` directory in the project repository using terminal commands. Determine the next available ID from `entries.json` (e.g., if max ID is 5, the new one is 6) and use it for the filename: `ojisan-006.png`. Ensure it is a valid format, usually `.png` or `.webp`.
2. Add the `image` field to your generated JSON (e.g., `"image": "./images/ojisan-006.png"`). Also add `"id": [NEXT_ID]` and `"created_at": "[CURRENT_DATE_ISO]"`.
3. Append this complete JSON object to the array in `public/data/entries.json` through the `multi_replace_file_content` block.
4. Verify the changes via terminal or IDE tools and confirm it to the user.
