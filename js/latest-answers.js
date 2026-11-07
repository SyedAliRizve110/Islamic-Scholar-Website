/**
 * Home Page Latest Answers Panel Engine
 * Scholar Q&A Website
 * Dynamically mounts the 5 newest answers into #latest-answers-panel with 7-day "New" badges.
 */

(function () {
  'use strict';

  async function initLatestAnswersPanel() {
    const panel = document.getElementById('latest-answers-panel');
    if (!panel) return;

    try {
      const [qaList, topics] = await Promise.all([
        window.DataLoader.loadQA(),
        window.DataLoader.loadTopics()
      ]);

      const topicsMap = {};
      topics.forEach(t => {
        topicsMap[t.slug] = t.name;
      });

      // Sort newest first by answeredOn descending, fallback to id
      const sorted = [...qaList].sort((a, b) => {
        if (b.answeredOn && a.answeredOn) {
          return b.answeredOn.localeCompare(a.answeredOn);
        }
        return b.id - a.id;
      });

      // Take the 5 newest entries
      const latestFive = sorted.slice(0, 5);

      if (latestFive.length === 0) {
        panel.innerHTML = `
          <div class="panel-header">
            <h3>Latest Answers</h3>
          </div>
          <div class="panel-body">
            <p style="font-size: var(--font-size-sm); color: var(--color-text-muted);">
              No answers published yet. Check back soon.
            </p>
          </div>
        `;
        return;
      }

      const itemsHtml = latestFive.map(item => {
        const topicName = topicsMap[item.topic] || item.topic;
        const formattedDate = window.QAUtils.formatDate(item.answeredOn);
        const isNew = window.QAUtils.isRecent(item.answeredOn, 7);
        const newBadge = isNew ? '<span class="badge badge-new" style="margin-left: 4px;">New</span>' : '';

        return `
          <li style="border-bottom: 1px solid var(--color-border-light); padding-bottom: var(--space-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2xs); font-size: var(--font-size-xs);">
              <a href="topic.html?topic=${encodeURIComponent(item.topic)}" class="badge badge-topic">
                ${window.QAUtils.escapeHTML(topicName)}
              </a>
              <div>
                <time datetime="${item.answeredOn}" style="color: var(--color-text-muted);">${formattedDate}</time>
                ${newBadge}
              </div>
            </div>
            <a href="question.html?id=${item.id}" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-primary-dark); text-decoration: none; display: block; line-height: var(--line-height-tight);">
              ${window.QAUtils.escapeHTML(item.question)}
            </a>
          </li>
        `;
      }).join('');

      panel.innerHTML = `
        <div class="panel-header">
          <h3>Latest Answers</h3>
        </div>
        <div class="panel-body">
          <p style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-bottom: var(--space-md);">
            Recent rulings answered and published by Ayatullah Syed Sibtain Abbas Rizvi:
          </p>
          <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-md);">
            ${itemsHtml}
          </ul>
          <div style="margin-top: var(--space-md); text-align: center; border-top: 1px solid var(--color-border-light); padding-top: var(--space-sm);">
            <a href="topics.html" style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-primary); text-decoration: underline;">
              View all answered topics &rarr;
            </a>
          </div>
        </div>
      `;

    } catch (err) {
      console.error('Failed to load latest answers panel', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLatestAnswersPanel);
  } else {
    initLatestAnswersPanel();
  }
})();

