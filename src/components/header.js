import { labels } from '../i18n/labels.js';

/**
 * Render the site header and set up language toggle
 * @param {number} entryCount - The total number of entries.
 * @param {string} lang - The initial language.
 * @param {Function} onLangChange - Callback function for when language changes.
 * @returns {void}
 */
export function initHeader(entryCount, lang, onLangChange) {
    const subtitle = document.getElementById('site-subtitle');
    const countEl = document.getElementById('entry-count');
    const toggleBtn = document.getElementById('lang-toggle');

    /**
     * Update the header text and toggle state based on language.
     * @param {string} currentLang - The language to update the header for.
     * @returns {void}
     */
    function updateHeader(currentLang) {
        subtitle.textContent = labels[currentLang].subtitle;
        countEl.textContent = labels[currentLang].entryCount(entryCount);

        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.placeholder = labels[currentLang].searchPlaceholder;
        }

        const sortLabel = document.getElementById('sort-label');
        if (sortLabel) sortLabel.textContent = labels[currentLang].sortLabel;

        const sortOptId = document.getElementById('sort-opt-id');
        if (sortOptId) sortOptId.textContent = labels[currentLang].sortId;

        const sortOptDanger = document.getElementById('sort-opt-danger');
        if (sortOptDanger) sortOptDanger.textContent = labels[currentLang].sortDanger;

        const sortOptEncounter = document.getElementById('sort-opt-encounter');
        if (sortOptEncounter) sortOptEncounter.textContent = labels[currentLang].sortEncounter;

        toggleBtn.querySelectorAll('.lang-option').forEach(function(el) {
            el.classList.toggle('active', el.dataset.lang === currentLang);
        });
    }

    updateHeader(lang);

    toggleBtn.addEventListener('click', function() {
        const newLang = lang === 'ja' ? 'en' : 'ja';
        lang = newLang;
        updateHeader(newLang);
        onLangChange(newLang);
    });
}
