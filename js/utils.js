/**
 * Shared Utilities Module
 * Scholar Q&A Website
 */

(function (window) {
  'use strict';

  const QAUtils = {
    /**
     * Retrieve a query parameter value from the current URL
     * @param {string} name - The parameter name
     * @returns {string|null} The decoded parameter value or null if not present
     */
    getParam(name) {
      if (!window.location.search) return null;
      const params = new URLSearchParams(window.location.search);
      return params.get(name);
    },

    /**
     * Escape special HTML characters to prevent XSS vulnerabilities
     * @param {string} str - Raw input string
     * @returns {string} Escaped HTML string
     */
    escapeHTML(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    /**
     * Format a YYYY-MM-DD date string into human-readable format (e.g., "15 October 2026")
     * @param {string} dateStr - Date string in YYYY-MM-DD
     * @returns {string} Formatted date string
     */
    formatDate(dateStr) {
      if (!dateStr || typeof dateStr !== 'string') return '';
      const parts = dateStr.trim().split('-');
      if (parts.length !== 3) return dateStr;

      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      if (isNaN(year) || isNaN(monthIndex) || isNaN(day) || monthIndex < 0 || monthIndex > 11) {
        return dateStr;
      }

      return `${day} ${months[monthIndex]} ${year}`;
    },

    /**
     * Convert arbitrary string into a URL-friendly slug
     * @param {string} text - Plain text (e.g. "Prayer & Fasting Rules")
     * @returns {string} URL-safe slug (e.g. "prayer-and-fasting-rules")
     */
    slugify(text) {
      if (!text) return '';
      return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/&/g, '-and-')
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    },

    /**
     * Checks if a date string is within the past N days (defaults to 7 days)
     * @param {string} dateStr - Date string in YYYY-MM-DD
     * @param {number} days - Threshold in days
     * @returns {boolean} True if the date is recent
     */
    isRecent(dateStr, days = 7) {
      if (!dateStr) return false;
      try {
        const targetDate = new Date(dateStr);
        if (isNaN(targetDate.getTime())) return false;

        const now = new Date();
        const diffTime = now.getTime() - targetDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        return diffDays >= 0 && diffDays <= days;
      } catch (err) {
        return false;
      }
    },

    /**
     * Truncate a text string cleanly at word boundary with an ellipsis
     * @param {string} text - Original string
     * @param {number} maxLen - Maximum character length
     * @returns {string} Truncated string
     */
    truncate(text, maxLen = 120) {
      if (!text || text.length <= maxLen) return text || '';
      const sub = text.slice(0, maxLen);
      const lastSpace = sub.lastIndexOf(' ');
      return (lastSpace > 0 ? sub.slice(0, lastSpace) : sub) + '…';
    },

    /**
     * Copy text to user clipboard with visual feedback on the triggering button
     * @param {string} text - Text to copy
     * @param {HTMLElement} [buttonElement] - Optional button receiving feedback classes
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text, buttonElement) {
      let success = false;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          success = true;
        } else {
          // Fallback for older browsers or insecure contexts
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          success = document.execCommand('copy');
          document.body.removeChild(textArea);
        }
      } catch (err) {
        console.error('Failed to copy to clipboard', err);
        success = false;
      }

      if (success && buttonElement) {
        const originalText = buttonElement.innerHTML;
        buttonElement.classList.add('is-copied');
        buttonElement.setAttribute('aria-label', 'Copied to clipboard');
        buttonElement.innerHTML = '<span>✓ Copied</span>';

        setTimeout(() => {
          buttonElement.classList.remove('is-copied');
          buttonElement.innerHTML = originalText;
          buttonElement.removeAttribute('aria-label');
        }, 2000);
      }

      return success;
    }
  };

  window.QAUtils = QAUtils;
})(window);

