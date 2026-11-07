/**
 * Single Question Page Renderer
 * Scholar Q&A Website
 * Renders full question, answer text, permanent link copy button, and tombstone handling.
 */

(function () {
  'use strict';

  async function initQuestionPage() {
    const rawId = window.QAUtils.getParam('id');
    const container = document.getElementById('question-view-container');
    const breadcrumbTopic = document.getElementById('breadcrumb-topic');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');

    if (!container) return;

    if (!rawId || isNaN(parseInt(rawId, 10))) {
      renderTombstone('No question identifier was provided.');
      return;
    }

    const questionId = parseInt(rawId, 10);

    try {
      const [qaList, topics] = await Promise.all([
        window.DataLoader.loadQA(),
        window.DataLoader.loadTopics()
      ]);

      const item = qaList.find(q => q.id === questionId);

      if (!item) {
        renderTombstone('This answer is no longer available or the link may be incorrect.');
        return;
      }

      const topicDef = topics.find(t => t.slug === item.topic);
      const topicName = topicDef ? topicDef.name : item.topic;

      // Update document title and breadcrumbs
      document.title = `${item.question} — Ayatullah Syed Sibtain Abbas Rizvi`;
      if (breadcrumbTopic) {
        breadcrumbTopic.textContent = topicName;
        breadcrumbTopic.setAttribute('href', `topic.html?topic=${encodeURIComponent(item.topic)}`);
      }
      if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = `Question #${item.id}`;
      }

      // Format answer paragraphs safely
      const paragraphs = (item.answer || '')
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p>${window.QAUtils.escapeHTML(p)}</p>`)
        .join('');

      const formattedAnsweredDate = window.QAUtils.formatDate(item.answeredOn);
      const isNew = window.QAUtils.isRecent(item.answeredOn, 7);
      const newBadge = isNew ? '<span class="badge badge-new" style="margin-left: 6px;">New</span>' : '';
      
      const updatedInfo = item.updatedOn 
        ? `<span style="color: var(--color-text-subtle); margin-left: 8px;">&bull; Last updated on ${window.QAUtils.formatDate(item.updatedOn)}</span>` 
        : '';

      container.innerHTML = `
        <article class="question-view-card">
          <header class="question-view-header">
            <div class="qa-card-meta" style="font-size: var(--font-size-sm); margin-bottom: var(--space-xs);">
              <a href="topic.html?topic=${encodeURIComponent(item.topic)}" class="badge badge-topic">
                ${window.QAUtils.escapeHTML(topicName)}
              </a>
              <span>&bull;</span>
              <time datetime="${item.answeredOn}">Answered on ${formattedAnsweredDate}</time>
              ${newBadge}
              ${updatedInfo}
            </div>
            <h1 class="question-view-title">${window.QAUtils.escapeHTML(item.question)}</h1>
          </header>

          <div class="answer-lead-label">
            <span>&#9670;</span> Ruling &amp; Answer
          </div>

          <div class="answer-body">
            ${paragraphs}
          </div>

          <footer class="qa-toolbar">
            <div style="display: flex; gap: var(--space-xs); align-items: center; flex-wrap: wrap;">
              <button type="button" class="btn btn-copy" id="copy-permalink-btn" style="padding: 0.4rem 0.85rem; font-size: var(--font-size-sm);">
                <span>&#128279;</span> Copy Permanent Link
              </button>
              <a href="topic.html?topic=${encodeURIComponent(item.topic)}" class="btn btn-outline btn-sm">
                &larr; More rulings on ${window.QAUtils.escapeHTML(topicName)}
              </a>
            </div>
            <div>
              <a href="ask.html" class="btn btn-primary btn-sm">Ask a Related Question &rarr;</a>
            </div>
          </footer>
        </article>
      `;

      // Attach copy button handler
      const copyBtn = document.getElementById('copy-permalink-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          window.QAUtils.copyToClipboard(window.location.href, this);
        });
      }

    } catch (err) {
      console.error('Failed to load question', err);
      container.innerHTML = `
        <div class="alert alert-error">
          Failed to load the requested answer. Please try refreshing the page.
        </div>
      `;
    }

    function renderTombstone(message) {
      if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'Answer Not Available';
      document.title = 'Answer Not Available — Ayatullah Syed Sibtain Abbas Rizvi';

      container.innerHTML = `
        <div class="card" style="padding: var(--space-2xl); text-align: center; margin-bottom: var(--space-2xl);">
          <div style="font-size: 3rem; color: var(--color-accent); line-height: 1; margin-bottom: var(--space-md);">
            &#9888;
          </div>
          <h2 class="empty-state-title" style="margin-bottom: var(--space-sm);">
            Answer No Longer Available
          </h2>
          <p style="color: var(--color-text-muted); font-size: var(--font-size-base); max-width: 500px; margin: 0 auto var(--space-xl) auto; line-height: var(--line-height-relaxed);">
            ${window.QAUtils.escapeHTML(message)} It may have been archived, revised under a different ID, or the address link may be mistyped.
          </p>
          <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: var(--space-sm);">
            <a href="topics.html" class="btn btn-primary btn-sm">Browse A–Z Topics Index &rarr;</a>
            <a href="index.html" class="btn btn-outline btn-sm">Return to Home</a>
            <a href="ask.html" class="btn btn-secondary btn-sm">Submit This Question</a>
          </div>
        </div>
      `;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuestionPage);
  } else {
    initQuestionPage();
  }
})();

