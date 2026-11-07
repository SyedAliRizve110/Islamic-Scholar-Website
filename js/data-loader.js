/**
 * Central Data Loader Module
 * Scholar Q&A Website
 * Provides cached, centralized asynchronous loading for JSON data files.
 */

(function (window) {
  'use strict';

  // In-memory cache holding resolved data objects
  const cache = {
    qa: null,
    topics: null,
    site: null
  };

  /**
   * Determine relative path prefix to the project root
   * Works whether the file is loaded from root or a subpath
   */
  function getDataPath(filename) {
    // If the site is served from a nested directory or file protocol,
    // ensure we can resolve relative to where data/ is expected.
    return `data/${filename}`;
  }

  /**
   * Generic fetch helper with JSON parsing and error handling
   * @param {string} url - Target URL or path
   * @returns {Promise<any>}
   */
  async function fetchJSON(url) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: Failed to load ${url}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`DataLoader error loading ${url}:`, err);
      throw err;
    }
  }

  const DataLoader = {
    /**
     * Load Q&A database from data/qa.json (cached)
     * @param {boolean} [forceReload=false] - Force bypass cache
     * @returns {Promise<Array>}
     */
    async loadQA(forceReload = false) {
      if (!forceReload && cache.qa) {
        return cache.qa;
      }
      const data = await fetchJSON(getDataPath('qa.json'));
      cache.qa = Array.isArray(data) ? data : [];
      return cache.qa;
    },

    /**
     * Load Topic definitions from data/topics.json (cached)
     * @param {boolean} [forceReload=false] - Force bypass cache
     * @returns {Promise<Array>}
     */
    async loadTopics(forceReload = false) {
      if (!forceReload && cache.topics) {
        return cache.topics;
      }
      const data = await fetchJSON(getDataPath('topics.json'));
      cache.topics = Array.isArray(data) ? data : [];
      return cache.topics;
    },

    /**
     * Load Site information (contact, donation, scholar meta) from data/site.json (cached)
     * @param {boolean} [forceReload=false] - Force bypass cache
     * @returns {Promise<Object>}
     */
    async loadSiteInfo(forceReload = false) {
      if (!forceReload && cache.site) {
        return cache.site;
      }
      const data = await fetchJSON(getDataPath('site.json'));
      cache.site = data && typeof data === 'object' ? data : {};
      return cache.site;
    },

    /**
     * Clear all in-memory caches
     */
    clearCache() {
      cache.qa = null;
      cache.topics = null;
      cache.site = null;
    }
  };

  window.DataLoader = DataLoader;
})(window);

