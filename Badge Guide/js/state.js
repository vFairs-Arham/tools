// js/state.js

export const state = {
    step: 'start',
    answers: {},
    history: [],
    // New Format: BG-YYYYMMDD-XXXX (e.g., BG-20240427-A1B2)
    sessionId: (() => {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `BG-${date}-${random}`;
    })(),
    pmList: [], // Store fetched PMs here
    hasSavedData: false // Flag for UI
};

export const elements = {
    stepContainer: document.getElementById('step-container'),
    progressBar: document.getElementById('progress-bar'),
    stepCounter: document.getElementById('step-counter'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    restartBtn: document.getElementById('restart-btn'),
    header: document.getElementById('header'),
    navigation: document.getElementById('navigation'),
    copyHelper: document.getElementById('copy-helper'),
};