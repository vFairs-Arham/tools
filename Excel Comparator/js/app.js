// ============================================================
//  Excel Comparator — app.js  (Performance-Optimised Edition)
// ============================================================

// --- STATE ---
let mode = 'single';
let wb1 = null;   // { sheetNames:[], sheets:{ name:{ headers:[], rows:[] } } }
let wb2 = null;
let activeProfile = null;

let allComparisonData = [];
let currentFilteredData = [];
let tableColumns = [];

const INFO_ONLY_TAG = '___INFO_ONLY___';

// ── Debounce helper ──────────────────────────────────────────
function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ── Fast HTML escape (no DOM allocation) ────────────────────
const _esc = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(t) {
    return String(t ?? '').replace(/[&<>"']/g, c => _esc[c]);
}

// ============================================================
//  LOADING OVERLAY  (with progress bar + percentage)
// ============================================================
function showLoading(message = 'Processing...', pct = null) {
    const overlay = document.getElementById('loadingOverlay');
    const text = document.getElementById('loadingText');
    const barWrap = document.getElementById('loadingBarWrap');
    const bar = document.getElementById('loadingBar');
    const pctLabel = document.getElementById('loadingPct');

    if (!overlay) return;
    text.textContent = message;

    if (pct !== null) {
        barWrap.classList.remove('hidden');
        bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
        pctLabel.textContent = Math.round(pct) + '%';
    } else {
        barWrap.classList.add('hidden');
    }

    overlay.classList.remove('hidden');
}

function updateLoadingProgress(message, pct) {
    const text = document.getElementById('loadingText');
    const bar = document.getElementById('loadingBar');
    const pctLabel = document.getElementById('loadingPct');
    const barWrap = document.getElementById('loadingBarWrap');

    if (!text) return;
    text.textContent = message;
    if (pct !== null) {
        barWrap.classList.remove('hidden');
        bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
        pctLabel.textContent = Math.round(pct) + '%';
    }
}

function hideLoading() {
    document.getElementById('loadingOverlay')?.classList.add('hidden');
}

// ============================================================
//  TOAST
// ============================================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toastNotification');
    const msgEl = document.getElementById('toastMessage');
    const iconEl = document.getElementById('toastIcon');
    if (!toast) return;

    msgEl.textContent = message;
    toast.className = 'fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 transform transition-all duration-300';

    const icons = {
        success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>',
        error: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>',
        warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
        info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    };
    const colors = { success: 'bg-emerald-600', error: 'bg-red-600', warning: 'bg-amber-500', info: 'bg-sky-600' };

    toast.classList.add(colors[type] || colors.info, 'text-white');
    iconEl.innerHTML = icons[type] || icons.info;
    toast.classList.remove('hidden', 'translate-y-full', 'opacity-0');

    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 4000);
}

// ============================================================
//  WEB WORKER — inline Blob (works on GitHub Pages, file://, everywhere)
// ============================================================

// The worker code is embedded as a string so no separate file fetch is needed.
// It imports SheetJS from the CDN inside the worker context.
const _workerCode = `
importScripts('https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js');

self.onmessage = function(e) {
    var arrayBuffer = e.data.arrayBuffer;
    var fileLabel   = e.data.fileLabel;
    try {
        self.postMessage({ type: 'progress', pct: 10, message: 'Parsing file structure...' });
        var wb = XLSX.read(arrayBuffer, { cellDates: true, dense: true });

        self.postMessage({ type: 'progress', pct: 80, message: 'Extracting sheets...' });
        var sheets = {};
        var total  = wb.SheetNames.length;
        wb.SheetNames.forEach(function(name, i) {
            self.postMessage({
                type: 'progress',
                pct: 80 + Math.round((i / total) * 18),
                message: 'Reading sheet "' + name + '"...'
            });
            var raw = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' });
            sheets[name] = {
                headers: raw[0] || [],
                rows:    XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '' })
            };
        });
        self.postMessage({ type: 'progress', pct: 99, message: 'Done!' });
        self.postMessage({ type: 'done', sheetNames: wb.SheetNames, sheets: sheets });
    } catch(err) {
        self.postMessage({ type: 'error', message: err.message });
    }
};
`;

