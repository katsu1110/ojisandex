import "./style.css";
import { initHeader } from "./components/header.js";
import {
  createEntryCard,
  updateEntryCardLang,
} from "./components/entry-card.js";
import { labels } from "./i18n/labels.js";

let currentLang = "ja";
let entries = [];

const encounterRank = {
  "Extremely Common": 5,
  非常に多い: 5,
  "Very Common": 4,
  結構いる: 4,
  Common: 3,
  よく見かける: 3,
  Uncommon: 2,
  たまに見かける: 2,
  Rare: 1,
  レア: 1,
};

/**
 * Load entries from the JSON file.
 * @returns {Promise<Array<Object>>} The loaded entries.
 */
async function loadEntries() {
  try {
    const base = import.meta.env.BASE_URL;
    const res = await fetch(`${base}data/entries.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    entries = await res.json();
    return entries;
  } catch (err) {
    console.error("Failed to load entries:", err);
    return [];
  }
}

/**
 * Render the entries.
 * @param {Array<Object>} entriesData - The entries to render.
 * @param {string} lang - The language to use.
 * @returns {void}
 */
function renderEntries(entriesData, lang) {
  const container = document.getElementById("entries-container");
  container.innerHTML = "";

  entriesData.forEach(function(entry) {
    const card = createEntryCard(entry, lang);
    container.appendChild(card);
  });

  // Set up scroll-triggered animations
  setupScrollAnimations();
}

/**
 * Set up scroll-triggered animations for entry cards.
 * @returns {void}
 */
function setupScrollAnimations() {
  const observer = new IntersectionObserver(
    function(observerEntries) {
      observerEntries.forEach(function(obsEntry) {
        if (obsEntry.isIntersecting) {
          obsEntry.target.classList.add("visible");
          observer.unobserve(obsEntry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
  );

  document.querySelectorAll(".entry-card").forEach(function(card) {
    observer.observe(card);
  });
}

/**
 * Handle language change event.
 * @param {string} newLang - The new language code.
 * @returns {void}
 */
function handleLangChange(newLang) {
  currentLang = newLang;

  // Create a dictionary for O(1) lookups
  const entriesMap = new Map();
  for (let i = 0; i < entries.length; i++) {
    entriesMap.set(entries[i].id, entries[i]);
  }

  // Update entry cards
  document.querySelectorAll(".entry-card").forEach(function(card) {
    const id = parseInt(card.dataset.id, 10);
    const entry = entriesMap.get(id);
    if (entry) {
      updateEntryCardLang(card, entry, newLang);
    }
  });

  // Update footer
  updateFooter(newLang);
}

/**
 * Update the footer text based on the language.
 * @param {string} lang - The language code.
 * @returns {void}
 */
function updateFooter(lang) {
  const footer = document.getElementById("site-footer");
  const ps = footer.querySelectorAll("p");
  if (ps[0]) ps[0].textContent = labels[lang].footer;
  if (ps[1]) ps[1].textContent = labels[lang].footerNote;
}

/**
 * Initialize the application.
 * @returns {Promise<void>}
 */
async function init() {
  const loadedEntries = await loadEntries();

  // Remove loading indicator
  const loading = document.getElementById("loading");
  if (loading) loading.remove();

  if (loadedEntries.length === 0) {
    const container = document.getElementById("entries-container");
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
  let searchQuery = "";
  let sortBy = "id";
  let selectedCategory = "all";

  /**
   * Check if an entry matches the filters.
   * @param {Object} entry - The entry to check.
   * @param {string} query - The search query.
   * @param {string} category - The selected category.
   * @returns {boolean} Whether the entry matches the filters.
   */
  function matchesFilters(entry, query, category) {
    const titleJa = entry.title_ja?.toLowerCase() || "";
    const titleEn = entry.title_en?.toLowerCase() || "";
    const descJa = entry.description_ja?.toLowerCase() || "";
    const descEn = entry.description_en?.toLowerCase() || "";
    const catJa = entry.category_ja?.toLowerCase() || "";
    const catEn = entry.category_en?.toLowerCase() || "";

    const matchesSearch =
      query === "" ||
      titleJa.includes(query) ||
      titleEn.includes(query) ||
      descJa.includes(query) ||
      descEn.includes(query) ||
      catJa.includes(query) ||
      catEn.includes(query);

    const matchesCategory =
      category === "all" ||
      entry.category_en === category ||
      entry.category_ja === category;

    return matchesSearch && matchesCategory;
  }

  /**
   * Update the display based on filters and sorting.
   * @returns {void}
   */
  function updateDisplay() {
    let filtered = entries;

    // 1. Filter by Search and Category
    if (searchQuery || selectedCategory !== "all") {
      filtered = entries.filter(function(entry) {
        return matchesFilters(entry, searchQuery, selectedCategory);
      });
    }

    // 2. Sort
    filtered.sort(function(a, b) {
      if (sortBy === "danger") {
        const d1 = a.danger_level || 0;
        const d2 = b.danger_level || 0;
        return d2 - d1; // Higher danger first
      }

      if (sortBy === "encounter") {
        const rankA =
          encounterRank[a.encounter_en] || encounterRank[a.encounter_ja] || 0;
        const rankB =
          encounterRank[b.encounter_en] || encounterRank[b.encounter_ja] || 0;
        return rankB - rankA; // More common first
      }

      // Default: sort by ID
      return b.id - a.id;
    });

    renderEntries(filtered, currentLang);
  }

  // Setup search event
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", function(e) {
      searchQuery = e.target.value.toLowerCase().trim();
      updateDisplay();
    });
  }

  // Setup sort event
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", function(e) {
      sortBy = e.target.value;
      updateDisplay();
    });
  }

  // Setup category filters
  const categoryContainer = document.getElementById("category-filters");
  if (categoryContainer) {
    // Extract unique categories
    const categories = new Map(); // value -> label
    loadedEntries.forEach(function(entry) {
      if (entry.category_ja && entry.category_en) {
        categories.set(entry.category_ja, {
          ja: entry.category_ja,
          en: entry.category_en,
        });
      }
    });

    categoryContainer.innerHTML = "";

    // Add "All" button
    const allBtn = document.createElement("button");
    allBtn.className = "filter-btn active";
    allBtn.dataset.category = "all";

    const allSpanJa = document.createElement("span");
    allSpanJa.className = "cat-ja";
    allSpanJa.textContent = "すべて";

    const allSpanEn = document.createElement("span");
    allSpanEn.className = "cat-en";
    allSpanEn.textContent = "All";

    allBtn.appendChild(allSpanJa);
    allBtn.appendChild(allSpanEn);

    categoryContainer.appendChild(allBtn);

    categories.forEach(function(cat) {
      const btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.dataset.category = cat.ja;

      const spanJa = document.createElement("span");
      spanJa.className = "cat-ja";
      spanJa.textContent = cat.ja;

      const spanEn = document.createElement("span");
      spanEn.className = "cat-en";
      spanEn.textContent = cat.en;

      btn.appendChild(spanJa);
      btn.appendChild(spanEn);

      categoryContainer.appendChild(btn);
    });

    categoryContainer.addEventListener("click", function(e) {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;

      document
        .querySelectorAll(".filter-btn")
        .forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");

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
