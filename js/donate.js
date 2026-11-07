/**
 * Donation Page Rendering Logic
 * Scholar Q&A Website
 * Dynamically renders donation QR code and verified bank transfer details from data/site.json
 */

(function () {
  'use strict';

  async function initDonationPage() {
    const qrContainer = document.getElementById('donation-qr-container');
    const bankContainer = document.getElementById('donation-bank-container');
    const noteContainer = document.getElementById('donation-note-container');

    try {
      const siteData = await window.DataLoader.loadSiteInfo();
      const donation = siteData.donation || {};
      const bank = donation.bankDetails || {};

      // 1. Render Cause Note
      if (noteContainer && donation.note) {
        noteContainer.textContent = donation.note;
      }

      // 2. Render QR Code Card
      if (qrContainer) {
        const qrImageSrc = donation.qrImage || 'assets/images/qr-code.png';
        qrContainer.innerHTML = `
          <div class="qr-box">
            <h3 style="font-size: var(--font-size-md); color: var(--color-primary-dark); margin-bottom: var(--space-xs);">
              Scan to Donate
            </h3>
            <p style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-bottom: var(--space-md);">
              Scan using PhonePe, Google Pay, Paytm, or any UPI banking app.
            </p>
            <div class="qr-image-wrapper">
              <img src="${window.QAUtils.escapeHTML(qrImageSrc)}" 
                   alt="Donation UPI QR Code for ${window.QAUtils.escapeHTML(bank.accountHolder || 'Religious Services')}"
                   onerror="this.onerror=null; this.src='assets/images/qr-placeholder.svg';"
                   style="width: 100%; height: auto; display: block; border-radius: var(--border-radius-sm);"
                   width="260"
                   height="260">
            </div>
            <div style="background-color: var(--color-bg-alt); padding: var(--space-xs) var(--space-sm); border-radius: var(--border-radius-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-primary-dark);">
              Verified Name: ${window.QAUtils.escapeHTML(bank.accountHolder || 'Mohd Ali Rizvi')}
            </div>
          </div>
        `;
      }

      // 3. Render Bank Details Table / Rows
      if (bankContainer) {
        const fields = [
          { label: 'Account Holder Name', value: bank.accountHolder, copyable: true },
          { label: 'Bank Name', value: bank.bankName, copyable: false },
          { label: 'Account Number', value: bank.accountNumber, copyable: true },
          { label: 'Branch', value: bank.branch, copyable: false },
          { label: 'IFSC / Routing Code', value: bank.ifsc, copyable: true }
        ];

        const rowsHtml = fields
          .filter(f => f.value && f.value.trim() !== '')
          .map(f => {
            const escapedVal = window.QAUtils.escapeHTML(f.value);
            const copyBtn = f.copyable 
              ? `<button type="button" class="btn-copy" data-copy="${escapedVal}">Copy</button>`
              : '';

            return `
              <div class="bank-detail-row">
                <span class="bank-detail-label">${window.QAUtils.escapeHTML(f.label)}</span>
                <div class="bank-detail-value-wrapper">
                  <span class="bank-detail-value">${escapedVal}</span>
                  ${copyBtn}
                </div>
              </div>
            `;
          }).join('');

        bankContainer.innerHTML = rowsHtml || '<div class="alert alert-info">Bank details will be updated shortly.</div>';

        // Attach click listeners to all copy buttons
        bankContainer.querySelectorAll('.btn-copy').forEach(btn => {
          btn.addEventListener('click', function () {
            const textToCopy = this.getAttribute('data-copy');
            if (textToCopy) {
              window.QAUtils.copyToClipboard(textToCopy, this);
            }
          });
        });
      }

    } catch (err) {
      console.error('Failed to load donation info', err);
      if (bankContainer) {
        bankContainer.innerHTML = `
          <div class="alert alert-warning">
            Donation information is temporarily unavailable. Please check back shortly.
          </div>
        `;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDonationPage);
  } else {
    initDonationPage();
  }
})();