function parseFileWithWorker(file, fileLabel) {
    return new Promise((resolve, reject) => {
        // Create worker from inline Blob — no external file needed
        const blob = new Blob([_workerCode], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        const worker = new Worker(blobUrl);

        file.arrayBuffer().then(buf => {
            showLoading(`Reading ${fileLabel}...`, 0);
            worker.postMessage({ arrayBuffer: buf, fileLabel }, [buf]);

            worker.onmessage = (e) => {
                const { type, pct, message, sheetNames, sheets } = e.data;
                if (type === 'progress') {
                    updateLoadingProgress(message, pct);
                } else if (type === 'done') {
                    worker.terminate();
                    URL.revokeObjectURL(blobUrl);
                    resolve({ sheetNames, sheets });
                } else if (type === 'error') {
                    worker.terminate();
                    URL.revokeObjectURL(blobUrl);
                    reject(new Error(e.data.message));
                }
            };

            worker.onerror = (err) => {
                worker.terminate();
                URL.revokeObjectURL(blobUrl);
                reject(err);
            };
        }).catch(reject);
    });
}

// ============================================================
//  PROFILE LOGIC
// ============================================================
window.loadProfileFromFile = function (input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            loadProfileData(JSON.parse(e.target.result));
            showToast('Profile loaded successfully!', 'success');
        } catch { showToast('Invalid Profile File.', 'error'); }
    };
    reader.onerror = () => showToast('Failed to read profile file.', 'error');
    reader.readAsText(file);
    input.value = '';
};

function generateProfileObject() {
    const mappings = [];
    document.querySelectorAll('.map-select').forEach((select, i) => {
        if (select.value) {
            const dateChecks = document.querySelectorAll('.date-check');
            mappings.push({
                source: select.getAttribute('data-source'),
                target: select.value,
                isDate: dateChecks[i]?.checked ?? false
            });
        }
    });

    const filters = {};
    document.querySelectorAll('.filter-input').forEach((input, i) => {
        if (tableColumns[i]) filters[tableColumns[i].key] = input.value;
    });

    return {
        mappings,
        keyCol: document.getElementById('keyColumnSelect')?.value ?? '',
        filters,
        timestamp: new Date().toLocaleString()
    };
}

window.saveProfileToBrowser = function () {
    try {
        const p = generateProfileObject();
        localStorage.setItem('excel_comparator_profile', JSON.stringify(p));
        updateStatus(`✅ Quick Saved (${p.timestamp})`);
        showToast('Profile saved to browser!', 'success');
    } catch { showToast('Failed to save. Storage may be full.', 'error'); }
};

window.loadProfileFromBrowser = function () {
    try {
        const raw = localStorage.getItem('excel_comparator_profile');
        if (!raw) { showToast('No saved profile found.', 'warning'); return; }
        loadProfileData(JSON.parse(raw));
        showToast('Profile loaded from browser!', 'success');
    } catch {
        showToast('Saved profile is corrupted.', 'error');
        localStorage.removeItem('excel_comparator_profile');
    }
};

window.downloadProfile = function () {
    const p = generateProfileObject();
    const a = Object.assign(document.createElement('a'), {
        href: 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(p, null, 2)),
        download: 'comparator_profile.json'
    });
    document.body.appendChild(a); a.click(); a.remove();
    updateStatus('⬇️ Exported Profile.');
    showToast('Profile exported!', 'success');
};

function loadProfileData(profile) {
    activeProfile = profile;
    updateStatus('📂 Profile Loaded!');
    const el = document.getElementById('profileStatus');
    el.classList.add('text-emerald-600', 'font-semibold');
    el.classList.remove('text-slate-500');
    if (!document.getElementById('sheetConfigSection').classList.contains('hidden')) applyProfileKey();
    if (!document.getElementById('mappingSection').classList.contains('hidden')) applyProfileMappings();
    if (!document.getElementById('resultsSection').classList.contains('hidden')) applyProfileFilters();
}

function updateStatus(msg) {
    document.getElementById('profileStatus').innerText = 'Status: ' + msg;
}

