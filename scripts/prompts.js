/**
 * Gemini prompt templates for Ojisandex content generation
 */

export const SYSTEM_PROMPT = `あなたは「おじさんアンチパターン研究者」です。
「こんなおじさんにだけはなりたくない！」と反面教師にすべき、中年男性の困った生態や特徴的な行動をフィールドワークで観察し、ユーモラスかつ的確に記録する架空の学者です。
短くてキャッチーで、クスッと笑えるテキストを書いてください。
悪意や差別的な表現は避け、「こういう人いるいる…気をつけよう」と自戒を込めて共感できるような内容にしてください。

You are also a bilingual researcher who provides English translations with the same humorous, cautionary tone about middle-aged anti-patterns.`;

export const GENERATE_ENTRY_PROMPT = (existingTitles, seedHint) => `
あなたは「おじさんアンチパターン集」のエントリーを1件生成してください。

${seedHint ? `テーマのヒント: ${seedHint}` : '新しい困ったおじさんのタイプ（アンチパターン）を考えてください。説教、武勇伝、マナー違反、時代錯誤な価値観など、「こんな大人にはなりたくない」と思わせつつも、どこか憎めない独自の個性を持つものを創造してください。'}

${existingTitles.length > 0 ? `既存のエントリー（なるべく別の方向性で考えてください）:\n${existingTitles.map(t => `- ${t}`).join('\n')}` : ''}

以下のJSON形式で厳密に回答してください。JSONのみを出力し、他のテキストは含めないでください:

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

danger_level は 1〜5 の整数で、数字が大きいほど周囲への影響が大きいことを表します。
ユーモラスで愛のある内容にしてください。特定の人物を指さないようにしてください。
`;

export const IMAGE_PROMPT = (titleJa, descriptionJa) => `
黒と白の鉛筆スケッチで、以下の「おじさん」を描いてください:

タイトル: ${titleJa}
説明: ${descriptionJa}

スタイル:
- 白い背景に黒鉛筆のスケッチ
- デフォルメされた可愛らしいイラスト
- 漫画風のタッチ
- 表情豊かで特徴的なポーズ
- 中年男性のキャラクター
- シンプルで特徴的な服装や小道具
- 線画スタイル、ハッチング（斜線）で陰影をつける

重要: テキストや文字は含めないでください。イラストのみ。
`;

export const SEED_ENTRIES = [
  '説教おじさん — 居酒屋で若者に求められていないアドバイスをするタイプ',
  '昔は凄かったおじさん — 過去の武勇伝を何度も繰り返し、現在の努力をしないタイプ',
  'パワハラ予備軍おじさん — 指導と称して精神的に追い詰めるギリギリのラインを攻めるタイプ',
  'ため息おじさん — 会社でやたらと大きなため息をつき、周囲の士気を下げるタイプ',
  'セクシャルハラスメントおじさん — 悪気なく時代錯誤な発言をして空気を凍らせるタイプ',
  'スマホおじさん — スマホの画面を至近距離で見るタイプ',
  '自慢話おじさん — 昔の武勇伝を何度も繰り返すタイプ',
  '健康オタクおじさん — 突然健康に目覚めて周囲に布教するタイプ',
  'コンビニおじさん — コンビニの前で缶コーヒーを飲みながら長時間佇むタイプ',
  'カラオケおじさん — 忘年会で十八番を熱唱し続けるタイプ',
  '写真おじさん — やたらと高級カメラを持ち歩いて撮影するタイプ',
  '電車おじさん — 電車内で足を広げて座るタイプ',
  'ジョギングおじさん — 突然走り始めるが長続きしないタイプ',
  'SNSおじさん — 若者のSNS文化についていこうとするタイプ',
  '居酒屋常連おじさん — 行きつけの居酒屋でカウンターの定位置を持つタイプ',
  '鼻歌おじさん — オフィスや電車内で無意識に鼻歌を歌うタイプ',
  'ゴルフおじさん — 会話のすべてをゴルフに結びつけるタイプ',
  '新聞おじさん — 紙の新聞を大きく広げて読むタイプ',
  'せっかちおじさん — 信号待ちやエレベーター前でイライラするタイプ',
  'アドバイスおじさん — 聞かれてもいないのにアドバイスをするタイプ',
];
