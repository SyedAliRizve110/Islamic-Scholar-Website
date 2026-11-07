/**
 * Topics Index Engine
 * Scholar Q&A Website
 * Builds alphabetical A-Z index, sticky jump bar, and real-time question counts.
 */

(function () {
  'use strict';

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  async function initTopicsIndex() {
    const jumpBarContainer = document.getElementById('jump-bar-container');
    const indexContainer = document.getElementById('topics-index-container');
    if (!indexContainer) return;

    try {
      const [topics, qaList] = await Promise.all([
        window.DataLoader.loadTopics(),
        window.DataLoader.loadQA()
      ]);

      // Calculate question count for each topic slug
      const countsByTopic = {};
      qaList.forEach(item => {
        if (item.topic) {
          countsByTopic[item.topic] = (countsByTopic[item.topic] || 0) + 1;
        }
      });

      // Group topics by their first uppercase letter
      const groups = {};
      topics.forEach(topic => {
        if (!topic.name) return;
        const firstChar = topic.name.trim().charAt(0).toUpperCase();
        if (!groups[firstChar]) {
          groups[firstChar] = [];
        }
        groups[firstChar].push(topic);
      });

      // Sort topics alphabetically within each group
      Object.keys(groups).forEach(letter => {
        groups[letter].sort((a, b) => a.name.localeCompare(b.name));
      });

      // 1. Build Sticky A-Z Jump Bar
      if (jumpBarContainer) {
        const jumpBarHtml = ALPHABET.map(letter => {
          const hasTopics = Boolean(groups[letter] && groups[letter].length > 0);
          if (hasTopics) {
            return `
              <a href="#letter-${letter}" 
                 class="jump-letter" 
                 aria-label="Jump to letter ${letter}">
                ${letter}
              </a>
            `;
          } else {
            return `
              <span class="jump-letter is-disabled" 
                    aria-hidden="true">
                ${letter}
              </span>
            `;
          }
        }).join('');

        jumpBarContainer.innerHTML = `
          <nav class="jump-bar-wrapper" aria-label="A to Z Jump Bar">
            <div class="container">
              <div class="jump-bar">
                ${jumpBarHtml}
              </div>
            </div>
          </nav>
        `;
      }

      // 2. Build A-Z Topic Index Groups
      let indexHtml = '';
      const lettersWithTopics = ALPHABET.filter(l => groups[l] && groups[l].length > 0);

      if (lettersWithTopics.length === 0) {
        indexContainer.innerHTML = `
          <div class="empty-state">
            <h3 class="empty-state-title">No Topics Available</h3>
            <p>Topics are currently being cataloged. Please check back shortly.</p>
          </div>
        `;
        return;
      }

      lettersWithTopics.forEach(letter => {
        const topicCards = groups[letter].map(topic => {
          const count = countsByTopic[topic.slug] || 0;
          const countLabel = count === 1 ? '1 answer' : `${count} answers`;

          return `
            <a href="topic.html?topic=${encodeURIComponent(topic.slug)}" class="topic-card-link">
              <div class="topic-card">
                <span class="topic-card-name">${window.QAUtils.escapeHTML(topic.name)}</span>
                <span class="badge badge-count">${countLabel}</span>
              </div>
            </a>
          `;
        }).join('');

        indexHtml += `
          <section class="letter-group" id="letter-${letter}" aria-labelledby="heading-${letter}">
            <div class="letter-heading-wrapper">
              <span class="letter-initial" id="heading-${letter}">${letter}</span>
              <div class="letter-divider"></div>
            </div>
            <div class="topic-grid">
              ${topicCards}
            </div>
          </section>
        `;
      });

      indexContainer.innerHTML = indexHtml;

    } catch (err) {
      console.error('Failed to initialize topics index', err);
      indexContainer.innerHTML = `
        <div class="alert alert-error">
          We encountered an error loading the topics index. Please refresh the page.
        </div>
      `;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTopicsIndex);
  } else {
    initTopicsIndex();
  }
})();

