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

  // Create a dictionary for O(1) lookups
  const entriesMap = new Map();
  for (let i = 0; i < entries.length; i++) {
    entriesMap.set(entries[i].id, entries[i]);
  }

  // Update entry cards
  document.querySelectorAll('.entry-card').forEach((card) => {
    const id = parseInt(card.dataset.id, 10);
    const entry = entriesMap.get(id);
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

  // State
  let searchQuery = '';
  let sortBy = 'id';
  let selectedCategory = 'all';

  const encounterRank = {
    'Extremely Common': 5,
    '非常に多い': 5,
    'Very Common': 4,
    '結構いる': 4,
    'Common': 3,
    'よく見かける': 3,
    'Uncommon': 2,
    'たまに見かける': 2,
    'Rare': 1,
    'レア': 1
  };

  function updateDisplay() {
    let filtered = entries;

    // 1. Filter by Search and Category
    if (searchQuery || selectedCategory !== 'all') {
      filtered = entries.filter((entry) => {
        const titleJa = entry.title_ja?.toLowerCase() || '';
        const titleEn = entry.title_en?.toLowerCase() || '';
        const descJa = entry.description_ja?.toLowerCase() || '';
        const descEn = entry.description_en?.toLowerCase() || '';
        const catJa = entry.category_ja?.toLowerCase() || '';
        const catEn = entry.category_en?.toLowerCase() || '';

        const matchesSearch = searchQuery === '' || (
          titleJa.includes(searchQuery) ||
          titleEn.includes(searchQuery) ||
          descJa.includes(searchQuery) ||
          descEn.includes(searchQuery) ||
          catJa.includes(searchQuery) ||
          catEn.includes(searchQuery)
        );

        const matchesCategory = selectedCategory === 'all' || entry.category_en === selectedCategory || entry.category_ja === selectedCategory;

        return matchesSearch && matchesCategory;
      });
    }

    // 2. Sort
    filtered.sort((a, b) => {
      if (sortBy === 'danger') {
        const d1 = a.danger_level || 0;
        const d2 = b.danger_level || 0;
        return d2 - d1; // Higher danger first
      }

      if (sortBy === 'encounter') {
        const rankA = encounterRank[a.encounter_en] || encounterRank[a.encounter_ja] || 0;
        const rankB = encounterRank[b.encounter_en] || encounterRank[b.encounter_ja] || 0;
        return rankB - rankA; // More common first
      }

      // Default: sort by ID
      return b.id - a.id;
    });

    renderEntries(filtered, currentLang);
  }

  // Setup search event
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      updateDisplay();
    });
  }

  // Setup sort event
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      updateDisplay();
    });
  }

  // Setup category filters
  const categoryContainer = document.getElementById('category-filters');
  if (categoryContainer) {
    // Extract unique categories
    const categories = new Map(); // value -> label
    loadedEntries.forEach(entry => {
      if (entry.category_ja && entry.category_en) {
        categories.set(entry.category_ja, { ja: entry.category_ja, en: entry.category_en });
      }
    });

    categoryContainer.innerHTML = '';
    
    // Add "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.category = 'all';
    allBtn.innerHTML = `<span class="cat-ja">すべて</span><span class="cat-en">All</span>`;
    categoryContainer.appendChild(allBtn);

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.category = cat.ja;
      btn.innerHTML = `<span class="cat-ja">${cat.ja}</span><span class="cat-en">${cat.en}</span>`;
      categoryContainer.appendChild(btn);
    });

    categoryContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      selectedCategory = btn.dataset.category;
      updateDisplay();
    });
  }

  // Initial render
  updateDisplay();

  // Set initial footer text
  updateFooter(currentLang);
}

init();
