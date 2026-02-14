/**
 * Render star rating HTML
 */
export function renderStars(rating, maxStars = 5) {
    let html = '';
    for (let i = 1; i <= maxStars; i++) {
        if (i <= rating) {
            html += '<span class="star">★</span>';
        } else {
            html += '<span class="star empty">★</span>';
        }
    }
    return html;
}

/**
 * Render stat badges for an entry
 */
export function renderStats(entry, lang) {
    const habitat = lang === 'ja' ? entry.habitat_ja : entry.habitat_en;
    const ability = lang === 'ja' ? entry.ability_ja : entry.ability_en;
    const encounter = lang === 'ja' ? entry.encounter_ja : entry.encounter_en;

    return `
    <div class="stat-badge full-width">
      <span class="stat-icon">📍</span>
      <span class="stat-value">${habitat}</span>
    </div>
    <div class="stat-badge">
      <span class="stat-icon">⚠️</span>
      <span class="stat-value stars">${renderStars(entry.danger_level)}</span>
    </div>
    <div class="stat-badge">
      <span class="stat-icon">👀</span>
      <span class="stat-value">${encounter}</span>
    </div>
    <div class="stat-badge full-width">
      <span class="stat-icon">🎯</span>
      <span class="stat-value">${ability}</span>
    </div>
  `;
}
