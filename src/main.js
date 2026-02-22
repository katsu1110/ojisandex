import './style.css';
import { initHeader } from './components/header.js';
import { createEntryCard, updateEntryCardLang } from './components/entry-card.js';
import { labels } from './i18n/labels.js';

let currentLang = 'ja';
let entries = [];

async function loadEntries() {
  try {
    const base = import.meta.env.BASE_URL;
    const res = await fetch(`${base}data/entries.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    entries = await res.json();
    return entries;
  } catch (err) {
    console.error('Failed to load entries:', err);
    return [];
  }
}

function renderEntries(entriesData, lang) {
  const container = document.getElementById('entries-container');
  container.innerHTML = '';

  entriesData.forEach((entry) => {
    const card = createEntryCard(entry, lang);
    container.appendChild(card);
  });

  // Set up scroll-triggered animations
  setupScrollAnimations();
}

function setupScrollAnimations() {
  const observer = new IntersectionObserver(
    (observerEntries) => {
      observerEntries.forEach((obsEntry) => {
        if (obsEntry.isIntersecting) {
          obsEntry.target.classList.add('visible');
          observer.unobserve(obsEntry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('.entry-card').forEach((card) => {
    observer.observe(card);
  });
}

function handleLangChange(newLang) {
  currentLang = newLang;

  // Update entry cards
  document.querySelectorAll('.entry-card').forEach((card) => {
    const id = parseInt(card.dataset.id, 10);
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      updateEntryCardLang(card, entry, newLang);
    }
  });

  // Update footer
  updateFooter(newLang);
}

function updateFooter(lang) {
  const footer = document.getElementById('site-footer');
  const ps = footer.querySelectorAll('p');
  if (ps[0]) ps[0].textContent = labels[lang].footer;
  if (ps[1]) ps[1].textContent = labels[lang].footerNote;
}

async function init() {
  const loadedEntries = await loadEntries();

  // Remove loading indicator
  const loading = document.getElementById('loading');
  if (loading) loading.remove();

  if (loadedEntries.length === 0) {
    const container = document.getElementById('entries-container');
    container.innerHTML = `
      <div class="loading">
        <p>まだエントリーがありません。<code>npm run generate:initial</code> で初期データを生成してください。</p>
      </div>
    `;
    return;
  }

  // Initialize header
  initHeader(loadedEntries.length, currentLang, handleLangChange);

  // Setup search functionality
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderEntries(entries, currentLang);
        return;
      }

      const filtered = entries.filter((entry) => {
        const titleJa = entry.title_ja?.toLowerCase() || '';
        const titleEn = entry.title_en?.toLowerCase() || '';
        const descJa = entry.description_ja?.toLowerCase() || '';
        const descEn = entry.description_en?.toLowerCase() || '';
        const catJa = entry.category_ja?.toLowerCase() || '';
        const catEn = entry.category_en?.toLowerCase() || '';

        return (
          titleJa.includes(query) ||
          titleEn.includes(query) ||
          descJa.includes(query) ||
          descEn.includes(query) ||
          catJa.includes(query) ||
          catEn.includes(query)
        );
      });

      renderEntries(filtered, currentLang);
    });
  }

  // Render entries
  renderEntries(loadedEntries, currentLang);

  // Set initial footer text
  updateFooter(currentLang);
}

init();
