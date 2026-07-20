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
/**
 * @param {Object} entry
 * @param {string} lang
 * @returns {string}
 */
export function renderStats(entry, lang) {
    let habitat;
    let ability;
    let encounter;
    if (lang === 'ja') {
        habitat = entry.habitat_ja;
        ability = entry.ability_ja;
        encounter = entry.encounter_ja;
    } else {
        habitat = entry.habitat_en;
        ability = entry.ability_en;
        encounter = entry.encounter_en;
    }

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
