// js/results.js
import { initSingleView } from './results-ui.js';
import { initAdminManager } from './admin-manager.js';

const API_URL = 'https://script.google.com/macros/s/AKfycbxyYFSvwG1meKDxhVSao8H-Shj7YFOW9XV_pqJxEOHqXiqFwmBNmP4aQw6arKJUX3fZqA/exec';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('id');

    // 1. Initialize Admin Logic (Modal, Button)
    initAdminManager(API_URL);

    // 2. Lookup Button Logic
    const lookupBtn = document.getElementById('lookup-btn');
    const manualInput = document.getElementById('manual-session-id');

    lookupBtn.addEventListener('click', () => {
        const id = manualInput.value.trim();
        if (id) {
            // Update URL and fetch
            const newUrl = `${window.location.pathname}?id=${id}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
            initSingleView(id, API_URL);
        } else {
            alert('Please enter a valid Session ID.');
        }
    });

    // 3. Decide what to render initially
    if (sessionId) {
        // Pre-fill the input just in case they want to copy it
        manualInput.value = sessionId;
        // Hide the lookup box to keep UI clean if they came via direct link? 
        // Or keep it visible? Let's keep it visible but maybe smaller/less intrusive if data is loaded.
        // For now, standard behavior: load data.
        initSingleView(sessionId, API_URL);
    } else {
        document.getElementById('loading-state').classList.add('hidden');
    }
});