// js/results-ui.js
import { decisionTree, summaryLabels } from './data.js';

export async function initSingleView(sessionId, apiUrl) {
    const loader = document.getElementById('loading-state');
    const container = document.getElementById('single-result-view');
    const adminView = document.getElementById('admin-view');

    adminView.classList.add('hidden');
    loader.classList.remove('hidden');

    try {
        const response = await fetch(`${apiUrl}?id=${sessionId}`);
        const json = await response.json();

        if (json.status === 'success') {
            renderSession(json.data);
            loader.classList.add('hidden');
            container.classList.remove('hidden');
        } else {
            alert('Session not found.');
            loader.classList.add('hidden');
        }
    } catch (e) {
        console.error(e);
        alert('Error loading data.');
        loader.classList.add('hidden');
    }
}

function renderSession(data) {
    // 1. Header (PM Name)
    const pmName = data.answers.pmName || 'Unknown PM';
    document.getElementById('pm-name-display').textContent = pmName;
    document.getElementById('timestamp-display').textContent = new Date(data.timestamp).toLocaleString();

    // 2. Result Card
    const result = data.result;
    document.getElementById('result-title').textContent = result.title;
    document.getElementById('result-title').className = `text-2xl font-bold mb-2 ${result.isUrgent ? 'text-red-600' : 'text-sky-600'}`;
    document.getElementById('result-subtitle').textContent = result.subtitle;
    document.getElementById('result-main-point').textContent = result.mainPoint;

    // 3. Beautiful Tree
    const treeContainer = document.getElementById('tree-container');
    const path = data.path || [];

    // We map the path keys back to questions from decisionTree
    let treeHtml = '';

    path.forEach((stepKey) => {
        const stepConfig = decisionTree[stepKey];
        if (!stepConfig || stepConfig.isResult) return; // Skip result steps in tree

        const answerKey = stepKey;
        const answerVal = data.answers[answerKey];

        if (answerVal) {
            treeHtml += `
                <div class="tree-step">
                    <div class="tree-question">${stepConfig.question || 'Step'}</div>
                    <div class="tree-answer">${answerVal}</div>
                </div>
            `;
        }
    });

    // Add final node for the result
    treeHtml += `
        <div class="tree-step">
            <div class="tree-question">Recommendation</div>
            <div class="tree-answer text-sky-600">${result.title}</div>
        </div>
    `;

    treeContainer.innerHTML = treeHtml;

    // 4. Details List
    const answersContainer = document.getElementById('answers-container');
    const validLabels = summaryLabels;

    const detailsHtml = Object.entries(data.answers).map(([key, value]) => {
        if (validLabels[key]) {
            return `
                <div class="flex justify-between border-b border-slate-100 pb-2 last:border-0">
                    <dt class="text-sm font-medium text-slate-500">${validLabels[key]}</dt>
                    <dd class="text-sm text-slate-900 font-semibold">${value}</dd>
                </div>
            `;
        }
        return '';
    }).join('');

    answersContainer.innerHTML = detailsHtml;
}