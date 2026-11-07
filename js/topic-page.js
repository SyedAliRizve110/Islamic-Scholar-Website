/**
 * Single Topic Page Renderer
 * Scholar Q&A Website
 * Renders all questions for a selected topic slug with newest rulings first.
 */

(function () {
  'use strict';

  async function initTopicPage() {
    const slug = window.QAUtils.getParam('topic');
    const titleContainer = document.getElementById('topic-title');
    const breadcrumbContainer = document.getElementById('topic-breadcrumb');
    const countContainer = document.getElementById('topic-count');
    const listContainer = document.getElementById('topic-qa-list');

    if (!listContainer) return;

    if (!slug) {
      listContainer.innerHTML = `
        <div class="alert alert-warning">
          No topic was selected. Please <a href="topics.html">browse the A–Z Topics Index</a> to pick a topic.
        </div>
      `;
      return;
    }

    try {
      const [topics, qaList] = await Promise.all([
        window.DataLoader.loadTopics(),
        window.DataLoader.loadQA()
      ]);

      // Locate topic definition
      const topic = topics.find(t => t.slug === slug);
      const topicName = topic ? topic.name : slug;

      // Update titles & breadcrumbs
      document.title = `${topicName} — Ayatullah Syed Sibtain Abbas Rizvi`;
      if (titleContainer) titleContainer.textContent = topicName;
      if (breadcrumbContainer) breadcrumbContainer.textContent = topicName;

      if (!topic) {
        listContainer.innerHTML = `
          <div class="empty-state">
            <h3 class="empty-state-title">Topic Not Found</h3>
            <p style="margin-bottom: var(--space-md);">
              The topic &ldquo;<strong>${window.QAUtils.escapeHTML(slug)}</strong>&rdquo; does not exist in our catalog.
            </p>
            <a href="topics.html" class="btn btn-primary btn-sm">Return to Topics Index &rarr;</a>
          </div>
        `;
        return;
      }

      // Filter questions matching this topic
      const filtered = qaList.filter(item => item.topic === slug);

      // Sort newest first by answeredOn or ID
      filtered.sort((a, b) => {
        if (b.answeredOn && a.answeredOn) {
          return b.answeredOn.localeCompare(a.answeredOn);
        }
        return b.id - a.id;
      });

      // Update count banner
      if (countContainer) {
        countContainer.textContent = filtered.length === 1 
          ? '1 answered question published' 
          : `${filtered.length} answered questions published`;
      }

      if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div class="card" style="padding: var(--space-xl); text-align: center;">
            <h3 style="font-size: var(--font-size-lg); color: var(--color-primary-dark); margin-bottom: var(--space-xs);">
              No Questions Published Yet
            </h3>
            <p style="color: var(--color-text-muted); font-size: var(--font-size-sm); margin-bottom: var(--space-lg);">
              There are currently no published rulings recorded under ${window.QAUtils.escapeHTML(topicName)}.
            </p>
            <div style="display: flex; justify-content: center; gap: var(--space-sm);">
              <a href="ask.html" class="btn btn-primary btn-sm">Submit a Question on this Topic &rarr;</a>
              <a href="topics.html" class="btn btn-outline btn-sm">View Other Topics</a>
            </div>
          </div>
        `;
        return;
      }

      // Render Question Cards
      const cardsHtml = filtered.map(item => {
        const formattedDate = window.QAUtils.formatDate(item.answeredOn);
        const excerpt = window.QAUtils.truncate(item.answer, 180);
        const isNew = window.QAUtils.isRecent(item.answeredOn, 7);
        const newBadge = isNew ? '<span class="badge badge-new" style="margin-left: 6px;">New</span>' : '';
        const updatedNotice = item.updatedOn 
          ? `<span style="font-size: var(--font-size-xs); color: var(--color-text-subtle); margin-left: 6px;">(Updated ${window.QAUtils.formatDate(item.updatedOn)})</span>` 
          : '';

        return `
          <article class="qa-card">
            <div class="qa-card-meta">
              <time datetime="${item.answeredOn}">${formattedDate}</time>
              ${newBadge}
              ${updatedNotice}
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
                Read Full Answer &rarr;
              </a>
            </div>
          </article>
        `;
      }).join('');

      listContainer.innerHTML = cardsHtml;

    } catch (err) {
      console.error('Failed to load topic page', err);
      listContainer.innerHTML = `
        <div class="alert alert-error">
          Failed to load questions for this topic. Please try refreshing the page.
        </div>
      `;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTopicPage);
  } else {
    initTopicPage();
  }
})();

