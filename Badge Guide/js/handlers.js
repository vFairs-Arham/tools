// js/handlers.js

import { state, elements } from './state.js';
import { decisionTree, summaryLabels, checklistsData } from './data.js';

function renderInputStep(stepInfo) {
    const previousValue = state.answers[state.step] || '';

    const listToUse = state.pmList && state.pmList.length > 0 ? state.pmList : (stepInfo.datalist || []);
    const datalistHtml = listToUse.map(name => `<option value="${name}"></option>`).join('');

    return `
        <div class="step-content">
            <h2 class="text-2xl font-bold mb-6">${stepInfo.question}</h2>
            <input type="text" list="pm-list" value="${previousValue}" placeholder="${stepInfo.placeholder || ''}" class="w-full p-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition">
            <datalist id="pm-list">${datalistHtml}</datalist>
            <p class="error-message text-red-500 text-sm mt-2 h-5"></p>
        </div>
    `;
}

function renderDateStep(stepInfo) {
    const previousDate = state.answers['eventDate'] || '';
    const today = new Date().toISOString().split('T')[0];

    return `
        <div class="step-content">
            <h2 class="text-2xl font-bold mb-6 text-center">${stepInfo.question}</h2>
            
            <div class="max-w-md mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div class="flex flex-col gap-4">
                    <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Event Start Date</label>
                    <div class="relative group">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg class="h-5 w-5 text-slate-400 group-hover:text-sky-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <input type="date" id="event-date-input" min="${today}" value="${previousDate}" class="pl-10 w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-lg font-medium text-slate-700 bg-slate-50 hover:bg-white cursor-pointer">
                    </div>
                </div>

                <div id="date-feedback" class="mt-0 overflow-hidden transition-all duration-500 max-h-0 opacity-0">
                    <!-- Dynamic Content -->
                </div>

                <p class="error-message text-red-500 text-sm mt-3 h-5 text-center font-medium"></p>
            </div>
        </div>
    `;
}