function applyProfileKey() {
    if (!activeProfile) return;
    const sel = document.getElementById('keyColumnSelect');
    if (sel && activeProfile.keyCol && [...sel.options].some(o => o.value === activeProfile.keyCol))
        sel.value = activeProfile.keyCol;
}

function applyProfileMappings() {
    if (!activeProfile) return;
    activeProfile.mappings.forEach(m => {
        const dd = document.querySelector(`.map-select[data-source="${CSS.escape(m.source)}"]`);
        if (dd) {
            dd.value = m.target;
            const dc = dd.closest('.mapping-row')?.querySelector('.date-check');
            if (dc) dc.checked = m.isDate;
        }
    });
}

function applyProfileFilters() {
    if (!activeProfile?.filters) return;
    let hasFilter = false;
    document.querySelectorAll('.filter-input').forEach((input, i) => {
        if (!tableColumns[i]) return;
        const v = activeProfile.filters[tableColumns[i].key];
        if (v) { input.value = v; hasFilter = true; }
    });
    if (hasFilter) applyFilters();
}

// ============================================================
//  MODE SWITCHER
// ============================================================
window.setMode = function (selectedMode) {
    mode = selectedMode;
    document.querySelectorAll('.mode-btn').forEach(b => {
        b.classList.remove('ring-2', 'ring-sky-500', 'bg-sky-50', 'border-sky-500');
        b.classList.add('border-slate-200', 'hover:border-sky-500');
    });
    const activeBtn = document.getElementById(mode === 'single' ? 'modeSingle' : 'modeDual');
    activeBtn.classList.remove('border-slate-200', 'hover:border-sky-500');
    activeBtn.classList.add('ring-2', 'ring-sky-500', 'bg-sky-50', 'border-sky-500');

    document.getElementById('uploadSingle').classList.toggle('hidden', mode !== 'single');
    document.getElementById('uploadDual').classList.toggle('hidden', mode === 'single');

    wb1 = wb2 = null;
    ['fileInputCommon', 'fileInputA', 'fileInputB'].forEach(id => {
        document.getElementById(id).value = '';
    });
    ['sheetConfigSection', 'mappingSection', 'resultsSection'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
};

window.resetTool = function () {
    wb1 = wb2 = null;
    allComparisonData = currentFilteredData = [];
    tableColumns = [];
    ['fileInputCommon', 'fileInputA', 'fileInputB'].forEach(id => document.getElementById(id).value = '');
    ['sheet1Select', 'sheet2Select'].forEach(id => {
        document.getElementById(id).innerHTML = `<option value="">Select Sheet...</option>`;
    });
    document.getElementById('keyColumnSelect').innerHTML = `<option value="">Select Unique ID...</option>`;
    document.getElementById('mappingContainer').innerHTML = '';
    ['sheetConfigSection', 'mappingSection', 'resultsSection'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    setMode('single');
    showToast('Tool reset. Ready for new comparison.', 'info');
};

// ============================================================
//  FILE INPUTS  (use Web Worker)
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

    async function handleFileLoad(file, slot /* 'common'|'A'|'B' */) {
        const label = slot === 'A' ? 'File A' : slot === 'B' ? 'File B' : 'File';
        try {
            const parsed = await parseFileWithWorker(file, label);
            if (slot === 'common') { wb1 = parsed; wb2 = parsed; }
            else if (slot === 'A') { wb1 = parsed; }
            else { wb2 = parsed; }
            showToast(`${label} loaded! (${parsed.sheetNames.length} sheet${parsed.sheetNames.length !== 1 ? 's' : ''})`, 'success');
            if (slot === 'common' || (wb1 && wb2)) populateSheetDropdowns();
        } catch (err) {
            showToast(`Failed to read ${label}: ${err.message}`, 'error');
            if (slot !== 'B') wb1 = null;
            if (slot !== 'A') wb2 = null;
        } finally {
            hideLoading();
        }
    }

    document.getElementById('fileInputCommon').addEventListener('change', e => {
        const f = e.target.files[0]; if (f) handleFileLoad(f, 'common');
    });
    document.getElementById('fileInputA').addEventListener('change', e => {
        const f = e.target.files[0]; if (f) handleFileLoad(f, 'A');
    });
    document.getElementById('fileInputB').addEventListener('change', e => {
        const f = e.target.files[0]; if (f) handleFileLoad(f, 'B');
    });

    // Sheet 1 selection → populate key column dropdown
    document.getElementById('sheet1Select').addEventListener('change', e => {
        const name = e.target.value;
        if (!name || !wb1) return;
        const headers = wb1.sheets[name]?.headers ?? [];
        if (!headers.length) { showToast('Selected sheet is empty or has no headers.', 'error'); e.target.value = ''; return; }

        const keySelect = document.getElementById('keyColumnSelect');
        keySelect.innerHTML = '<option value="">Select Unique ID...</option>';
        headers.forEach(h => {
            const o = document.createElement('option');
            o.value = o.textContent = h;
            keySelect.appendChild(o);
        });
        applyProfileKey();
    });

    // Proceed to column mapping
    document.getElementById('btnLoadColumns').addEventListener('click', () => {
        const s1Name = document.getElementById('sheet1Select').value;
        const s2Name = document.getElementById('sheet2Select').value;
        if (!s1Name || !s2Name) { showToast('Please select both sheets.', 'warning'); return; }

        // Use cached headers — no extra sheet_to_json call
        const h1 = wb1.sheets[s1Name]?.headers ?? [];
        const h2 = wb2.sheets[s2Name]?.headers ?? [];
        if (!h1.length) { showToast('Reference sheet has no headers.', 'error'); return; }
        if (!h2.length) { showToast('Comparison sheet has no headers.', 'error'); return; }

        const container = document.getElementById('mappingContainer');
        container.innerHTML = '';

        h1.forEach(col1 => {
            const exactMatch = h2.find(c => c.trim().toLowerCase() === col1.trim().toLowerCase());
            const rowDiv = document.createElement('div');
            rowDiv.className = 'mapping-row grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-200 mb-2';
            rowDiv.innerHTML = `
                <div class="col-span-12 md:col-span-4 font-medium text-slate-700 truncate" title="${escapeHtml(col1)}">Ref: ${escapeHtml(col1)}</div>
                <div class="col-span-12 md:col-span-1 text-center text-slate-400 hidden md:block">
                    <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <select class="form-select w-full rounded-md border-slate-300 py-2 text-sm focus:border-sky-500 focus:ring-sky-500 map-select" data-source="${escapeHtml(col1)}">
                        <option value="">(Skip)</option>
                        <option value="${INFO_ONLY_TAG}" class="font-bold text-blue-600">(👀 Show Info Only)</option>
                        <optgroup label="Compare Against:"></optgroup>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-3 flex justify-end">
                    <label class="inline-flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" class="form-checkbox text-sky-600 rounded border-slate-300 focus:ring-sky-500 date-check"/>
                        <span class="text-sm text-slate-500">Is Date?</span>
                    </label>
                </div>`;

            const optgroup = rowDiv.querySelector('optgroup');
            h2.forEach(col2 => {
                const o = document.createElement('option');
                o.value = o.textContent = col2;
                if (col2 === exactMatch) o.selected = true;
                optgroup.appendChild(o);
            });
            container.appendChild(rowDiv);
        });

        document.getElementById('mappingSection').classList.remove('hidden');
        applyProfileMappings();
    });
});

