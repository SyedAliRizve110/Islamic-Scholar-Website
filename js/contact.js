/**
 * Contact Page Rendering Logic
 * Scholar Q&A Website
 * Dynamically renders contact methods and office addresses from data/site.json
 */

(function () {
  'use strict';

  async function initContactPage() {
    const container = document.getElementById('contact-cards-container');
    if (!container) return;

    try {
      const siteData = await window.DataLoader.loadSiteInfo();
      const contact = siteData.contact || {};

      let html = '';

      // Phone Contact Card
      if (contact.phone) {
        const phoneFormatted = contact.phoneFormatted || contact.phone;
        const cleanTel = contact.phone.replace(/[^+\d]/g, '');
        html += `
          <div class="contact-card">
            <div class="contact-card-icon" aria-hidden="true">&#9742;</div>
            <h3 class="contact-card-title">Direct Telephone</h3>
            <p style="font-size: var(--font-size-sm); color: var(--color-text-muted);">
              For direct religious inquiries and official appointments.
            </p>
            <div class="contact-detail">
              <a href="tel:${cleanTel}">${window.QAUtils.escapeHTML(phoneFormatted)}</a>
            </div>
            <div class="contact-actions">
              <a href="tel:${cleanTel}" class="btn btn-primary btn-sm">Tap to Call</a>
            </div>
          </div>
        `;
      }

      // Email Contact Card
      if (contact.email) {
        html += `
          <div class="contact-card">
            <div class="contact-card-icon" aria-hidden="true">&#9993;</div>
            <h3 class="contact-card-title">Official Email</h3>
            <p style="font-size: var(--font-size-sm); color: var(--color-text-muted);">
              For general communications and official queries.
            </p>
            <div class="contact-detail">
              <a href="mailto:${window.QAUtils.escapeHTML(contact.email)}">${window.QAUtils.escapeHTML(contact.email)}</a>
            </div>
            <div class="contact-actions">
              <a href="mailto:${window.QAUtils.escapeHTML(contact.email)}" class="btn btn-outline btn-sm">Send Email</a>
            </div>
          </div>
        `;
      }

      // WhatsApp / Direct Messaging Card
      if (contact.whatsapp) {
        html += `
          <div class="contact-card">
            <div class="contact-card-icon" aria-hidden="true">&#128172;</div>
            <h3 class="contact-card-title">WhatsApp Messaging</h3>
            <p style="font-size: var(--font-size-sm); color: var(--color-text-muted);">
              Direct messaging channel for brief questions and urgent matters.
            </p>
            <div class="contact-detail">
              WhatsApp Available
            </div>
            <div class="contact-actions">
              <a href="${window.QAUtils.escapeHTML(contact.whatsapp)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                Message on WhatsApp &rarr;
              </a>
            </div>
          </div>
        `;
      }

      // Reception / Office Hours Card
      if (contact.hours) {
        html += `
          <div class="contact-card">
            <div class="contact-card-icon" aria-hidden="true">&#128338;</div>
            <h3 class="contact-card-title">Office &amp; Calling Hours</h3>
            <p style="font-size: var(--font-size-sm); color: var(--color-text-muted);">
              Recommended calling hours for direct consultations:
            </p>
            <div class="contact-detail" style="font-size: var(--font-size-base); font-weight: var(--font-weight-medium);">
              ${window.QAUtils.escapeHTML(contact.hours)}
            </div>
          </div>
        `;
      }

      container.innerHTML = html || '<div class="alert alert-info">Contact information will be published shortly.</div>';

      // Render Addresses Section if available
      const addressContainer = document.getElementById('contact-addresses-container');
      if (addressContainer && Array.isArray(contact.addresses) && contact.addresses.length > 0) {
        const addressCards = contact.addresses.map(addr => {
          const lines = Array.isArray(addr.lines) 
            ? addr.lines.map(l => window.QAUtils.escapeHTML(l)).join('<br>')
            : '';
          return `
            <div class="card">
              <div class="card-body">
                <span class="badge badge-topic" style="margin-bottom: var(--space-xs);">${window.QAUtils.escapeHTML(addr.label || 'Office Location')}</span>
                <address style="font-style: normal; line-height: var(--line-height-relaxed); font-size: var(--font-size-base); color: var(--color-text); margin-top: var(--space-sm);">
                  ${lines}
                </address>
              </div>
            </div>
          `;
        }).join('');

        addressContainer.innerHTML = addressCards;
      }

    } catch (err) {
      console.error('Failed to load contact info', err);
      if (container) {
        container.innerHTML = `
          <div class="alert alert-warning">
            Contact information is temporarily unavailable. You may submit questions via our <a href="ask.html">Question Form</a>.
          </div>
        `;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactPage);
  } else {
    initContactPage();
  }
})();