function renderOptionsStep(stepInfo) {
    const hasOptionImages = stepInfo.options.some(opt => opt.imageUrl);
    const gridClass = hasOptionImages ? 'grid-cols-2' : (stepInfo.options.length > 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1');
    const questionAlignment = stepInfo.imageUrl && !hasOptionImages ? 'text-center' : '';

    return `
        <div class="step-content">
            <h2 class="text-2xl font-bold mb-6 ${questionAlignment}">${stepInfo.question}</h2>
            ${stepInfo.imageUrl && !hasOptionImages ? `
            <div class="mb-6 rounded-lg mx-auto shadow-md bg-slate-100 p-4 max-h-64 flex justify-center items-center relative z-10 w-fit zoom-wrapper">
                <img src="${stepInfo.imageUrl}" alt="${stepInfo.question}" class="max-h-56 object-contain zoom-image">
            </div>` : ''}
            <div class="grid ${gridClass} gap-4">
                ${stepInfo.options.map(opt => `
                    <button data-action="navigate" data-next="${opt.next}" data-value="${opt.text}" class="option-card text-left p-4 border-2 border-slate-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 flex flex-col items-center text-center">
                        ${opt.imageUrl ? `
                        <div class="mb-3 rounded-md h-24 w-full bg-slate-100 p-2 relative z-10 zoom-wrapper">
                            <img src="${opt.imageUrl}" alt="${opt.text}" class="w-full h-full object-contain zoom-image">
                        </div>` : ''}
                        <div class="flex items-center justify-center w-full ${opt.imageUrl ? 'mt-2' : ''}">
                            <span class="text-2xl mr-3">${opt.icon}</span>
                            <div class="tooltip">
                                <span class="text-lg font-semibold">${opt.text}</span>
                                ${opt.tooltip ? `<span class="tooltip-text">${opt.tooltip}</span>` : ''}
                            </div>
                        </div>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function renderResultCard() {
    const stepInfo = decisionTree[state.step];
    const { title, subtitle, mainPoint, isUrgent = false } = stepInfo;

    const labels = summaryLabels;

    const summaryItems = Object.entries(state.answers).map(([key, value]) => {
        if (labels[key] && value) {
            return `
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-slate-100 last:border-0">
                    <span class="text-sm font-medium text-slate-500">${labels[key]}</span> 
                    <span class="text-sm font-semibold text-slate-800 mt-1 sm:mt-0">${value.trim()}</span>
                </div>`;
        }
    }).filter(Boolean).join('');

    const titleColor = isUrgent ? 'text-red-600' : 'text-sky-600';
    const bgBadge = isUrgent ? 'bg-red-50 text-red-700 border-red-100' : 'bg-sky-50 text-sky-700 border-sky-100';

    return `
        <div class="step-content result-card max-w-lg mx-auto">
            
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full ${bgBadge} mb-4">
                    ${isUrgent
            ? `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`
            : `<svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
        }
                </div>
                <h2 class="text-3xl font-bold mb-2 ${titleColor}">${title}</h2>
                <p class="text-slate-500 text-lg mb-6">${subtitle}</p>
                
                <div class="bg-white border-2 border-slate-100 rounded-xl p-6 shadow-sm">
                    <p class="text-sm uppercase tracking-wide text-slate-400 font-semibold mb-2">Recommendation</p>
                    <p class="text-xl font-bold text-slate-800">${mainPoint}</p>
                </div>
            </div>

            <div class="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8">
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Configuration Summary</h3>
                <div class="space-y-1">
                    ${summaryItems}
                </div>
            </div>
            
            <div class="flex flex-col gap-3">
                <button id="download-pdf-btn" class="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span class="text-lg">Save & Download Results</span>
                </button>

                <button id="copy-checklist-btn" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-lg">Copy Checklist (Google Sheets)</span>
                </button>
                
                <button id="copy-summary-btn" class="w-full bg-white border-2 border-slate-200 text-slate-600 font-semibold py-3 px-6 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
                    Copy Summary Text
                </button>
            </div>

        </div>`;
}

// --- Logic Functions ---

function getNextStep(nextStep) {
    if (nextStep === 'onsiteRouter') {
        const badgeType = state.answers['badgeType_longTimeframe'];
        if (badgeType && badgeType.includes('ID Card')) return 'idCardResult';
        return 'pvcColorOnsiteResult';
    }
    if (nextStep === 'preprintRouter') {
        const badgeType = state.answers['badgeType_longTimeframe'];
        if (badgeType && badgeType.includes('ID Card')) return 'idCardResult';
        return 'pvcColorOnsiteResult';
    }
    if (nextStep === 'finalSolutionRouter_shortTimeframe') {
        const badgeType = state.answers['badgeType_shortTimeframe'];
        if (badgeType && badgeType.includes('ID Card')) return 'idCardResult';
        return 'pvcColorOnsiteResult';
    }
    return nextStep;
}

function handleAnswer(stepKey, value, nextStep) {
    state.history.push(state.step);
    state.answers[stepKey] = value.trim();
    state.step = getNextStep(nextStep);
    localStorage.setItem('badgeGuideState', JSON.stringify(state));
    renderStep(state.step);
}

function goBack() {
    if (state.history.length > 0) {
        const prevStep = state.history.pop();
        delete state.answers[prevStep];
        state.step = prevStep;
        renderStep(prevStep);
    }
}

function updateUI(stepInfo) {
    const { totalSteps } = decisionTree.start;
    const currentStepNumber = stepInfo.stepNumber || (stepInfo.isResult ? totalSteps : 0);
    const progress = (currentStepNumber / totalSteps) * 100;

    elements.progressBar.style.width = `${progress}%`;
    elements.stepCounter.textContent = stepInfo.isResult ? `Complete!` : `Step ${currentStepNumber} of ${totalSteps}`;

    const isStart = stepInfo.isStart;
    const isResult = stepInfo.isResult;

    elements.header.style.display = isStart ? 'none' : 'block';
    elements.navigation.style.display = isStart ? 'none' : 'flex';
    elements.prevBtn.style.visibility = state.history.length > 0 ? 'visible' : 'hidden';
    elements.nextBtn.style.display = (stepInfo.type === 'text' || stepInfo.type === 'date') ? 'block' : 'none';
    elements.restartBtn.style.display = isResult ? 'block' : 'none';

    elements.nextBtn.disabled = false;
    elements.prevBtn.disabled = false;
    elements.nextBtn.innerHTML = 'Next';
}

function injectStepContent(stepKey, stepInfo) {
    let html = '';
    const methods = { renderResultCard };

    if (stepInfo.render) {
        html = stepInfo.render(state, methods);
    } else if (stepInfo.isResult) {
        html = renderResultCard();
    } else if (stepInfo.type === 'text') {
        html = renderInputStep(stepInfo);
    } else if (stepInfo.type === 'date') {
        html = renderDateStep(stepInfo);
    } else if (stepInfo.type === 'options') {
        html = renderOptionsStep(stepInfo);
    }

    elements.stepContainer.innerHTML = html;
    const newContentDiv = elements.stepContainer.querySelector('.step-content');
    if (newContentDiv) {
        requestAnimationFrame(() => {
            newContentDiv.classList.add('fade-in');
        });
    }
    updateUI(stepInfo);
}

export function renderStep(stepKey) {
    const stepInfo = decisionTree[stepKey];
    if (!stepInfo) return;

    const contentDiv = elements.stepContainer.querySelector('.step-content');
    if (contentDiv) {
        contentDiv.classList.add('fade-out');
        setTimeout(() => {
            injectStepContent(stepKey, stepInfo);
            elements.nextBtn.disabled = false;
            elements.nextBtn.innerHTML = 'Next';
        }, 500);
    } else {
        injectStepContent(stepKey, stepInfo);
    }
}

export function handleStepContainerClick(e) {
    const targetButton = e.target.closest('button');
    if (!targetButton) return;

    const action = targetButton.dataset.action;
    if (action === 'navigate') {
        const nextStep = targetButton.dataset.next;
        const value = targetButton.dataset.value || targetButton.textContent;
        handleAnswer(state.step, value, nextStep);
    } else if (targetButton.id === 'copy-summary-btn') {
        copySummary(targetButton);
    } else if (targetButton.id === 'download-pdf-btn') {
        downloadPdf();
    } else if (targetButton.id === 'copy-checklist-btn') {
        copyChecklist();
    }
}

export function handleNextClick() {
    const currentStepInfo = decisionTree[state.step];

    if (currentStepInfo.type === 'text') {
        const input = elements.stepContainer.querySelector('input');
        const errorEl = elements.stepContainer.querySelector('.error-message');

        if (input.value.trim()) {
            if (errorEl) errorEl.textContent = '';
            input.classList.remove('border-red-400');
            elements.nextBtn.disabled = true;
            elements.nextBtn.innerHTML = `Processing...`;
            handleAnswer(state.step, input.value, currentStepInfo.next);
        } else {
            input.classList.add('border-red-400');
            if (errorEl) errorEl.textContent = 'This field is required.';
            input.focus();
        }
    } else if (currentStepInfo.type === 'date') {
        const input = document.getElementById('event-date-input');
        const errorEl = elements.stepContainer.querySelector('.error-message');
        const dateVal = input.value;

        if (!dateVal) {
            input.classList.add('border-red-400');
            errorEl.textContent = 'Please select a date.';
            return;
        }

        const selectedDate = new Date(dateVal);
        const now = new Date();
        selectedDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        if (selectedDate < now) {
            input.classList.add('border-red-400');
            errorEl.textContent = 'Date must be in the future.';
            return;
        }

        const diffTime = Math.abs(selectedDate - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = diffDays / 7;

        let nextStep = '';
        let calculatedValue = '';

        if (diffWeeks >= 4) {
            calculatedValue = '4+ Weeks';
            nextStep = 'badgeType_longTimeframe';
        } else if (diffWeeks >= 3) {
            calculatedValue = '3-4 Weeks';
            nextStep = 'badgeType_longTimeframe';
        } else if (diffWeeks >= 2) {
            calculatedValue = '2-3 Weeks';
            nextStep = 'badgeType_shortTimeframe';
        } else {
            calculatedValue = '< 2 Weeks';
            nextStep = 'consultTeamResult';
        }

        state.answers['eventDate'] = dateVal;
        elements.nextBtn.disabled = true;
        elements.nextBtn.innerHTML = `Processing...`;

        handleAnswer(state.step, calculatedValue, nextStep);
    }
}

export function restart() {
    localStorage.removeItem('badgeGuideState');
    state.step = 'start';
    state.answers = {};
    state.history = [];
    state.sessionId = `session_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
    renderStep('start');
}

export { goBack };

function generateSummaryText() {
    let text = 'Badge Decision Guide Summary\n';
    text += '============================\n\n';
    text += 'SELECTIONS:\n';

    const labels = summaryLabels;
    Object.entries(state.answers).forEach(([key, value]) => {
        if (labels[key] && value) {
            text += `- ${labels[key]}: ${value.trim()}\n`;
        }
    });

    const stepInfo = decisionTree[state.step];
    text += '\nRECOMMENDATION:\n';
    text += `Solution: ${stepInfo.title}\n`;
    text += `Recommendation: ${stepInfo.mainPoint}\n\n`;

    const createChecklistText = (data, indent = '') => {
        let text = '';
        data.forEach(phase => {
            text += `${indent}${phase.title.replace(/<strong>|<\/strong>/g, '')}\n`;
            if (phase.subtitle) text += `${indent}  ${phase.subtitle.replace(/<strong>|<\/strong>/g, '')}\n`;
            if (phase.items) {
                phase.items.forEach(item => {
                    text += `${indent}- ${item.replace(/<strong>|<\/strong>|<\/?ul>|<\/?li>/g, '').replace(/&quot;/g, '"')}\n`;
                });
            }
            if (phase.sections) {
                phase.sections.forEach(section => {
                    text += `${indent}  ${section.title}\n`;
                    section.items.forEach(item => {
                        text += `${indent}  - ${item.replace(/<strong>|<\/strong>/g, '')}\n`;
                    });
                });
            }
            text += '\n';
        });
        return text;
    };

    text += '============================\n';
    text += 'CHECKLIST (EXTERNAL)\n';
    text += '============================\n\n';
    text += createChecklistText(checklistsData.external);

    text += '============================\n';
    text += 'CHECKLIST (INTERNAL)\n';
    text += '============================\n\n';
    text += createChecklistText(checklistsData.internal);

    return text;
}

function copySummary(button) {
    const summaryText = generateSummaryText();
    elements.copyHelper.value = summaryText;
    elements.copyHelper.select();
    document.execCommand('copy');

    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
        Copied!
    `;
    setTimeout(() => {
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>
            Copy Summary Text
        `;
    }, 2000);
}

