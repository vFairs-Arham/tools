// js/state.js

export const state = {
    step: 'start',
    answers: {},
    history: [],
    sessionId: `session_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`,
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