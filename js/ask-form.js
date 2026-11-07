/**
 * Ask a Question Form Handler
 * Scholar Q&A Website
 * Manages client-side validation, honeypot spam protection,
 * form service dispatch, and resilient mailto fallback.
 */

(function () {
  'use strict';

  async function initAskForm() {
    const form = document.getElementById('ask-question-form');
    const topicSelect = document.getElementById('ask-topic-select');
    const submitBtn = document.getElementById('ask-submit-btn');
    const alertContainer = document.getElementById('ask-alert-container');
    const directEmailLink = document.getElementById('direct-email-fallback-link');

    if (!form) return;

    let scholarEmail = 'contact@scholar-qa.example';
    let formConfig = {
      service: 'web3forms',
      endpoint: 'https://api.web3forms.com/submit',
      accessKey: 'YOUR_WEB3FORMS_ACCESS_KEY'
    };

    // 1. Load Topics and Site Info
    try {
      const [topics, siteData] = await Promise.all([
        window.DataLoader.loadTopics(),
        window.DataLoader.loadSiteInfo()
      ]);

      if (siteData && siteData.contact && siteData.contact.email) {
        scholarEmail = siteData.contact.email;
      }

      if (siteData && siteData.form) {
        formConfig = { ...formConfig, ...siteData.form };
      }

      // Populate topics dropdown
      if (topicSelect && Array.isArray(topics)) {
        const sortedTopics = [...topics].sort((a, b) => a.name.localeCompare(b.name));
        const preselectedSlug = window.QAUtils.getParam('topic');

        sortedTopics.forEach(topic => {
          const option = document.createElement('option');
          option.value = topic.slug;
          option.textContent = topic.name;
          if (preselectedSlug && preselectedSlug === topic.slug) {
            option.selected = true;
          }
          topicSelect.appendChild(option);
        });
      }

      // Update secondary direct email fallback link
      if (directEmailLink) {
        directEmailLink.href = `mailto:${encodeURIComponent(scholarEmail)}?subject=${encodeURIComponent('[Scholar Q&A] Religious Inquiry')}`;
      }

    } catch (err) {
      console.warn('Could not load topics or site config for form', err);
    }

    // Helper: Show field error
    function setFieldError(fieldId, errorId, message) {
      const group = document.getElementById(fieldId)?.closest('.form-group');
      const errEl = document.getElementById(errorId);
      if (group) group.classList.add('has-error');
      if (errEl) {
        errEl.textContent = message;
        errEl.style.display = 'block';
      }
    }

    // Helper: Clear field error
    function clearFieldError(fieldId, errorId) {
      const group = document.getElementById(fieldId)?.closest('.form-group');
      const errEl = document.getElementById(errorId);
      if (group) group.classList.remove('has-error');
      if (errEl) {
        errEl.textContent = '';
        errEl.style.display = 'none';
      }
    }

    // Clear errors on input
    ['question', 'email'].forEach(id => {
      const el = document.getElementById(`ask-${id}`);
      if (el) {
        el.addEventListener('input', () => clearFieldError(`ask-${id}`, `ask-${id}-error`));
      }
    });

    // 2. Form Submission Handler
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (alertContainer) {
        alertContainer.innerHTML = '';
        alertContainer.style.display = 'none';
      }

      const questionEl = document.getElementById('ask-question');
      const topicEl = document.getElementById('ask-topic-select');
      const nameEl = document.getElementById('ask-name');
      const emailEl = document.getElementById('ask-email');
      const honeypotEl = document.getElementById('ask-honeypot');

      const questionVal = (questionEl ? questionEl.value : '').trim();
      const topicVal = (topicEl ? topicEl.value : '');
      const topicText = topicEl && topicEl.selectedIndex >= 0 ? topicEl.options[topicEl.selectedIndex].text : 'General';
      const nameVal = (nameEl ? nameEl.value : '').trim();
      const emailVal = (emailEl ? emailEl.value : '').trim();
      const honeypotVal = (honeypotEl ? honeypotEl.value : '').trim();

      // Client-side Validation Checks
      let hasError = false;

      if (!questionVal) {
        setFieldError('ask-question', 'ask-question-error', 'Please enter your question.');
        hasError = true;
      } else if (questionVal.length < 20) {
        setFieldError('ask-question', 'ask-question-error', 'Your question seems very short. Please provide at least 20 characters of detail.');
        hasError = true;
      } else {
        clearFieldError('ask-question', 'ask-question-error');
      }

      if (emailVal) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailVal)) {
          setFieldError('ask-email', 'ask-email-error', 'Please enter a valid email address (e.g. name@example.com), or leave this field empty.');
          hasError = true;
        } else {
          clearFieldError('ask-email', 'ask-email-error');
        }
      } else {
        clearFieldError('ask-email', 'ask-email-error');
      }

      if (hasError) {
        // Focus first invalid element
        const firstInvalid = form.querySelector('.has-error .form-control');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Anti-Spam Honeypot Check
      if (honeypotVal) {
        // Bot detected: Silent discard. Pretend success and redirect.
        console.warn('Bot submission trapped by honeypot.');
        window.location.href = 'ask-success.html';
        return;
      }

      // Prepare Payload
      const payload = {
        access_key: formConfig.accessKey,
        subject: `[Scholar Q&A] New Question: ${topicText}`,
        from_name: nameVal || 'Anonymous Inquirer',
        sender_name: nameVal || 'Not provided',
        sender_email: emailVal || 'Not provided',
        topic: topicText,
        question: questionVal,
        submitted_at: new Date().toISOString()
      };

      // Set Submitting State
      submitBtn.classList.add('btn-submitting');
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Submitting Question...</span>';

      try {
        // If access key is placeholder (e.g. during local testing), simulate or catch
        const isPlaceholderKey = !formConfig.accessKey || formConfig.accessKey.includes('YOUR_WEB3FORMS');

        if (isPlaceholderKey) {
          // In development without an external API key:
          // Simulate 600ms network delay and redirect to ask-success.html
          console.info('Development mode: Simulating successful form delivery to Gmail.');
          await new Promise(r => setTimeout(r, 600));
          window.location.href = 'ask-success.html';
          return;
        }

        const response = await fetch(formConfig.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (response.ok && (result.success !== false)) {
          // Success! Redirect to confirmation page
          window.location.href = 'ask-success.html';
        } else {
          throw new Error(result.message || 'Form service returned an error status.');
        }

      } catch (err) {
        console.error('Submission failed', err);

        // Reset submit button
        submitBtn.classList.remove('btn-submitting');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        // Generate Mailto Fallback Link
        const mailtoSubject = encodeURIComponent(`[Scholar Q&A] Question on ${topicText}`);
        const mailtoBody = encodeURIComponent(
          `Question Details:\n\n${questionVal}\n\n` +
          `Topic: ${topicText}\n` +
          `From: ${nameVal || 'Anonymous'}\n` +
          `Email for reply: ${emailVal || 'Not provided'}`
        );
        const mailtoUrl = `mailto:${encodeURIComponent(scholarEmail)}?subject=${mailtoSubject}&body=${mailtoBody}`;

        if (alertContainer) {
          alertContainer.style.display = 'block';
          alertContainer.innerHTML = `
            <div class="alert alert-warning" style="margin-bottom: var(--space-md);">
              <h4 style="margin: 0 0 var(--space-xs) 0; font-size: var(--font-size-base); color: #7E2A00;">
                Online delivery encountered a network delay
              </h4>
              <p style="margin-bottom: var(--space-sm); font-size: var(--font-size-sm);">
                We could not deliver your question through the automated gateway. Don't worry—your question text has been preserved.
              </p>
              <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap; align-items: center;">
                <a href="${mailtoUrl}" class="btn btn-primary btn-sm">
                  Send Directly via Email App &rarr;
                </a>
                <button type="button" class="btn btn-outline btn-sm" onclick="this.closest('.alert').remove()">
                  Dismiss
                </button>
              </div>
            </div>
          `;
          alertContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAskForm);
  } else {
    initAskForm();
  }
})();