function generatePdf() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const stepInfo = decisionTree[state.step];
    const vFairsBlue = '#0284c7';
    const margin = 15;
    const docWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    const wrapText = (text, x, y, options) => {
        const { maxWidth, isList = false } = options;
        const lines = doc.splitTextToSize(text.replace(/<strong>|<\/strong>|<\/?ul>|<\/?li>/g, '').replace(/&quot;/g, '"'), maxWidth);

        if (isList) {
            lines.forEach((line, index) => {
                doc.text(index === 0 ? `• ${line}` : line, x, y);
                y += 6;
            });
            yPos = y + 2;
        } else {
            doc.text(lines, x, y);
            yPos = y + (lines.length * 6);
        }
    };

    const checkPageBreak = (y) => {
        if (y > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            y = 20;
        }
        return y;
    };

    // 1. Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(vFairsBlue);
    doc.text("vFairs Badge Decision Guide", docWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // 2. Selections
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Your Selections", margin, yPos);
    yPos += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, docWidth - margin, yPos);
    yPos += 8;

    const labels = summaryLabels;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    Object.entries(state.answers).forEach(([key, value]) => {
        if (labels[key] && value) {
            yPos = checkPageBreak(yPos);
            doc.setFont('Helvetica', 'bold');
            doc.text(`${labels[key]}:`, margin, yPos);
            doc.setFont('Helvetica', 'normal');
            doc.text(value.trim(), 70, yPos);
            yPos += 7;
        }
    });
    yPos += 5;

    // 3. Recommendation
    yPos = checkPageBreak(yPos);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text("Recommended Solution", margin, yPos);
    yPos += 8;
    doc.line(margin, yPos, docWidth - margin, yPos);
    yPos += 8;

    doc.setFontSize(12);
    doc.setTextColor(stepInfo.isUrgent ? '#DC2626' : vFairsBlue);
    doc.text(stepInfo.title, margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(stepInfo.subtitle, margin, yPos);
    yPos += 10;

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, yPos - 5, docWidth - (margin * 2), 12, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(stepInfo.mainPoint, margin + 5, yPos);
    yPos += 15;

    // 4. Checklists
    const renderChecklistPdf = (data, listTitle) => {
        yPos = checkPageBreak(yPos + 10);
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text(listTitle, margin, yPos);
        yPos += 8;
        doc.line(margin, yPos, docWidth - margin, yPos);
        yPos += 8;
        doc.setFontSize(10);

        data.forEach(phase => {
            yPos = checkPageBreak(yPos);
            doc.setFont('Helvetica', 'bold');
            doc.setTextColor(30, 58, 138);
            wrapText(phase.title, margin, yPos, { maxWidth: docWidth - (margin * 2) });

            if (phase.subtitle) {
                yPos = checkPageBreak(yPos);
                doc.setFont('Helvetica', 'italic');
                doc.setTextColor(100, 100, 100);
                wrapText(phase.subtitle, margin, yPos, { maxWidth: docWidth - (margin * 2) });
            }

            doc.setFont('Helvetica', 'normal');
            doc.setTextColor(55, 65, 81);
            if (phase.items) {
                phase.items.forEach(item => {
                    yPos = checkPageBreak(yPos);
                    wrapText(item, margin + 5, yPos, { maxWidth: docWidth - (margin * 2) - 5, isList: true });
                });
            }
            if (phase.sections) {
                phase.sections.forEach(section => {
                    yPos = checkPageBreak(yPos);
                    doc.setFont('Helvetica', 'bold');
                    doc.setTextColor(17, 24, 39);
                    wrapText(section.title, margin + 5, yPos, { maxWidth: docWidth - (margin * 2) - 5 });

                    doc.setFont('Helvetica', 'normal');
                    doc.setTextColor(55, 65, 81);
                    section.items.forEach(item => {
                        yPos = checkPageBreak(yPos);
                        wrapText(item, margin + 10, yPos, { maxWidth: docWidth - (margin * 2) - 10, isList: true });
                    });
                });
            }
            yPos += 5;
        });
    };

    renderChecklistPdf(checklistsData.external, "Checklist (External)");
    renderChecklistPdf(checklistsData.internal, "Checklist (Internal)");

    doc.save('badge_decision_summary.pdf');
}

