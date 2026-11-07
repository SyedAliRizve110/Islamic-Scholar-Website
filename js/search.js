/**
 * Client-Side Instant Search Engine
 * Scholar Q&A Website
 * Fuzzy search across questions, answers, and topics using Fuse.js.
 */

(function () {
  'use strict';

  let fuseInstance = null;
  let allQAData = [];
  let topicsBySlug = {};

  async function initSearch() {
    const searchInput = document.getElementById('qa-search-input');
    const clearBtn = document.getElementById('qa-search-clear');
    const resultsContainer = document.getElementById('search-results-container');
    const defaultContent = document.getElementById('default-content-container');

    if (!searchInput || !resultsContainer) return;

    try {
      const [qaList, topics] = await Promise.all([
        window.DataLoader.loadQA(),
        window.DataLoader.loadTopics()
      ]);

      allQAData = qaList;
      topics.forEach(t => {
        topicsBySlug[t.slug] = t.name;
      });

      // Prepare items with human-readable topic names for higher search relevance
      const searchableItems = qaList.map(item => ({
        ...item,
        topicName: topicsBySlug[item.topic] || item.topic
      }));

      // Initialize Fuse.js instance
      if (typeof window.Fuse === 'function') {
        fuseInstance = new window.Fuse(searchableItems, {
          keys: [
            { name: 'question', weight: 0.45 },
            { name: 'answer', weight: 0.35 },
            { name: 'topicName', weight: 0.20 }
          ],
          threshold: 0.4,
          minMatchCharLength: 2,
          ignoreLocation: true
        });
      }

      let debounceTimer = null;

      function performSearch(query) {
        const trimmed = (query || '').trim();

        if (!trimmed) {
          // Clear and restore normal view
          resultsContainer.style.display = 'none';
          resultsContainer.innerHTML = '';
          if (defaultContent) defaultContent.style.display = 'block';
          if (clearBtn) clearBtn.style.display = 'none';
          return;
        }

        if (clearBtn) clearBtn.style.display = 'flex';
        if (defaultContent) defaultContent.style.display = 'none';
        resultsContainer.style.display = 'block';

        if (!fuseInstance) {
          resultsContainer.innerHTML = `
            <div class="alert alert-warning">
              Search engine is initializing. Please try again in a moment.
            </div>
          `;
          return;
        }

        const matches = fuseInstance.search(trimmed);

        if (matches.length === 0) {
          resultsContainer.innerHTML = `
            <div class="search-results-header">
              <span style="font-weight: var(--font-weight-semibold); color: var(--color-primary-dark);">
                Search results for &ldquo;${window.QAUtils.escapeHTML(trimmed)}&rdquo;
              </span>
              <span class="badge badge-count">0 found</span>
            </div>
            <div class="empty-state">
              <h3 class="empty-state-title">No Answers Found</h3>
              <p style="margin-bottom: var(--space-md);">
                No published rulings matched &ldquo;<strong>${window.QAUtils.escapeHTML(trimmed)}</strong>&rdquo;.
              </p>
              <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-lg);">
                Try checking for spelling variations or browse questions by topic.
              </p>
              <a href="ask.html" class="btn btn-primary btn-sm">Ask the Scholar This Question &rarr;</a>
            </div>
          `;
          return;
        }

        const countLabel = matches.length === 1 ? '1 result' : `${matches.length} results`;
        const resultsListHtml = matches.map(match => {
          const item = match.item;
          const topicName = topicsBySlug[item.topic] || item.topic;
          const formattedDate = window.QAUtils.formatDate(item.answeredOn);
          const excerpt = window.QAUtils.truncate(item.answer, 180);
          const isNew = window.QAUtils.isRecent(item.answeredOn, 7);
          const newBadgeHtml = isNew ? '<span class="badge badge-new" style="margin-left: 6px;">New</span>' : '';

          return `
            <article class="qa-card" style="margin-bottom: var(--space-md);">
              <div class="qa-card-meta">
                <a href="topic.html?topic=${encodeURIComponent(item.topic)}" class="badge badge-topic">
                  ${window.QAUtils.escapeHTML(topicName)}
                </a>
                <span>&bull;</span>
                <time datetime="${item.answeredOn}">${formattedDate}</time>
                ${newBadgeHtml}
              </div>
              <h3 class="qa-card-question">
                <a href="question.html?id=${item.id}">
                  ${window.QAUtils.escapeHTML(item.question)}
                </a>
              </h3>
              <p class="qa-card-excerpt">
                ${window.QAUtils.escapeHTML(excerpt)}
              </p>
              <div>
                <a href="question.html?id=${item.id}" class="btn btn-sm btn-outline">
                  Read Full Ruling &rarr;
                </a>
              </div>
            </article>
          `;
        }).join('');

        resultsContainer.innerHTML = `
          <div class="search-results-header">
            <span style="font-weight: var(--font-weight-semibold); color: var(--color-primary-dark);">
              Search results for &ldquo;${window.QAUtils.escapeHTML(trimmed)}&rdquo;
            </span>
            <span class="badge badge-count">${countLabel}</span>
          </div>
          <div class="qa-list">
            ${resultsListHtml}
          </div>
        `;
      }

      // Input event listener with debounce
      searchInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        const query = this.value;
        debounceTimer = setTimeout(() => {
          performSearch(query);
        }, 250);
      });

      // Clear button listener
      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          searchInput.value = '';
          searchInput.focus();
          performSearch('');
        });
      }

      // Keyboard Esc key listener
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          this.value = '';
          performSearch('');
        }
      });

      // Check if URL contains query parameter (?q=...)
      const initialQuery = window.QAUtils.getParam('q');
      if (initialQuery) {
        searchInput.value = initialQuery;
        performSearch(initialQuery);
      }

    } catch (err) {
      console.error('Failed to initialize search', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();