function populateSheetDropdowns() {
    const s1 = document.getElementById('sheet1Select');
    const s2 = document.getElementById('sheet2Select');
    s1.innerHTML = '<option value="">Select Reference Sheet...</option>';
    s2.innerHTML = '<option value="">Select Comparison Sheet...</option>';
    wb1.sheetNames.forEach(n => { const o = document.createElement('option'); o.value = o.textContent = n; s1.appendChild(o); });
    wb2.sheetNames.forEach(n => { const o = document.createElement('option'); o.value = o.textContent = n; s2.appendChild(o); });
    document.getElementById('sheetConfigSection').classList.remove('hidden');
}

// ============================================================
//  COMPARISON  (with progress reporting)
// ============================================================
window.performComparison = function () {
    const s1Name = document.getElementById('sheet1Select').value;
    const s2Name = document.getElementById('sheet2Select').value;
    const keyCol = document.getElementById('keyColumnSelect').value;

    if (!keyCol) { showToast('Please select a Unique Identifier (Key Column).', 'warning'); return; }

    const activeMappings = [];
    document.querySelectorAll('.map-select').forEach((select, i) => {
        if (select.value) {
            const dateChecks = document.querySelectorAll('.date-check');
            activeMappings.push({
                source: select.getAttribute('data-source'),
                target: select.value,
                isDate: dateChecks[i]?.checked ?? false
            });
        }
    });

    if (!activeMappings.length) { showToast('Please map at least one column.', 'warning'); return; }

    const keyMapping = activeMappings.find(m => m.source === keyCol);
    if (!keyMapping) { showToast(`Please map the Key Column (${keyCol}).`, 'warning'); return; }

    showLoading('Building lookup index...', 5);

    // Yield to browser so spinner paints, then run heavy work
    setTimeout(() => {
        try {
            const data1 = wb1.sheets[s1Name]?.rows ?? [];
            const data2 = wb2.sheets[s2Name]?.rows ?? [];

            // ── Step 1: Build Map from data2 ──
            updateLoadingProgress('Building lookup index...', 10);
            const map2 = new Map();
            const duplicateKeys = [];
            data2.forEach(row => {
                let targetKey = keyMapping.target === INFO_ONLY_TAG ? keyMapping.source : keyMapping.target;
                const rawKey = String(row[targetKey] ?? row[keyMapping.source] ?? '').trim();
                const keyLower = rawKey.toLowerCase();
                if (map2.has(keyLower)) duplicateKeys.push(rawKey);
                map2.set(keyLower, row);
            });

            if (duplicateKeys.length) {
                const sample = [...new Set(duplicateKeys)].slice(0, 5).join(', ');
                showToast(`Warning: ${duplicateKeys.length} duplicate key(s). Examples: ${sample}`, 'warning');
            }

            // ── Step 2: Build column definitions ──
            updateLoadingProgress('Preparing column definitions...', 20);
            tableColumns = [
                { key: 'Unique ID', label: `ID (${escapeHtml(keyCol)})` },
                { key: 'Status', label: 'Status' }
            ];
            activeMappings.forEach(m => tableColumns.push({
                key: m.source,
                label: escapeHtml(m.source) + (m.target === INFO_ONLY_TAG ? ' (Info)' : ''),
                isInfo: m.target === INFO_ONLY_TAG
            }));

            // ── Step 3: Compare rows in chunks with progress ──
            allComparisonData = [];
            let skippedRows = 0;
            const total = data1.length;
            const CHUNK = 500;
            let idx = 0;

            function processChunk() {
                const end = Math.min(idx + CHUNK, total);
                const pct = 20 + Math.round((idx / total) * 70);
                updateLoadingProgress(`Comparing rows ${idx + 1}–${end} of ${total}...`, pct);

                for (; idx < end; idx++) {
                    const row1 = data1[idx];
                    const rawKeyVal = row1[keyCol];
                    if (rawKeyVal === undefined || rawKeyVal === null || String(rawKeyVal).trim() === '') {
                        skippedRows++; continue;
                    }

                    const keyVal1 = String(rawKeyVal).trim();
                    const row2 = map2.get(keyVal1.toLowerCase());
                    const rowObj = { 'Unique ID': keyVal1, Status: 'Match' };
                    let hasIssue = false;

                    if (!row2) {
                        rowObj.Status = 'Row Missing';
                        hasIssue = true;
                        activeMappings.forEach(m => {
                            rowObj[m.source] = m.target === INFO_ONLY_TAG ? String(row1[m.source] ?? '') : 'Missing in Target';
                        });
                    } else {
                        activeMappings.forEach(m => {
                            if (m.target === INFO_ONLY_TAG) {
                                rowObj[m.source] = String(row1[m.source] ?? '').trim();
                            } else {
                                let v1 = row1[m.source], v2 = row2[m.target];
                                if (m.isDate) { v1 = normalizeDate(v1); v2 = normalizeDate(v2); }
                                else { v1 = String(v1 ?? '').trim(); v2 = String(v2 ?? '').trim(); }
                                if (v1.toLowerCase() !== v2.toLowerCase()) {
                                    rowObj.Status = 'Mismatch';
                                    hasIssue = true;
                                    rowObj[m.source] = { v1, v2, mismatch: true };
                                } else {
                                    rowObj[m.source] = { match: true };
                                }
                            }
                        });
                    }

                    if (hasIssue) allComparisonData.push(rowObj);
                }

                if (idx < total) {
                    // Yield between chunks so browser stays responsive
                    setTimeout(processChunk, 0);
                } else {
                    // ── Step 4: Render ──
                    updateLoadingProgress('Rendering results...', 92);
                    if (skippedRows) showToast(`${skippedRows} row(s) skipped (missing key).`, 'warning');

                    currentFilteredData = [...allComparisonData];
                    buildTableHeaders();

                    setTimeout(() => {
                        renderTable();
                        updateLoadingProgress('Done!', 100);
                        document.getElementById('resultsSection').classList.remove('hidden');
                        applyProfileFilters();
                        hideLoading();

                        if (!allComparisonData.length) {
                            showToast('🎉 No discrepancies found! All data matches.', 'success');
                        } else {
                            showToast(`Comparison complete. Found ${allComparisonData.length} discrepancies.`, 'info');
                        }
                    }, 30);
                }
            }

            processChunk();

        } catch (err) {
            showToast('Error during comparison: ' + err.message, 'error');
            hideLoading();
        }
    }, 50);
};