function downloadPdf() {
    saveSessionData();
}

function saveSessionData() {
    const stepInfo = decisionTree[state.step];

    // Your confirmed Google Apps Script Web App URL
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxyYFSvwG1meKDxhVSao8H-Shj7YFOW9XV_pqJxEOHqXiqFwmBNmP4aQw6arKJUX3fZqA/exec';

    const payload = {
        sessionId: state.sessionId,
        timestamp: new Date().toISOString(),
        path: state.history,
        answers: state.answers,
        result: {
            title: stepInfo.title,
            subtitle: stepInfo.subtitle,
            mainPoint: stepInfo.mainPoint,
            isUrgent: stepInfo.isUrgent
        }
    };

    const btn = document.getElementById('download-pdf-btn');
    if (!btn) {
        console.error('Download PDF button not found in DOM.');
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = 'Saving...';
    btn.disabled = true;

    fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.status !== 'success') throw new Error(data.message || 'Script reported an error');

            // --- SUCCESS! Data is saved. ---
            console.log('Session data saved successfully:', data);

            const resultsLink = `results.html?id=${state.sessionId}`;
            const resultContainer = elements.stepContainer.querySelector('.result-card');

            // UPDATED FEEDBACK UI
            if (resultContainer && !document.getElementById('results-link-container')) {
                const linkDiv = document.createElement('div');
                linkDiv.id = 'results-link-container';
                linkDiv.className = 'mt-6 text-center p-6 bg-green-50 border border-green-200 rounded-xl shadow-sm animate-fade-in';
                linkDiv.innerHTML = `
                <div class="flex items-center justify-center mb-3">
                    <svg class="w-8 h-8 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 class="text-lg font-bold text-green-800">Session Saved Successfully!</h3>
                </div>
                
                <p class="text-slate-600 mb-2">Please save this Session ID to view your results later:</p>
                <div class="bg-white p-3 border border-slate-300 rounded-lg mb-4 font-mono text-lg font-semibold text-slate-800 tracking-wide select-all cursor-text shadow-inner flex justify-center items-center gap-2">
                    ${state.sessionId}
                    <button class="text-slate-400 hover:text-slate-600" onclick="navigator.clipboard.writeText('${state.sessionId}')" title="Copy ID">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </button>
                </div>
                
                <a href="${resultsLink}" target="_blank" class="inline-flex items-center text-sky-600 hover:text-sky-800 font-medium hover:underline">
                    View Saved Result Page
                    <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            `;
                resultContainer.appendChild(linkDiv);

                // Scroll to the feedback
                linkDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Now download the PDF after successful save
            btn.innerHTML = 'Downloading PDF...';
            generatePdf();
            btn.innerHTML = 'Saved & Downloaded';
        })
        .catch(error => {
            console.error('Error saving data:', error);
            alert('Warning: Failed to save session data to Google Sheets.\n\nHowever, your PDF will still be downloaded.');
            btn.innerHTML = 'Downloading PDF...';
            generatePdf();
            btn.innerHTML = 'Downloaded (Not Saved)';
        })
        .finally(() => {
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }, 3000);
        });
}

