/**
 * UI string translations for bilingual support
 */
export const labels = {
  ja: {
    entryCount: (n) => `全${n}種 発見済み`,
    habitat: '出没場所',
    dangerLevel: '危険度',
    encounterRate: '遭遇率',
    specialAbility: '特技',
    loading: '図鑑を読み込み中...',
    footer: '© 2026 おじさん図鑑 — AI生成コンテンツ',
    footerNote: '本サイトの内容はフィクションであり、特定の個人を指すものではありません。',
    subtitle: '中年男性の生態をユーモラスに解剖する',
    searchPlaceholder: 'おじさんを検索...',
    sortLabel: '並べ替え:',
    sortId: '図鑑番号順',
    sortDanger: '危険度が高い順',
    sortEncounter: '遭遇率が高い順',
  },
  en: {
    entryCount: (n) => `${n} Species Discovered`,
    habitat: 'Habitat',
    dangerLevel: 'Danger',
    encounterRate: 'Encounter',
    specialAbility: 'Ability',
    loading: 'Loading encyclopedia...',
    footer: '© 2026 Ojisan Zukan — AI Generated Content',
    footerNote: 'All content is fictional and does not refer to any specific individuals.',
    subtitle: 'A Humorous Field Guide to Middle-Aged Men',
    searchPlaceholder: 'Search Ojisan...',
    sortLabel: 'Sort by:',
    sortId: 'ID (Default)',
    sortDanger: 'Danger Level',
    sortEncounter: 'Encounter Rate',
  },
};