// ============================================================
//  DATE UTILS
// ============================================================
function normalizeDate(val) {
    if (!val) return '';
    if (typeof val === 'number') return formatDateLocally(new Date(Math.round((val - 25569) * 86400 * 1000)));
    if (val instanceof Date) return formatDateLocally(val);
    const s = String(val).trim();
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : formatDateLocally(d);
}
function formatDateLocally(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ============================================================
//  TABLE HEADERS
// ============================================================
function buildTableHeaders() {
    const headerRow = document.getElementById('headerRow');
    const filterRow = document.getElementById('filterRow');
    headerRow.innerHTML = '';
    filterRow.innerHTML = '';

    tableColumns.forEach(col => {
        const th = document.createElement('th');
        th.className = 'px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200';
        th.textContent = col.label;
        headerRow.appendChild(th);

        const fth = document.createElement('th');
        fth.className = 'px-3 py-2 bg-slate-50 border-b border-slate-200';
        if (col.key === 'Status') {
            fth.innerHTML = `<select class="w-full text-xs border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500 filter-input" onchange="applyFilters()"><option value="">All</option><option value="Mismatch">Mismatch</option><option value="Row Missing">Missing</option></select>`;
        } else {
            fth.innerHTML = `<div class="space-y-1"><input type="text" class="w-full text-xs border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500 filter-input" placeholder="Filter..." oninput="debouncedFilter()"><span class="text-[10px] text-slate-400 block font-normal">!Text to exclude</span></div>`;
        }
        filterRow.appendChild(fth);
    });
}

// ============================================================
//  FILTERS  (debounced)
// ============================================================
window.applyFilters = function () {
    const inputs = document.querySelectorAll('.filter-input');
    currentFilteredData = allComparisonData.filter(row =>
        tableColumns.every((col, i) => {
            if (!inputs[i]) return true;
            const raw = inputs[i].value.trim();
            if (!raw) return true;
            const cell = String(row[col.key] ?? '').toLowerCase();
            const fv = raw.toLowerCase();
            if (col.key === 'Status') return cell === fv;
            if (fv.startsWith('!')) { const nv = fv.slice(1).trim(); return !nv || !cell.includes(nv); }
            return cell.includes(fv);
        })
    );
    renderTable();
};

window.debouncedFilter = debounce(applyFilters, 200);

// ============================================================
//  RENDER TABLE  (build full string, set innerHTML once)
// ============================================================
function renderTable() {
    const tbody = document.getElementById('tableBody');
    document.getElementById('rowCountDisplay').innerText = `Showing ${currentFilteredData.length} rows`;

    const display = currentFilteredData.slice(0, 5000);

    if (!display.length) {
        if (!allComparisonData.length) {
            tbody.innerHTML = `<tr><td colspan="${tableColumns.length}" class="text-center p-8">
                <div class="flex flex-col items-center text-emerald-600">
                    <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    <span class="text-lg font-semibold">Perfect Match!</span>
                    <span class="text-sm text-slate-500">No discrepancies found.</span>
                </div></td></tr>`;
        } else {
            tbody.innerHTML = `<tr><td colspan="${tableColumns.length}" class="text-center p-8 text-slate-500">No rows match current filters.</td></tr>`;
        }
        return;
    }

    // ── Build all HTML in one string, then assign once ──
    const parts = [];
    for (const row of display) {
        let tr = `<tr><td class="p-3 text-sm text-slate-700 font-mono border-b border-gray-100">${escapeHtml(row['Unique ID'])}</td>`;

        // Status cell
        if (row.Status === 'Mismatch') {
            tr += `<td class="p-3 text-sm font-semibold border-b border-gray-100"><span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Mismatch</span></td>`;
        } else if (row.Status === 'Row Missing') {
            tr += `<td class="p-3 text-sm font-semibold text-amber-500 border-b border-gray-100"><span class="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Missing</span></td>`;
        } else {
            tr += `<td class="p-3 text-sm font-semibold border-b border-gray-100"><span class="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">Match</span></td>`;
        }

        // Data cells
        for (let i = 2; i < tableColumns.length; i++) {
            const col = tableColumns[i];
            const val = row[col.key];

            if (col.isInfo || row.Status === 'Row Missing') {
                const display = typeof val === 'object' ? '' : escapeHtml(val ?? '');
                tr += `<td class="p-3 text-sm text-slate-500 italic bg-gray-50 border-b border-gray-100">${display}</td>`;
            } else if (val && typeof val === 'object' && val.mismatch) {
                tr += `<td class="p-3 text-sm border-b border-red-100 bg-red-50 text-red-700">
                    <div class="line-through text-red-400 text-xs">${escapeHtml(val.v1) || '(empty)'}</div>
                    <div class="font-bold">${escapeHtml(val.v2) || '(empty)'}</div>
                </td>`;
            } else if (val && typeof val === 'object' && val.match) {
                tr += `<td class="p-3 border-b border-gray-100 text-center"><svg class="w-4 h-4 text-emerald-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></td>`;
            } else {
                tr += `<td class="p-3 text-sm text-amber-700 bg-amber-50 border-b border-amber-100 font-medium">Missing</td>`;
            }
        }

        tr += '</tr>';
        parts.push(tr);
    }

    tbody.innerHTML = parts.join('');

    if (currentFilteredData.length > 5000) {
        tbody.innerHTML += `<tr><td colspan="${tableColumns.length}" class="text-center p-4 text-slate-500 italic">...Display limited to 5,000 rows. Export to see all.</td></tr>`;
    }
}

// ============================================================
//  EXPORT
// ============================================================
window.exportReport = function () {
    if (!currentFilteredData.length) { showToast('No data to export.', 'warning'); return; }

    showLoading('Preparing export...', 50);
    setTimeout(() => {
        try {
            const exportData = currentFilteredData.map(row => {
                const clean = {};
                tableColumns.forEach(col => {
                    const v = row[col.key];
                    if (v && typeof v === 'object') {
                        clean[col.label] = v.mismatch ? `${v.v1} → ${v.v2}` : (v.match ? '✓' : '');
                    } else {
                        clean[col.label] = v ?? '';
                    }
                });
                return clean;
            });
            updateLoadingProgress('Writing Excel file...', 80);
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Reconciliation Report');
            XLSX.writeFile(wb, 'Filtered_Discrepancies.xlsx');
            showToast('Report exported!', 'success');
        } catch (err) {
            showToast('Export failed: ' + err.message, 'error');
        } finally {
            hideLoading();
        }
    }, 30);
};