function copyChecklist() {
    const btn = document.getElementById('copy-checklist-btn');
    if (!btn) return;

    const pmName = state.answers.pmName || 'Unknown PM';
    const eventName = state.answers.eventName || 'Unnamed Event';
    const stepInfo = decisionTree[state.step];

    const originalText = btn.innerHTML;
    btn.innerHTML = `<svg class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="text-lg">Creating Copy...</span>`;
    btn.disabled = true;

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxyYFSvwG1meKDxhVSao8H-Shj7YFOW9XV_pqJxEOHqXiqFwmBNmP4aQw6arKJUX3fZqA/exec';

    const payload = {
        action: 'makeCopy',
        sessionId: state.sessionId,
        pmName: pmName,
        eventName: eventName,
        timestamp: new Date().toISOString(),
        answers: state.answers,
        result: {
            title: stepInfo.title,
            subtitle: stepInfo.subtitle,
            mainPoint: stepInfo.mainPoint,
            isUrgent: stepInfo.isUrgent
        }
    };

    fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'success') {
                throw new Error(data.message || 'Failed to create copy');
            }

            // Success! Show the link to the copied sheet
            btn.innerHTML = `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span class="text-lg">Copy Created!</span>`;

            const resultContainer = document.querySelector('.result-card');
            if (resultContainer && !document.getElementById('checklist-link-container')) {
                const linkDiv = document.createElement('div');
                linkDiv.id = 'checklist-link-container';
                linkDiv.className = 'mt-6 p-6 bg-green-50 border border-green-200 rounded-xl shadow-sm';
                linkDiv.innerHTML = `
                <div class="flex items-center justify-center mb-3">
                    <svg class="w-8 h-8 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 class="text-lg font-bold text-green-800">Checklist Created!</h3>
                </div>
                <p class="text-slate-600 mb-4 text-center">Your personalized checklist has been created:</p>
                <div class="bg-white p-3 border border-slate-300 rounded-lg mb-4 text-center">
                    <p class="font-semibold text-slate-800">${eventName} - ${pmName}</p>
                </div>
                <a href="${data.sheetUrl}" target="_blank" class="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-center transition-colors">
                    Open Checklist in Google Sheets
                    <svg class="inline-block w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </a>
            `;
                resultContainer.appendChild(linkDiv);
            }

            // Open the sheet in a new tab
            window.open(data.sheetUrl, '_blank');
        })
        .catch(error => {
            console.error('Error creating sheet copy:', error);
            btn.innerHTML = `<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg><span class="text-lg">Error</span>`;
            alert('Failed to create checklist copy. Please try again.');
        })
        .finally(() => {
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }, 3000);
        });
}

