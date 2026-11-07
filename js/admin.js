/**
 * Admin Publishing Engine
 * Scholar Q&A Website (Local Only)
 * Manages Q&A CRUD, Topic additions, Schema validation, and JSON file exports.
 */

(function () {
  'use strict';

  let loadedQA = [];
  let loadedTopics = [];
  let editingId = null;

  // DOM Elements
  const qaFileInput = document.getElementById('file-qa-json');
  const topicsFileInput = document.getElementById('file-topics-json');
  const statusIndicator = document.getElementById('admin-status-text');
  const statusDot = document.getElementById('admin-status-dot');
  const qaTableBody = document.getElementById('admin-qa-tbody');
  const topicFilter = document.getElementById('admin-filter-topic');
  const searchInput = document.getElementById('admin-search-input');

  // Modals
  const qaModal = document.getElementById('admin-qa-modal');
  const topicModal = document.getElementById('admin-topic-modal');
  const validationModal = document.getElementById('admin-validation-modal');
  const helpModal = document.getElementById('admin-help-modal');

  /**
   * Initialize Admin Page
   */
  async function initAdmin() {
    bindEvents();

    // Auto-load if accessed via HTTP (local server)
    if (window.location.protocol.startsWith('http')) {
      try {
        const [qa, topics] = await Promise.all([
          window.DataLoader.loadQA(),
          window.DataLoader.loadTopics()
        ]);
        loadedQA = Array.isArray(qa) ? JSON.parse(JSON.stringify(qa)) : [];
        loadedTopics = Array.isArray(topics) ? JSON.parse(JSON.stringify(topics)) : [];
        updateStatus();
        renderTopicFilter();
        renderTable();
      } catch (err) {
        console.info('Auto-fetch not available; please load via file inputs.', err);
      }
    }
  }

  function updateStatus() {
    if (statusIndicator) {
      statusIndicator.textContent = `Loaded: ${loadedQA.length} questions, ${loadedTopics.length} topics`;
    }
    if (statusDot) {
      statusDot.classList.remove('is-offline');
    }
  }

  /**
   * Render Filter Options
   */
  function renderTopicFilter() {
    if (!topicFilter) return;
    const currentVal = topicFilter.value;
    topicFilter.innerHTML = '<option value="">All Topics (Filter)</option>';
    loadedTopics.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.slug;
      opt.textContent = t.name;
      if (opt.value === currentVal) opt.selected = true;
      topicFilter.appendChild(opt);
    });
  }

  /**
   * Render Q&A Management Table
   */
  function renderTable() {
    if (!qaTableBody) return;

    const filterTopicVal = topicFilter ? topicFilter.value : '';
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    const topicsMap = {};
    loadedTopics.forEach(t => { topicsMap[t.slug] = t.name; });

    let filtered = loadedQA.filter(item => {
      if (filterTopicVal && item.topic !== filterTopicVal) return false;
      if (query) {
        const matchQ = (item.question || '').toLowerCase().includes(query);
        const matchA = (item.answer || '').toLowerCase().includes(query);
        const matchId = String(item.id) === query;
        if (!matchQ && !matchA && !matchId) return false;
      }
      return true;
    });

    // Sort newest ID first
    filtered.sort((a, b) => b.id - a.id);

    if (filtered.length === 0) {
      qaTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: var(--space-xl); color: var(--color-text-muted);">
            No questions found matching your filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    qaTableBody.innerHTML = filtered.map(item => {
      const topicName = topicsMap[item.topic] || item.topic || '—';
      const questionSnippet = window.QAUtils.truncate(item.question, 90);
      const answeredDate = item.answeredOn || '—';
      const updatedDate = item.updatedOn || '—';

      return `
        <tr>
          <td class="admin-table-id">#${item.id}</td>
          <td><span class="badge badge-topic">${window.QAUtils.escapeHTML(topicName)}</span></td>
          <td style="font-weight: var(--font-weight-medium);">${window.QAUtils.escapeHTML(questionSnippet)}</td>
          <td>${window.QAUtils.escapeHTML(answeredDate)}</td>
          <td style="color: var(--color-text-muted);">${window.QAUtils.escapeHTML(updatedDate)}</td>
          <td class="admin-table-actions">
            <button type="button" class="btn btn-sm btn-outline btn-edit-qa" data-id="${item.id}">Edit</button>
            <button type="button" class="btn btn-sm btn-outline btn-delete-qa" data-id="${item.id}" style="color: var(--color-error); border-color: var(--color-error);">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach table action events
    qaTableBody.querySelectorAll('.btn-edit-qa').forEach(btn => {
      btn.addEventListener('click', function () {
        openEditModal(parseInt(this.getAttribute('data-id'), 10));
      });
    });

    qaTableBody.querySelectorAll('.btn-delete-qa').forEach(btn => {
      btn.addEventListener('click', function () {
        handleDelete(parseInt(this.getAttribute('data-id'), 10));
      });
    });
  }

  /**
   * Open Add Question Modal
   */
  function openAddModal() {
    editingId = null;
    document.getElementById('qa-modal-title').textContent = 'Add New Answer';
    
    // Auto-calculate next non-reused ID
    const maxId = loadedQA.reduce((max, item) => (item.id > max ? item.id : max), 0);
    const nextId = maxId + 1;
    document.getElementById('qa-field-id').value = nextId;

    // Auto-fill today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('qa-field-date').value = today;
    document.getElementById('qa-field-updated').value = '';

    // Populate topic dropdown
    populateModalTopics();

    document.getElementById('qa-field-question').value = '';
    document.getElementById('qa-field-answer').value = '';

    qaModal.classList.add('is-active');
    document.getElementById('qa-field-question').focus();
  }

  /**
   * Open Edit Question Modal
   */
  function openEditModal(id) {
    const item = loadedQA.find(q => q.id === id);
    if (!item) return;

    editingId = id;
    document.getElementById('qa-modal-title').textContent = `Edit Answer #${item.id}`;
    document.getElementById('qa-field-id').value = item.id;
    document.getElementById('qa-field-date').value = item.answeredOn || '';
    
    // Auto-stamp updatedOn to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('qa-field-updated').value = today;

    populateModalTopics(item.topic);

    document.getElementById('qa-field-question').value = item.question || '';
    document.getElementById('qa-field-answer').value = item.answer || '';

    qaModal.classList.add('is-active');
    document.getElementById('qa-field-question').focus();
  }

  function populateModalTopics(selectedSlug = '') {
    const select = document.getElementById('qa-field-topic');
    if (!select) return;
    select.innerHTML = '<option value="">-- Choose Topic --</option>';
    loadedTopics.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.slug;
      opt.textContent = t.name;
      if (opt.value === selectedSlug) opt.selected = true;
      select.appendChild(opt);
    });
  }

  /**
   * Save QA Modal Form
   */
  function saveQAModal() {
    const topicVal = document.getElementById('qa-field-topic').value;
    const questionVal = document.getElementById('qa-field-question').value.trim();
    const answerVal = document.getElementById('qa-field-answer').value.trim();
    const dateVal = document.getElementById('qa-field-date').value;
    const updatedVal = document.getElementById('qa-field-updated').value;

    if (!topicVal) {
      alert('Please select a topic.');
      return;
    }
    if (!questionVal) {
      alert('Please enter the question text.');
      return;
    }
    if (!answerVal) {
      alert('Please enter the answer text.');
      return;
    }

    if (editingId !== null) {
      // Edit existing
      const index = loadedQA.findIndex(q => q.id === editingId);
      if (index !== -1) {
        loadedQA[index] = {
          ...loadedQA[index],
          topic: topicVal,
          question: questionVal,
          answer: answerVal,
          updatedOn: updatedVal
        };
      }
    } else {
      // Add new
      const idVal = parseInt(document.getElementById('qa-field-id').value, 10);
      const newEntry = {
        id: idVal,
        topic: topicVal,
        question: questionVal,
        answer: answerVal,
        answeredOn: dateVal,
        language: 'en',
        updatedOn: ''
      };
      loadedQA.push(newEntry);
    }

    closeModals();
    updateStatus();
    renderTable();
  }

  /**
   * Delete QA Item
   */
  function handleDelete(id) {
    const item = loadedQA.find(q => q.id === id);
    if (!item) return;

    const confirmMsg = `Are you sure you want to delete Answer #${item.id}?\n\n"${item.question}"\n\nThis will remove the entry from the Q&A list. The link will show a friendly tombstone on the live site.`;
    if (window.confirm(confirmMsg)) {
      loadedQA = loadedQA.filter(q => q.id !== id);
      updateStatus();
      renderTable();
    }
  }

  /**
   * Add New Topic
   */
  function saveNewTopic() {
    const nameInput = document.getElementById('topic-field-name');
    const slugInput = document.getElementById('topic-field-slug');

    const name = (nameInput ? nameInput.value : '').trim();
    let slug = (slugInput ? slugInput.value : '').trim();

    if (!name) {
      alert('Please enter a topic display name.');
      return;
    }

    if (!slug) {
      slug = window.QAUtils.slugify(name);
    }

    // Verify uniqueness
    if (loadedTopics.some(t => t.slug === slug)) {
      alert(`The topic slug "${slug}" is already in use. Please choose a different slug.`);
      return;
    }

    loadedTopics.push({ slug, name });
    loadedTopics.sort((a, b) => a.name.localeCompare(b.name));

    closeModals();
    updateStatus();
    renderTopicFilter();
    renderTable();
    alert(`Topic "${name}" successfully added!`);
  }

  /**
   * Run Data Integrity Validation
   */
  function runValidation() {
    const resultsContainer = document.getElementById('validation-results');
    if (!resultsContainer) return;

    const issues = [];
    const passes = [];

    // Check 1: Topic Slugs uniqueness
    const seenSlugs = new Set();
    let slugCollision = false;
    loadedTopics.forEach(t => {
      if (seenSlugs.has(t.slug)) {
        slugCollision = true;
        issues.push(`Duplicate topic slug found in topics: "${t.slug}"`);
      }
      seenSlugs.add(t.slug);
    });
    if (!slugCollision) {
      passes.push(`All ${loadedTopics.length} topic slugs are unique and valid.`);
    }

    // Check 2: QA IDs uniqueness & validity
    const seenIds = new Set();
    let idCollision = false;
    let invalidId = false;
    loadedQA.forEach(item => {
      if (seenIds.has(item.id)) {
        idCollision = true;
        issues.push(`Duplicate Question ID: #${item.id}`);
      }
      seenIds.add(item.id);
      if (typeof item.id !== 'number' || item.id <= 0) {
        invalidId = true;
        issues.push(`Invalid ID format for question "${window.QAUtils.truncate(item.question, 40)}"`);
      }
    });
    if (!idCollision && !invalidId) {
      passes.push(`All ${loadedQA.length} question IDs are valid, positive, and non-colliding.`);
    }

    // Check 3: Orphaned Topic References
    const topicSlugs = new Set(loadedTopics.map(t => t.slug));
    let orphanFound = false;
    loadedQA.forEach(item => {
      if (!topicSlugs.has(item.topic)) {
        orphanFound = true;
        issues.push(`Question #${item.id} references non-existent topic slug "${item.topic}".`);
      }
    });
    if (!orphanFound) {
      passes.push('Every question accurately references a declared topic slug.');
    }

    // Check 4: Date Formats
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    let badDate = false;
    loadedQA.forEach(item => {
      if (!dateRegex.test(item.answeredOn)) {
        badDate = true;
        issues.push(`Question #${item.id} has invalid answeredOn date: "${item.answeredOn}"`);
      }
      if (item.updatedOn && !dateRegex.test(item.updatedOn)) {
        badDate = true;
        issues.push(`Question #${item.id} has invalid updatedOn date: "${item.updatedOn}"`);
      }
    });
    if (!badDate) {
      passes.push('All answered and updated dates adhere to YYYY-MM-DD standard.');
    }

    // Render results
    let html = '';
    passes.forEach(p => {
      html += `<div class="validation-item pass"><span>✓</span><span>${window.QAUtils.escapeHTML(p)}</span></div>`;
    });
    issues.forEach(i => {
      html += `<div class="validation-item fail"><span>⚠</span><span>${window.QAUtils.escapeHTML(i)}</span></div>`;
    });

    resultsContainer.innerHTML = html;
    validationModal.classList.add('is-active');
  }

  /**
   * Export JSON Files
   */
  function exportFile(filename, data) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function closeModals() {
    [qaModal, topicModal, validationModal, helpModal].forEach(m => {
      if (m) m.classList.remove('is-active');
    });
  }

  /**
   * Bind DOM Events
   */
  function bindEvents() {
    // File inputs
    if (qaFileInput) {
      qaFileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
          try {
            loadedQA = JSON.parse(evt.target.result);
            updateStatus();
            renderTable();
          } catch (err) {
            alert('Invalid qa.json file: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    if (topicsFileInput) {
      topicsFileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
          try {
            loadedTopics = JSON.parse(evt.target.result);
            updateStatus();
            renderTopicFilter();
            renderTable();
          } catch (err) {
            alert('Invalid topics.json file: ' + err.message);
          }
        };
        reader.readAsText(file);
      });
    }

    // Filter & Search
    if (topicFilter) topicFilter.addEventListener('change', renderTable);
    if (searchInput) searchInput.addEventListener('input', renderTable);

    // Modal buttons
    document.getElementById('btn-add-qa')?.addEventListener('click', openAddModal);
    document.getElementById('btn-add-topic')?.addEventListener('click', () => {
      document.getElementById('topic-field-name').value = '';
      document.getElementById('topic-field-slug').value = '';
      topicModal.classList.add('is-active');
      document.getElementById('topic-field-name').focus();
    });

    // Auto slug sync in topic modal
    document.getElementById('topic-field-name')?.addEventListener('input', function () {
      const slugInput = document.getElementById('topic-field-slug');
      if (slugInput) slugInput.value = window.QAUtils.slugify(this.value);
    });

    document.getElementById('btn-validate-data')?.addEventListener('click', runValidation);
    document.getElementById('btn-how-to-publish')?.addEventListener('click', () => {
      helpModal.classList.add('is-active');
    });

    // Export buttons
    document.getElementById('btn-export-qa')?.addEventListener('click', () => exportFile('qa.json', loadedQA));
    document.getElementById('btn-export-topics')?.addEventListener('click', () => exportFile('topics.json', loadedTopics));

    // Save buttons
    document.getElementById('btn-save-qa-modal')?.addEventListener('click', saveQAModal);
    document.getElementById('btn-save-topic-modal')?.addEventListener('click', saveNewTopic);

    // Close buttons
    document.querySelectorAll('.admin-modal-close, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', closeModals);
    });

    // Escape key closes modals
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModals();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
  } else {
    initAdmin();
  }
})();

