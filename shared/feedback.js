// Universal Feedback System
// Works across all tools with auto-detection

(function () {
    'use strict';

    // Auto-detect tool context
    const getToolContext = () => {
        const toolMeta = document.querySelector('meta[name="tool-name"]');
        return {
            toolName: toolMeta?.content || 'Unknown Tool',
            pageUrl: window.location.href,
            pagePath: window.location.pathname
        };
    };

    const FEEDBACK_CATEGORIES = [
        { id: 'bug', label: '🐛 Bug Report', icon: '🐛' },
        { id: 'feature', label: '✨ Feature Request', icon: '✨' },
        { id: 'improvement', label: '🚀 Improvement', icon: '🚀' },
        { id: 'other', label: '💬 Other Feedback', icon: '💬' }
    ];

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxyYFSvwG1meKDxhVSao8H-Shj7YFOW9XV_pqJxEOHqXiqFwmBNmP4aQw6arKJUX3fZqA/exec';

    let selectedCategory = null;
    let modalElement = null;
    let overlayElement = null;

    // Create and inject the feedback UI
    function createFeedbackUI() {
        // Note: CSS should be included in HTML head
        // <link rel="stylesheet" href="../shared/feedback.css"> (for subdirectory tools)
        // <link rel="stylesheet" href="shared/feedback.css"> (for root-level pages)

        // Create FAB button
        const fab = document.createElement('button');
        fab.className = 'feedback-fab';
        fab.setAttribute('aria-label', 'Give Feedback');
        fab.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
        `;
        fab.addEventListener('click', openModal);
        document.body.appendChild(fab);

        // Create modal overlay
        overlayElement = document.createElement('div');
        overlayElement.className = 'feedback-modal-overlay';
        overlayElement.innerHTML = `
            <div class="feedback-modal" onclick="event.stopPropagation()">
                <div class="feedback-modal-header">
                    <h2 class="feedback-modal-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Share Your Feedback
                    </h2>
                    <button class="feedback-close-btn" onclick="window.FeedbackSystem.closeModal()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="feedback-modal-body">
                    <div id="feedback-form-container"></div>
                </div>
            </div>
        `;
        overlayElement.addEventListener('click', closeModal);
        document.body.appendChild(overlayElement);
        modalElement = overlayElement.querySelector('.feedback-modal');
    }

    function openModal() {
        renderForm();
        overlayElement.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        overlayElement.classList.remove('show');
        document.body.style.overflow = '';
        selectedCategory = null;
    }

    function renderForm() {
        const context = getToolContext();
        const container = document.getElementById('feedback-form-container');

        container.innerHTML = `
            <form id="feedback-form">
                <div class="feedback-form-group">
                    <label class="feedback-form-label">Category <span class="required">*</span></label>
                    <div class="feedback-categories">
                        ${FEEDBACK_CATEGORIES.map(cat => `
                            <div class="feedback-category" data-category="${cat.id}">
                                <div class="feedback-category-icon">${cat.icon}</div>
                                <div>${cat.label.replace(/^[^\s]+\s/, '')}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="feedback-form-group">
                    <label class="feedback-form-label" for="feedback-text">Your Feedback <span class="required">*</span></label>
                    <textarea 
                        id="feedback-text" 
                        class="feedback-textarea" 
                        placeholder="Tell us what's on your mind..."
                        required
                    ></textarea>
                </div>

                <div class="feedback-form-group">
                    <label class="feedback-form-label" for="feedback-name">Your Name (Optional)</label>
                    <input 
                        type="text" 
                        id="feedback-name" 
                        class="feedback-input" 
                        placeholder="Anonymous"
                    />
                </div>

                <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">
                    <strong>Tool:</strong> ${context.toolName} | <strong>Page:</strong> ${context.pagePath}
                </div>

                <button type="submit" class="feedback-submit-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Feedback
                </button>
            </form>
        `;

        // Attach category selection handlers
        container.querySelectorAll('.feedback-category').forEach(el => {
            el.addEventListener('click', () => {
                container.querySelectorAll('.feedback-category').forEach(c => c.classList.remove('selected'));
                el.classList.add('selected');
                selectedCategory = el.dataset.category;
            });
        });

        // Attach form submit
        document.getElementById('feedback-form').addEventListener('submit', handleSubmit);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!selectedCategory) {
            alert('Please select a feedback category');
            return;
        }

        const feedbackText = document.getElementById('feedback-text').value.trim();
        if (!feedbackText) {
            alert('Please enter your feedback');
            return;
        }

        const submitBtn = e.target.querySelector('.feedback-submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...`;

        const context = getToolContext();
        const payload = {
            action: 'submitFeedback',
            toolName: context.toolName,
            pageUrl: context.pageUrl,
            category: selectedCategory,
            feedback: feedbackText,
            userName: document.getElementById('feedback-name').value.trim() || 'Anonymous',
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.status === 'success') {
                showSuccess();
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Feedback submission error:', error);
            alert('Failed to submit feedback. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    function showSuccess() {
        const container = document.getElementById('feedback-form-container');
        container.innerHTML = `
            <div class="feedback-success">
                <div class="feedback-success-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 class="feedback-success-title">Thank You!</h3>
                <p class="feedback-success-message">Your feedback has been submitted successfully. We appreciate you taking the time to help us improve!</p>
            </div>
        `;

        setTimeout(() => {
            closeModal();
        }, 2500);
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createFeedbackUI);
    } else {
        createFeedbackUI();
    }

    // Expose API
    window.FeedbackSystem = {
        openModal,
        closeModal
    };

})();
