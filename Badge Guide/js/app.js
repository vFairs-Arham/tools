// js/app.js

import { elements, state } from './state.js';
import { renderStep, handleStepContainerClick, handleNextClick, goBack, restart, handleDateInput } from './handlers.js';

// Replace with your DEPLOYED URL
const API_URL = 'https://script.google.com/macros/s/AKfycbxyYFSvwG1meKDxhVSao8H-Shj7YFOW9XV_pqJxEOHqXiqFwmBNmP4aQw6arKJUX3fZqA/exec';

function init() {
    // 1. Check Local Storage
    const saved = localStorage.getItem('badgeGuideState');
    if (saved) {
        state.hasSavedData = true;
    }

    // 2. Fetch PM List (background)
    fetch(`${API_URL}?action=getPMs`)
        .then(res => res.json())
        .then(json => {
            if (json.status === 'success') {
                state.pmList = json.data;
            }
        })
        .catch(err => console.error("Failed to fetch PMs", err));

    // 3. Attach Listeners
    elements.stepContainer.addEventListener('click', (e) => {
        if (e.target.id === 'resume-btn') {
            loadFromStorage();
        } else {
            handleStepContainerClick(e);
        }
    });
    elements.nextBtn.addEventListener('click', handleNextClick);
    elements.prevBtn.addEventListener('click', goBack);
    elements.restartBtn.addEventListener('click', restart);
    elements.stepContainer.addEventListener('input', handleDateInput);

    // 4. Render
    renderStep(state.step);
}

function loadFromStorage() {
    try {
        const saved = JSON.parse(localStorage.getItem('badgeGuideState'));
        if (saved) {
            // Restore state
            state.step = saved.step;
            state.answers = saved.answers;
            state.history = saved.history;
            state.sessionId = saved.sessionId;
            renderStep(state.step);
        }
    } catch (e) {
        console.error("Error loading save", e);
    }
}

document.addEventListener('DOMContentLoaded', init);