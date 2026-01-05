// js/admin-manager.js

let allData = []; // Store data locally for client-side sorting/filtering

export function initAdminManager(apiUrl) {
    const btn = document.getElementById('admin-toggle-btn');
    const modal = document.getElementById('admin-modal');
    const cancelBtn = document.getElementById('modal-cancel');
    const submitBtn = document.getElementById('modal-submit');
    const input = document.getElementById('admin-code-input');

    // Toggle Modal
    btn.addEventListener('click', () => modal.classList.remove('hidden'));
    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    // Handle Submit
    submitBtn.addEventListener('click', async () => {
        const code = input.value.trim();
        if (!code) return;

        submitBtn.innerHTML = 'Checking...';

        try {
            // Call API with getAll action
            const response = await fetch(`${apiUrl}?action=getAll&code=${encodeURIComponent(code)}`);
            const json = await response.json();

            if (json.status === 'success') {
                modal.classList.add('hidden');
                switchToAdminView(json.data);
                setupAdminTabs(apiUrl, code); // Initialize tabs
            } else {
                alert('Invalid Code');
            }
        } catch (e) {
            console.error(e);
            alert('Failed to verify code or fetch data.');
        } finally {
            submitBtn.innerHTML = 'Access';
        }
    });

    // Filtering & Sorting Setup
    const searchInput = document.getElementById('admin-search');
    const timeFilter = document.getElementById('admin-filter-timeframe');

    // Attach listeners
    searchInput.addEventListener('input', applyFilters);
    timeFilter.addEventListener('change', applyFilters);

    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', (e) => handleSort(e.target.dataset.sort));
    });
}

function switchToAdminView(data) {
    allData = data; // Store raw data
    document.getElementById('single-result-view').classList.add('hidden');
    document.getElementById('admin-view').classList.remove('hidden');
    renderTable(allData);
}

function renderTable(dataRows) {
    const tbody = document.getElementById('admin-table-body');
    const emptyState = document.getElementById('admin-empty-state');

    tbody.innerHTML = '';

    if (dataRows.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    tbody.innerHTML = dataRows.map(row => `
        <tr class="border-b border-slate-100 transition-colors">
            <td class="px-6 py-4 font-medium text-slate-900">${new Date(row.timestamp).toLocaleDateString()}</td>
            <td class="px-6 py-4">${row.pmName}</td>
            <td class="px-6 py-4"><span class="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">${row.timeframe}</span></td>
            <td class="px-6 py-4 text-sky-600 font-semibold">${row.finalSolution}</td>
            <td class="px-6 py-4 text-right">
                <a href="?id=${row.sessionId}" target="_blank" class="text-xs text-blue-500 hover:underline">View</a>
            </td>
        </tr>
    `).join('');
}

// Client-side Filter
function applyFilters() {
    const term = document.getElementById('admin-search').value.toLowerCase();
    const timeframeVal = document.getElementById('admin-filter-timeframe').value;

    const filtered = allData.filter(row => {
        // Safe check for properties, default to empty string if undefined/null
        const pmName = (row.pmName || '').toLowerCase();
        const finalSolution = (row.finalSolution || '').toLowerCase();
        const rowTimeframe = (row.timeframe || '');

        const matchesSearch = pmName.includes(term) || finalSolution.includes(term);
        const matchesTime = timeframeVal === "" || rowTimeframe === timeframeVal;

        return matchesSearch && matchesTime;
    });

    renderTable(filtered);
}

// Client-side Sort
let sortDirection = 1; // 1 = asc, -1 = desc
function handleSort(key) {
    sortDirection *= -1; // toggle

    const sorted = [...allData].sort((a, b) => {
        let valA, valB;

        // Map UI sort keys to data keys
        if (key === 'timestamp') {
            valA = new Date(a.timestamp);
            valB = new Date(b.timestamp);
        } else if (key === 'pm') {
            valA = (a.pmName || '').toLowerCase();
            valB = (b.pmName || '').toLowerCase();
        } else if (key === 'timeframe') {
            valA = (a.timeframe || '').toLowerCase();
            valB = (b.timeframe || '').toLowerCase();
        } else if (key === 'solution') {
            valA = (a.finalSolution || '').toLowerCase();
            valB = (b.finalSolution || '').toLowerCase();
        }

        if (valA < valB) return -1 * sortDirection;
        if (valA > valB) return 1 * sortDirection;
        return 0;
    });

    renderTable(sorted);
}

// Tab Switching Logic
let feedbackData = [];
let currentAdminCode = '';

export function setupAdminTabs(apiUrl, adminCode) {
    currentAdminCode = adminCode;
    const tabSessions = document.getElementById('tab-sessions');
    const tabFeedback = document.getElementById('tab-feedback');
    const sessionsTable = document.getElementById('sessions-table');
    const feedbackTable = document.getElementById('feedback-table');

    tabSessions.addEventListener('click', () => {
        tabSessions.classList.add('admin-tab-active');
        tabFeedback.classList.remove('admin-tab-active');
        sessionsTable.classList.remove('hidden');
        feedbackTable.classList.add('hidden');
    });

    tabFeedback.addEventListener('click', async () => {
        tabFeedback.classList.add('admin-tab-active');
        tabSessions.classList.remove('admin-tab-active');
        feedbackTable.classList.remove('hidden');
        sessionsTable.classList.add('hidden');

        // Load feedback data
        if (feedbackData.length === 0) {
            await loadFeedbackData(apiUrl);
        }
    });
}

async function loadFeedbackData(apiUrl) {
    try {
        const response = await fetch(`${apiUrl}?action=getFeedback&code=${encodeURIComponent(currentAdminCode)}`);
        const json = await response.json();

        if (json.status === 'success') {
            feedbackData = json.data;
            renderFeedbackTable(feedbackData);
        } else {
            alert('Failed to load feedback data');
        }
    } catch (error) {
        console.error('Error loading feedback:', error);
        alert('Error loading feedback data');
    }
}

function renderFeedbackTable(data) {
    const tbody = document.getElementById('feedback-table-body');
    const emptyState = document.getElementById('feedback-empty-state');

    tbody.innerHTML = '';

    if (data.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    emptyState.classList.add('hidden');

    tbody.innerHTML = data.map(row => {
        const categoryIcons = {
            bug: '🐛',
            feature: '✨',
            improvement: '🚀',
            other: '💬'
        };

        return `
        <tr class="border-b border-slate-100">
            <td class="px-6 py-4 font-medium text-slate-900">${new Date(row.timestamp).toLocaleDateString()}</td>
            <td class="px-6 py-4">${row.toolName}</td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-1">
                    <span>${categoryIcons[row.category] || '💬'}</span>
                    <span class="text-xs">${row.category}</span>
                </div>
            </td>
            <td class="px-6 py-4 max-w-xs truncate" title="${row.feedback}">${row.feedback}</td>
            <td class="px-6 py-4">${row.userName}</td>
            <td class="px-6 py-4"><span class="status-badge ${row.status.toLowerCase()}">${row.status}</span></td>
            <td class="px-6 py-4 text-right">
                <a href="${row.pageUrl}" target="_blank" class="text-xs text-blue-500 hover:underline">View Page</a>
            </td>
        </tr>
    `;
    }).join('');
}