export function handleDateInput(e) {
    if (e.target.id !== 'event-date-input') return;

    const input = e.target;
    const dateVal = input.value;
    const feedbackEl = document.getElementById('date-feedback');

    if (!dateVal) {
        feedbackEl.style.maxHeight = '0';
        feedbackEl.style.opacity = '0';
        return;
    }

    const selectedDate = new Date(dateVal);
    const now = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    // Simple validation visual
    if (selectedDate < now) {
        input.classList.add('border-red-400', 'bg-red-50');
        input.classList.remove('border-slate-200', 'bg-slate-50');
        feedbackEl.innerHTML = `<div class="p-4 bg-red-50 text-red-600 rounded-xl text-center font-semibold border border-red-100">Date must be in the future</div>`;
    } else {
        input.classList.remove('border-red-400', 'bg-red-50');
        input.classList.add('border-sky-500', 'bg-sky-50');

        const diffTime = Math.abs(selectedDate - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = (diffDays / 7).toFixed(1);

        let badgeClass = '';
        let badgeText = '';
        let description = '';

        if (diffDays / 7 >= 4) {
            badgeClass = 'bg-green-100 text-green-700 border-green-200';
            badgeText = 'Standard Timeline';
            description = 'Plenty of time for any badge type, including custom PVC.';
        } else if (diffDays / 7 >= 3) {
            badgeClass = 'bg-blue-100 text-blue-700 border-blue-200';
            badgeText = 'Standard Timeline';
            description = 'Good for most badge types.';
        } else if (diffDays / 7 >= 2) {
            badgeClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
            badgeText = 'Tight Timeline';
            description = 'Limited options (No custom PVC).';
        } else {
            badgeClass = 'bg-red-100 text-red-700 border-red-200';
            badgeText = 'Urgent';
            description = 'Consultation required immediately.';
        }

        feedbackEl.innerHTML = `
            <div class="mt-4 p-4 rounded-xl border ${badgeClass} animate-fade-in">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-bold text-lg">${diffDays} Days / ${diffWeeks} Weeks</span>
                    <span class="px-3 py-1 rounded-full bg-white bg-opacity-50 text-xs font-bold uppercase tracking-wider shadow-sm">${badgeText}</span>
                </div>
                <p class="text-sm opacity-90 font-medium">${description}</p>
            </div>
        `;
    }

    feedbackEl.style.maxHeight = '200px';
    feedbackEl.style.opacity = '1';
}