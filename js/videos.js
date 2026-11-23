/**
 * Videos & Lectures Page Controller
 * Ayatullah Syed Sibtain Abbas Rizvi Portal
 * Handles playlist switching, embedded YouTube player theater mode, and playlist card interactions.
 */

(function () {
  'use strict';

  let playlistsData = [];
  let currentActiveId = null;
  let currentFilter = 'all';

  /**
   * Initialize page logic once DOM is ready
   */
  async function init() {
    try {
      if (!window.DataLoader || !window.DataLoader.loadLectures) {
        throw new Error('DataLoader.loadLectures is not defined.');
      }

      playlistsData = await window.DataLoader.loadLectures();

      if (!playlistsData || playlistsData.length === 0) {
        renderError('No video playlists found in directory.');
        return;
      }

      // Check URL query param or hash for initial playlist
      const urlParam = window.QAUtils ? window.QAUtils.getParam('playlist') : null;
      const hashId = window.location.hash ? window.location.hash.replace('#', '') : null;
      const targetId = urlParam || hashId;

      const matched = playlistsData.find(p => p.id === targetId);
      currentActiveId = matched ? matched.id : playlistsData[0].id;

      renderTabs();
      renderTheater(currentActiveId);
      renderGrid();
      bindEvents();
    } catch (err) {
      console.error('Failed to load video lectures:', err);
      renderError('Unable to load video lectures at this moment. Please check your connection.');
    }
  }

  /**
   * Render playlist selection tabs
   */
  function renderTabs() {
    const tabsContainer = document.getElementById('playlist-tabs-container');
    if (!tabsContainer) return;

    let html = `
      <button type="button" 
              class="playlist-tab-btn ${currentFilter === 'all' ? 'is-active' : ''}" 
              data-filter="all">
        All Playlists
        <span class="badge-count">${playlistsData.length}</span>
      </button>
    `;

    playlistsData.forEach(p => {
      const isActive = currentFilter === p.id;
      html += `
        <button type="button" 
                class="playlist-tab-btn ${isActive ? 'is-active' : ''}" 
                data-filter="${p.id}">
          ${window.QAUtils ? window.QAUtils.escapeHTML(p.shortTitle || p.title) : p.title}
          <span class="badge-count">${window.QAUtils ? window.QAUtils.escapeHTML(p.videoCount) : ''}</span>
        </button>
      `;
    });

    tabsContainer.innerHTML = html;
  }

  /**
   * Render or update the Theater Stage player
   * @param {string} playlistId 
   */
  function renderTheater(playlistId) {
    const theaterContainer = document.getElementById('theater-player-section');
    if (!theaterContainer) return;

    const playlist = playlistsData.find(p => p.id === playlistId) || playlistsData[0];
    currentActiveId = playlist.id;

    const tagsHtml = (playlist.tags || []).map(t => `
      <span class="badge badge-topic">${window.QAUtils ? window.QAUtils.escapeHTML(t) : t}</span>
    `).join('');

    const embedUrl = `https://www.youtube-nocookie.com/embed/videoseries?list=${playlist.id}&rel=0`;

    theaterContainer.innerHTML = `
      <div class="video-theater-card" id="theater-card">
        <div class="video-player-container">
          <iframe 
            id="main-youtube-iframe"
            src="${embedUrl}" 
            title="${window.QAUtils ? window.QAUtils.escapeHTML(playlist.title) : playlist.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin" 
            allowfullscreen>
          </iframe>
        </div>
        <div class="video-theater-meta">
          <div class="video-theater-header">
            <div>
              <div style="display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-2xs); flex-wrap: wrap;">
                <span class="video-channel-tag">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align: middle;">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  ${window.QAUtils ? window.QAUtils.escapeHTML(playlist.channel) : playlist.channel}
                </span>
                <span class="video-count-badge">${window.QAUtils ? window.QAUtils.escapeHTML(playlist.videoCount) : ''}</span>
                <span class="badge" style="background-color: var(--color-bg-alt); color: var(--color-text-muted);">${window.QAUtils ? window.QAUtils.escapeHTML(playlist.badge || '') : ''}</span>
              </div>
              <h2 class="video-theater-title">${window.QAUtils ? window.QAUtils.escapeHTML(playlist.title) : playlist.title}</h2>
              <div class="video-theater-tags">${tagsHtml}</div>
            </div>
            <div style="font-size: var(--font-size-sm); color: var(--color-text-muted); text-align: right;">
              <div><strong>Recorded:</strong> ${window.QAUtils ? window.QAUtils.escapeHTML(playlist.year || 'Archive') : ''}</div>
              <div>${window.QAUtils ? window.QAUtils.escapeHTML(playlist.location || '') : ''}</div>
            </div>
          </div>

          <p class="video-theater-desc">${window.QAUtils ? window.QAUtils.escapeHTML(playlist.description) : playlist.description}</p>

          <div class="video-theater-actions">
            <a href="${playlist.playlistUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary">
              Watch on YouTube &rarr;
            </a>
            <button type="button" class="btn-copy" id="copy-theater-link" data-url="${playlist.playlistUrl}">
              <span>Copy Playlist Link</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Bind copy button
    const copyBtn = document.getElementById('copy-theater-link');
    if (copyBtn && window.QAUtils) {
      copyBtn.addEventListener('click', function () {
        window.QAUtils.copyToClipboard(playlist.playlistUrl, copyBtn);
      });
    }

    // Highlight active card in grid
    updateActiveCardHighlight();
  }

  /**
   * Render the 3-column / grid cards for all playlists
   */
  function renderGrid() {
    const gridContainer = document.getElementById('playlists-grid');
    if (!gridContainer) return;

    const visiblePlaylists = currentFilter === 'all'
      ? playlistsData
      : playlistsData.filter(p => p.id === currentFilter);

    if (visiblePlaylists.length === 0) {
      gridContainer.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--color-text-muted);">No playlists found for this filter.</p>`;
      return;
    }

    const html = visiblePlaylists.map(p => {
      const isCurrentlyActive = p.id === currentActiveId;
      const embedUrl = `https://www.youtube-nocookie.com/embed/videoseries?list=${p.id}&rel=0`;

      const highlightsList = (p.highlights || []).map(h => `
        <li>${window.QAUtils ? window.QAUtils.escapeHTML(h) : h}</li>
      `).join('');

      return `
        <article class="video-card ${isCurrentlyActive ? 'is-active-card' : ''}" data-id="${p.id}" id="card-${p.id}">
          <div class="video-card-player-frame">
            <iframe 
              src="${embedUrl}" 
              title="${window.QAUtils ? window.QAUtils.escapeHTML(p.title) : p.title}" 
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerpolicy="strict-origin-when-cross-origin" 
              allowfullscreen>
            </iframe>
          </div>

          <div class="video-card-body">
            <div class="video-card-meta">
              <span class="video-channel-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align: middle;">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                ${window.QAUtils ? window.QAUtils.escapeHTML(p.channel) : p.channel}
              </span>
              <span class="video-count-badge">${window.QAUtils ? window.QAUtils.escapeHTML(p.videoCount) : ''}</span>
            </div>

            <h3 class="video-card-title">${window.QAUtils ? window.QAUtils.escapeHTML(p.title) : p.title}</h3>
            
            <p class="video-card-desc">${window.QAUtils ? window.QAUtils.escapeHTML(p.description) : p.description}</p>

            ${highlightsList ? `
              <div style="font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-primary-dark); margin-bottom: 4px;">Key Discourse Themes:</div>
              <ul class="video-highlights-list">
                ${highlightsList}
              </ul>
            ` : ''}

            <div class="video-card-footer">
              <button type="button" class="btn btn-sm btn-secondary select-theater-btn" data-id="${p.id}">
                ${isCurrentlyActive ? '&#9658; Now in Theater' : 'Play in Main Stage'}
              </button>
              <a href="${p.playlistUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline" style="font-size: var(--font-size-xs);">
                YouTube &rarr;
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    gridContainer.innerHTML = html;
  }

  /**
   * Update border highlighting on active playlist card
   */
  function updateActiveCardHighlight() {
    const cards = document.querySelectorAll('.video-card');
    cards.forEach(card => {
      const isCurrent = card.getAttribute('data-id') === currentActiveId;
      if (isCurrent) {
        card.classList.add('is-active-card');
      } else {
        card.classList.remove('is-active-card');
      }
      const selectBtn = card.querySelector('.select-theater-btn');
      if (selectBtn) {
        selectBtn.innerHTML = isCurrent ? '&#9658; Now in Theater' : 'Play in Main Stage';
      }
    });
  }

  /**
   * Attach delegated click listeners
   */
  function bindEvents() {
    // Tab filter clicks
    const tabsContainer = document.getElementById('playlist-tabs-container');
    if (tabsContainer) {
      tabsContainer.addEventListener('click', function (e) {
        const btn = e.target.closest('.playlist-tab-btn');
        if (!btn) return;
        const filter = btn.getAttribute('data-filter');
        currentFilter = filter;

        // If a specific playlist tab is clicked, also make it active in theater
        if (filter !== 'all') {
          renderTheater(filter);
        }

        renderTabs();
        renderGrid();
      });
    }

    // Grid card action clicks
    const gridContainer = document.getElementById('playlists-grid');
    if (gridContainer) {
      gridContainer.addEventListener('click', function (e) {
        const theaterBtn = e.target.closest('.select-theater-btn');
        if (theaterBtn) {
          const pid = theaterBtn.getAttribute('data-id');
          if (pid) {
            renderTheater(pid);
            // Smoothly scroll to theater card
            const theaterCard = document.getElementById('theater-card');
            if (theaterCard) {
              theaterCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }
      });
    }
  }

  /**
   * Render error banner in case of loading issues
   */
  function renderError(message) {
    const theaterContainer = document.getElementById('theater-player-section');
    if (theaterContainer) {
      theaterContainer.innerHTML = `
        <div class="alert alert-error" style="margin-bottom: var(--space-xl);">
          <strong>Notice:</strong> ${window.QAUtils ? window.QAUtils.escapeHTML(message) : message}
        </div>
      `;
    }
  }

  // Run on DOMContentLoaded or immediately if already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
