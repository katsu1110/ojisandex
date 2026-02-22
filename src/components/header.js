import { labels } from '../i18n/labels.js';

/**
 * Render the site header and set up language toggle
 */
export function initHeader(entryCount, lang, onLangChange) {
    const subtitle = document.getElementById('site-subtitle');
    const countEl = document.getElementById('entry-count');
    const toggleBtn = document.getElementById('lang-toggle');

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

        toggleBtn.querySelectorAll('.lang-option').forEach((el) => {
            el.classList.toggle('active', el.dataset.lang === currentLang);
        });
    }

    updateHeader(lang);

    toggleBtn.addEventListener('click', () => {
        const newLang = lang === 'ja' ? 'en' : 'ja';
        lang = newLang;
        updateHeader(newLang);
        onLangChange(newLang);
    });
}
