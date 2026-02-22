---
name: generate_ojisan_image
description: Generates a pencil-sketch illustration for a new Ojisan Picture Book (おじさん図鑑) entry and records it in entries.json.
---
# Generate Ojisan Image Skill

When the user asks you to "generate an image for this entry" or "create a new entry with an image", you should use the `generate_image` tool to create the illustration for the "おじさん図鑑" (Oji-san Picture Book) application.

## 1. Tool Usage
Always use the `generate_image` tool.

## 2. Prompt Template
You MUST use the exact styling prompt below. Replace `[ENTRY_TITLE]` and `[ENTRY_DESCRIPTION]` with the actual title and description of the entry you are generating an image for:

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

## 3. Post-Processing
After successfully generating the image:
1. Move the generated artifact image file to the `public/images/` directory in the project repository using terminal commands,. Provide a consistent filename based on the id, e.g., `ojisan-006.png`. Ensure it is a valid format, usually `.png` or `.webp`. 
2. Update the corresponding entry in `public/data/entries.json` through the `multi_replace_file_content` block to point to the newly added image file (`"./images/ojisan-[ID].png"`). 
3. After doing the move and update step, you can verify this via terminal or IDE tools and confirm it to the user.
