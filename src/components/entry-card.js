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
  let category;
  if (lang === 'ja') {
    category = entry.category_ja;
  } else {
    category = entry.category_en;
  }

  const base = import.meta.env.BASE_URL;

  let imageSrc = null;
  if (entry.image) {
    imageSrc = `${base}${entry.image.replace('./', '')}`;
  }

  const illustrationDiv = document.createElement('div');
  illustrationDiv.className = 'entry-illustration';

  const numberSpan = document.createElement('span');
  numberSpan.className = 'entry-number';
  numberSpan.textContent = `No.${padId}`;

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'entry-image-wrapper';

  if (imageSrc) {
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = titleJa;
    img.loading = 'lazy';
    imageWrapper.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'entry-image-placeholder';
    placeholder.textContent = '👴';
    imageWrapper.appendChild(placeholder);
  }

  const statsDiv = document.createElement('div');
  statsDiv.className = 'entry-stats';
  statsDiv.dataset.id = entry.id;
  statsDiv.innerHTML = renderStats(entry, lang); // Safe: output of renderStats

  illustrationDiv.appendChild(numberSpan);
  illustrationDiv.appendChild(imageWrapper);
  illustrationDiv.appendChild(statsDiv);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'entry-content';

  const titleJaDiv = document.createElement('div');
  titleJaDiv.className = 'entry-title-ja';
  titleJaDiv.dataset.field = 'title_ja';
  titleJaDiv.textContent = titleJa;

  const titleEnDiv = document.createElement('div');
  titleEnDiv.className = 'entry-title-en';
  titleEnDiv.dataset.field = 'title_en';
  titleEnDiv.textContent = titleEn;

  const descDiv = document.createElement('div');
  descDiv.className = 'entry-description';
  descDiv.dataset.field = 'description';
  if (lang === 'ja') {
    descDiv.textContent = descJa;
  } else {
    descDiv.textContent = descEn;
  }

  const categoryDiv = document.createElement('div');
  categoryDiv.className = 'entry-category';

  const categorySpan = document.createElement('span');
  categorySpan.className = 'category-tag';
  categorySpan.dataset.field = 'category';
  categorySpan.textContent = category;

  categoryDiv.appendChild(categorySpan);

  contentDiv.appendChild(titleJaDiv);
  contentDiv.appendChild(titleEnDiv);
  contentDiv.appendChild(descDiv);
  contentDiv.appendChild(categoryDiv);

  card.appendChild(illustrationDiv);
  card.appendChild(contentDiv);

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
