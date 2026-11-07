/**
 * Shared Navigation & Layout Engine
 * Scholar Q&A Website
 * Dynamically injects standardized header and footer into mounting containers.
 */

(function () {
  'use strict';

  // Navigation Links Configuration
  const NAV_ITEMS = [
    { label: 'Home', href: 'index.html', match: ['index.html', ''] },
    { label: 'Biography', href: 'biography.html', match: ['biography.html'] },
    { label: 'Q&A', href: 'topics.html', match: ['topics.html', 'topic.html', 'question.html', 'search.html'] },
    { label: 'Ask a Question', href: 'ask.html', match: ['ask.html', 'ask-success.html'] },
    { label: 'Contact', href: 'contact.html', match: ['contact.html'] },
    { label: 'Donate', href: 'donate.html', match: ['donate.html'] }
  ];

  /**
   * Determine the current page filename from window.location
   */
  function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    return page === '' ? 'index.html' : page;
  }

  /**
   * Render and inject the shared header
   */
  function renderHeader() {
    const headerContainer = document.getElementById('site-header');
    if (!headerContainer) return;

    const currentPage = getCurrentPage();

    const navLinksHtml = NAV_ITEMS.map(item => {
      const isActive = item.match.includes(currentPage);
      const activeClass = isActive ? ' active' : '';
      const ariaCurrent = isActive ? ' aria-current="page"' : '';
      return `
        <li>
          <a href="${item.href}" class="nav-link${activeClass}"${ariaCurrent}>
            ${item.label}
          </a>
        </li>
      `;
    }).join('');

    headerContainer.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <header class="site-header">
        <div class="container">
          <div class="header-inner">
            <a href="index.html" class="brand" aria-label="Ayatullah Syed Sibtain Abbas Rizvi - Home">
              <span class="brand-title">Ayatullah Syed Sibtain Abbas Rizvi</span>
              <span class="brand-tagline">Questions &amp; Answers on Islamic Jurisprudence</span>
            </a>

            <div class="nav-wrapper">
              <button type="button" 
                      class="nav-toggle" 
                      id="nav-toggle-btn"
                      aria-controls="primary-nav" 
                      aria-expanded="false" 
                      aria-label="Toggle navigation menu">
                <span class="nav-toggle-bar"></span>
                <span class="nav-toggle-bar"></span>
                <span class="nav-toggle-bar"></span>
              </button>

              <nav id="primary-nav" class="site-nav" aria-label="Primary Navigation">
                <ul class="nav-list">
                  ${navLinksHtml}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>
    `;

    bindNavEvents();
  }

  /**
   * Bind mobile menu interaction events
   */
  function bindNavEvents() {
    const toggleBtn = document.getElementById('nav-toggle-btn');
    const nav = document.getElementById('primary-nav');
    if (!toggleBtn || !nav) return;

    function openNav() {
      nav.classList.add('is-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    }

    function closeNav() {
      nav.classList.remove('is-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }

    toggleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = nav.classList.contains('is-open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close on navigation link click (useful for on-page anchor navigation)
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        closeNav();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeNav();
      }
    });

    // Close on Escape key press
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        toggleBtn.focus();
      }
    });
  }

  /**
   * Render and inject the shared footer
   */
  function renderFooter() {
    const footerContainer = document.getElementById('site-footer');
    if (!footerContainer) return;

    const currentYear = new Date().getFullYear();

    footerContainer.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-column">
              <h3>Ayatullah Syed Sibtain Abbas Rizvi</h3>
              <p>
                Providing religious guidance and answering inquiries on Islamic jurisprudence
                for the followers of Ahlulbayt (a.s.). Residing in Qum, Iran and India.
              </p>
              <p>
                <a href="biography.html" style="color: var(--color-accent-light);">Read the scholar's biography &rarr;</a>
              </p>
            </div>

            <div class="footer-column">
              <h4>Quick Navigation</h4>
              <ul class="footer-links">
                <li><a href="index.html">Home</a></li>
                <li><a href="biography.html">Biography</a></li>
                <li><a href="topics.html">Browse Questions by Topic</a></li>
                <li><a href="ask.html">Send a Question</a></li>
                <li><a href="contact.html">Contact Information</a></li>
                <li><a href="donate.html">Support &amp; Donations</a></li>
              </ul>
            </div>

            <div class="footer-column" id="footer-contact-column">
              <h4>Contact &amp; Inquiries</h4>
              <p>Have an urgent religious inquiry or wish to reach out directly?</p>
              <div class="footer-contact-item">
                <span>&bull;</span>
                <a href="ask.html">Submit via Question Form</a>
              </div>
              <div class="footer-contact-item">
                <span>&bull;</span>
                <a href="contact.html">View Phone, Address &amp; Office Hours</a>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <div>
              &copy; ${currentYear} Ayatullah Syed Sibtain Abbas Rizvi. All rights reserved.
            </div>
            <div>
              Non-commercial religious guidance resource. Static &amp; privacy-focused.
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      renderHeader();
      renderFooter();
    });
  } else {
    renderHeader();
    renderFooter();
  }
})();

