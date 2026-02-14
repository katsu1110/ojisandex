import { renderStats } from './stats-badge.js';

/**
 * Create an entry card DOM element
 */
export function createEntryCard(entry, lang) {
  const card = document.createElement('article');
  card.className = 'entry-card';
  card.dataset.id = entry.id;

  const padId = String(entry.id).padStart(3, '0');
  const titleJa = entry.title_ja;
  const titleEn = entry.title_en;
  const descJa = entry.description_ja;
  const descEn = entry.description_en;
  const category = lang === 'ja' ? entry.category_ja : entry.category_en;

  const base = import.meta.env.BASE_URL;
  const imageSrc = entry.image ? `${base}${entry.image.replace('./', '')}` : null;
  const imageHtml = imageSrc
    ? `<img src="${imageSrc}" alt="${titleJa}" loading="lazy" />`
    : `<div class="entry-image-placeholder">👴</div>`;

  card.innerHTML = `
    <div class="entry-illustration">
      <span class="entry-number">No.${padId}</span>
      <div class="entry-image-wrapper">
        ${imageHtml}
      </div>
      <div class="entry-stats" data-id="${entry.id}">
        ${renderStats(entry, lang)}
      </div>
    </div>
    <div class="entry-content">
      <div class="entry-title-ja" data-field="title_ja">${titleJa}</div>
      <div class="entry-title-en" data-field="title_en">${titleEn}</div>
      <div class="entry-description" data-field="description">
        ${lang === 'ja' ? descJa : descEn}
      </div>
      <div class="entry-category">
        <span class="category-tag" data-field="category">${category}</span>
      </div>
    </div>
  `;

  return card;
}

/**
 * Update an existing entry card's language
 */
export function updateEntryCardLang(card, entry, lang) {
  const descEl = card.querySelector('[data-field="description"]');
  const catEl = card.querySelector('[data-field="category"]');
  const statsEl = card.querySelector('.entry-stats');

  if (descEl) {
    descEl.textContent = lang === 'ja' ? entry.description_ja : entry.description_en;
  }
  if (catEl) {
    catEl.textContent = lang === 'ja' ? entry.category_ja : entry.category_en;
  }
  if (statsEl) {
    statsEl.innerHTML = renderStats(entry, lang);
  }
}
