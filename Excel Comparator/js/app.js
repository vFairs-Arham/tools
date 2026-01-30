// --- STATE VARIABLES ---
let mode = 'single';
let wb1 = null;
let wb2 = null;
let activeProfile = null;

let allComparisonData = [];
let currentFilteredData = [];
let tableColumns = [];

const INFO_ONLY_TAG = "___INFO_ONLY___";

// --- UTILITY: HTML Escape to prevent XSS ---
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// --- UTILITY: Show/Hide Loading Indicator ---
function showLoading(message = 'Processing...') {
    const loader = document.getElementById('loadingOverlay');
    const loaderText = document.getElementById('loadingText');
    if (loader) {
        loaderText.textContent = message;
        loader.classList.remove('hidden');
    }
}

function hideLoading() {
    const loader = document.getElementById('loadingOverlay');
    if (loader) {
        loader.classList.add('hidden');
    }
}

// --- UTILITY: Show Toast Notification ---
function showToast(message, type = 'info') {
    const toast = document.getElementById('toastNotification');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (!toast) return;

    toastMessage.textContent = message;

    // Reset classes
    toast.className = 'fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 transform transition-all duration-300';

    if (type === 'success') {
        toast.classList.add('bg-emerald-600', 'text-white');
        toastIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>';
    } else if (type === 'error') {
        toast.classList.add('bg-red-600', 'text-white');
        toastIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>';
    } else if (type === 'warning') {
        toast.classList.add('bg-amber-500', 'text-white');
        toastIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>';
    } else {
        toast.classList.add('bg-sky-600', 'text-white');
        toastIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>';
    }

    toast.classList.remove('hidden', 'translate-y-full', 'opacity-0');

    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 4000);
}

// --- PROFILE LOGIC (BROWSER + FILE) ---

// Make functions globally available
window.loadProfileFromFile = function (input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const profile = JSON.parse(e.target.result);
            loadProfileData(profile);
            showToast('Profile loaded successfully!', 'success');
        } catch (err) {
            showToast('Invalid Profile File. Please select a valid JSON file.', 'error');
        }
    };

    // FIX: Added onerror handler for FileReader
    reader.onerror = function (e) {
        showToast('Failed to read the profile file. Please try again.', 'error');
    };

    reader.readAsText(file);
    input.value = ''; // Reset input so same file can be selected again
}

function generateProfileObject() {
    // Helper to gather current state into an object
    const mappings = [];
    document.querySelectorAll('.map-select').forEach((select, index) => {
        if (select.value) {
            const dateChecks = document.querySelectorAll('.date-check');
            mappings.push({
                source: select.getAttribute('data-source'),
                target: select.value,
                isDate: dateChecks[index] ? dateChecks[index].checked : false
            });
        }
    });

    const filters = {};
    document.querySelectorAll('.filter-input').forEach((input, index) => {
        // FIX: Check if tableColumns[index] exists before accessing
        if (tableColumns[index]) {
            filters[tableColumns[index].key] = input.value;
        }
    });

    const keySelect = document.getElementById('keyColumnSelect');
    const keyCol = keySelect ? keySelect.value : "";

    return {
        mappings: mappings,
        keyCol: keyCol,
        filters: filters,
        timestamp: new Date().toLocaleString()
    };
}

// 1. Browser Storage
window.saveProfileToBrowser = function () {
    const profile = generateProfileObject();
    try {
        localStorage.setItem('excel_comparator_profile', JSON.stringify(profile));
        updateStatus(`✅ Quick Saved to Browser (${profile.timestamp})`);
        showToast('Profile saved to browser!', 'success');
    } catch (err) {
        showToast('Failed to save profile. Browser storage may be full.', 'error');
    }
}

// FIX: Added try-catch for loadProfileFromBrowser
window.loadProfileFromBrowser = function () {
    try {
        const savedRaw = localStorage.getItem('excel_comparator_profile');
        if (!savedRaw) {
            showToast('No saved profile found in browser.', 'warning');
            return;
        }
        const profile = JSON.parse(savedRaw);
        loadProfileData(profile);
        showToast('Profile loaded from browser!', 'success');
    } catch (err) {
        showToast('Saved profile is corrupted. Please import a new profile.', 'error');
        localStorage.removeItem('excel_comparator_profile'); // Clean up corrupted data
    }
}

// 2. File Storage (Download/Upload)
window.downloadProfile = function () {
    const profile = generateProfileObject();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "comparator_profile.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    updateStatus(`⬇️ Exported Profile to file.`);
    showToast('Profile exported!', 'success');
}

// Common Loader
function loadProfileData(profile) {
    activeProfile = profile;
    updateStatus(`📂 Profile Loaded! Settings apply automatically.`);
    const statusEl = document.getElementById('profileStatus');
    statusEl.classList.add('text-emerald-600', 'font-semibold');
    statusEl.classList.remove('text-slate-500');

    if (!document.getElementById('sheetConfigSection').classList.contains('hidden')) applyProfileKey();
    if (!document.getElementById('mappingSection').classList.contains('hidden')) applyProfileMappings();
    if (!document.getElementById('resultsSection').classList.contains('hidden')) applyProfileFilters();
}

function updateStatus(msg) {
    document.getElementById('profileStatus').innerText = "Status: " + msg;
}

// --- APPLY HELPERS ---
function applyProfileKey() {
    if (!activeProfile) return;
    const keySelect = document.getElementById('keyColumnSelect');
    if (keySelect && activeProfile.keyCol) {
        if ([...keySelect.options].some(o => o.value === activeProfile.keyCol)) {
            keySelect.value = activeProfile.keyCol;
        }
    }
}

function applyProfileMappings() {
    if (!activeProfile) return;
    activeProfile.mappings.forEach(m => {
        const dropdown = document.querySelector(`.map-select[data-source="${CSS.escape(m.source)}"]`);
        if (dropdown) {
            dropdown.value = m.target;
            const row = dropdown.closest('.mapping-row');
            if (row) {
                const dateCheck = row.querySelector('.date-check');
                if (dateCheck) dateCheck.checked = m.isDate;
            }
        }
    });
}

// FIX: Added bounds checking for applyProfileFilters
function applyProfileFilters() {
    if (!activeProfile || !activeProfile.filters) return;
    let hasFilter = false;
    const inputs = document.querySelectorAll('.filter-input');

    inputs.forEach((input, index) => {
        // FIX: Check if tableColumns[index] exists
        if (!tableColumns[index]) return;

        const colKey = tableColumns[index].key;
        if (activeProfile.filters[colKey]) {
            input.value = activeProfile.filters[colKey];
            hasFilter = true;
        }
    });
    if (hasFilter) applyFilters();
}

// --- MODE SWITCHER ---
window.setMode = function (selectedMode) {
    mode = selectedMode;
    // Reset classes
    document.querySelectorAll('.mode-btn').forEach(b => {
        b.classList.remove('ring-2', 'ring-sky-500', 'bg-sky-50', 'border-sky-500');
        b.classList.add('border-slate-200', 'hover:border-sky-500');
    });

    // Add active classes
    const activeBtn = document.getElementById(mode === 'single' ? 'modeSingle' : 'modeDual');
    activeBtn.classList.remove('border-slate-200', 'hover:border-sky-500');
    activeBtn.classList.add('ring-2', 'ring-sky-500', 'bg-sky-50', 'border-sky-500');

    if (mode === 'single') {
        document.getElementById('uploadSingle').classList.remove('hidden');
        document.getElementById('uploadDual').classList.add('hidden');
    } else {
        document.getElementById('uploadSingle').classList.add('hidden');
        document.getElementById('uploadDual').classList.remove('hidden');
    }

    // FIX: Reset workbooks and clear file inputs
    wb1 = null;
    wb2 = null;

    // FIX: Clear file input values on mode switch
    document.getElementById('fileInputCommon').value = '';
    document.getElementById('fileInputA').value = '';
    document.getElementById('fileInputB').value = '';

    document.getElementById('sheetConfigSection').classList.add('hidden');
    document.getElementById('mappingSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
}

// FIX: Added Reset Tool function
window.resetTool = function () {
    // Reset state
    wb1 = null;
    wb2 = null;
    allComparisonData = [];
    currentFilteredData = [];
    tableColumns = [];

    // Reset file inputs
    document.getElementById('fileInputCommon').value = '';
    document.getElementById('fileInputA').value = '';
    document.getElementById('fileInputB').value = '';

    // Reset dropdowns
    document.getElementById('sheet1Select').innerHTML = '<option value="">Select Reference Sheet...</option>';
    document.getElementById('sheet2Select').innerHTML = '<option value="">Select Comparison Sheet...</option>';
    document.getElementById('keyColumnSelect').innerHTML = '<option value="">Select Unique ID...</option>';

    // Clear mapping container
    document.getElementById('mappingContainer').innerHTML = '';

    // Hide sections
    document.getElementById('sheetConfigSection').classList.add('hidden');
    document.getElementById('mappingSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');

    // Reset to single mode
    setMode('single');

    showToast('Tool has been reset. Ready for new comparison.', 'info');
}

// --- FILE INPUTS ---
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fileInputCommon').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        showLoading('Reading Excel file...');

        try {
            const data = await file.arrayBuffer();
            // FIX: Wrapped XLSX.read in try-catch
            wb1 = XLSX.read(data, { cellDates: true });
            wb2 = wb1;
            populateSheetDropdowns();
            showToast('File loaded successfully!', 'success');
        } catch (err) {
            showToast('Failed to read file. It may be corrupted, password-protected, or in an unsupported format.', 'error');
            e.target.value = ''; // Reset the input
            wb1 = null;
            wb2 = null;
        } finally {
            hideLoading();
        }
    });

    document.getElementById('fileInputA').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        showLoading('Reading Reference File (A)...');

        try {
            const data = await file.arrayBuffer();
            // FIX: Wrapped XLSX.read in try-catch
            wb1 = XLSX.read(data, { cellDates: true });
            showToast('File A loaded!', 'success');
            checkDualReady();
        } catch (err) {
            showToast('Failed to read File A. It may be corrupted or in an unsupported format.', 'error');
            e.target.value = '';
            wb1 = null;
        } finally {
            hideLoading();
        }
    });

    document.getElementById('fileInputB').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        showLoading('Reading Comparison File (B)...');

        try {
            const data = await file.arrayBuffer();
            // FIX: Wrapped XLSX.read in try-catch
            wb2 = XLSX.read(data, { cellDates: true });
            showToast('File B loaded!', 'success');
            checkDualReady();
        } catch (err) {
            showToast('Failed to read File B. It may be corrupted or in an unsupported format.', 'error');
            e.target.value = '';
            wb2 = null;
        } finally {
            hideLoading();
        }
    });

    document.getElementById('sheet1Select').addEventListener('change', (e) => {
        const sheetName = e.target.value;
        if (!sheetName) return;

        const ws = wb1.Sheets[sheetName];
        const headers = XLSX.utils.sheet_to_json(ws, { header: 1 })[0];

        // FIX: Validate that headers exist
        if (!headers || headers.length === 0) {
            showToast('Selected sheet is empty or has no headers.', 'error');
            e.target.value = '';
            return;
        }

        const keySelect = document.getElementById('keyColumnSelect');
        keySelect.innerHTML = '<option value="">Select Unique ID...</option>';
        // FIX: Use escapeHtml to prevent XSS
        headers.forEach(h => {
            const option = document.createElement('option');
            option.value = h;
            option.textContent = h;
            keySelect.appendChild(option);
        });
        applyProfileKey();
    });

    document.getElementById('btnLoadColumns').addEventListener('click', () => {
        const s1Name = document.getElementById('sheet1Select').value;
        const s2Name = document.getElementById('sheet2Select').value;

        if (!s1Name || !s2Name) {
            showToast('Please select both sheets before proceeding.', 'warning');
            return;
        }

        const h1 = XLSX.utils.sheet_to_json(wb1.Sheets[s1Name], { header: 1 })[0];
        const h2 = XLSX.utils.sheet_to_json(wb2.Sheets[s2Name], { header: 1 })[0];

        // FIX: Validate headers exist
        if (!h1 || h1.length === 0) {
            showToast('Reference sheet has no headers.', 'error');
            return;
        }
        if (!h2 || h2.length === 0) {
            showToast('Comparison sheet has no headers.', 'error');
            return;
        }

        const container = document.getElementById('mappingContainer');
        container.innerHTML = '';

        h1.forEach(col1 => {
            const exactMatch = h2.find(col2 => col2.trim().toLowerCase() === col1.trim().toLowerCase());
            // FIX: Use DOM APIs instead of innerHTML with unsanitized data
            const rowDiv = document.createElement('div');
            rowDiv.className = 'mapping-row grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-lg border border-slate-200 mb-2';

            // Use escapeHtml for display
            rowDiv.innerHTML = `
                <div class="col-span-12 md:col-span-4 font-medium text-slate-700 truncate" title="${escapeHtml(col1)}">Ref: ${escapeHtml(col1)}</div>
                <div class="col-span-12 md:col-span-1 text-center text-slate-400 hidden md:block">
                    <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
                <div class="col-span-12 md:col-span-4">
                    <select class="form-select w-full rounded-md border-slate-300 py-2 text-sm focus:border-sky-500 focus:ring-sky-500 map-select" data-source="${escapeHtml(col1)}">
                        <option value="">(Skip)</option>
                        <option value="${INFO_ONLY_TAG}" class="font-bold text-blue-600">(👀 Show Info Only)</option>
                        <optgroup label="Compare Against:">
                        </optgroup>
                    </select>
                </div>
                <div class="col-span-12 md:col-span-3 flex justify-end">
                    <label class="inline-flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" class="form-checkbox text-sky-600 rounded border-slate-300 focus:ring-sky-500 date-check" />
                        <span class="text-sm text-slate-500">Is Date?</span>
                    </label>
                </div>
            `;

            // Populate options safely
            const select = rowDiv.querySelector('.map-select');
            const optgroup = select.querySelector('optgroup');
            h2.forEach(col2 => {
                const option = document.createElement('option');
                option.value = col2;
                option.textContent = col2;
                if (col2 === exactMatch) option.selected = true;
                optgroup.appendChild(option);
            });

            container.appendChild(rowDiv);
        });

        document.getElementById('mappingSection').classList.remove('hidden');
        applyProfileMappings();
    });
});

function checkDualReady() { if (wb1 && wb2) populateSheetDropdowns(); }

function populateSheetDropdowns() {
    const s1 = document.getElementById('sheet1Select');
    const s2 = document.getElementById('sheet2Select');
    s1.innerHTML = '<option value="">Select Reference Sheet...</option>';
    s2.innerHTML = '<option value="">Select Comparison Sheet...</option>';

    // FIX: Use DOM APIs instead of innerHTML
    wb1.SheetNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        s1.appendChild(option);
    });
    wb2.SheetNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        s2.appendChild(option);
    });

    document.getElementById('sheetConfigSection').classList.remove('hidden');
}


// --- COMPARISON ---
window.performComparison = function () {
    const s1Name = document.getElementById('sheet1Select').value;
    const s2Name = document.getElementById('sheet2Select').value;
    const keyCol = document.getElementById('keyColumnSelect').value;

    // FIX: Validate key column is selected
    if (!keyCol) {
        showToast('Please select a Unique Identifier (Key Column).', 'warning');
        return;
    }

    const activeMappings = [];
    document.querySelectorAll('.map-select').forEach((select, index) => {
        if (select.value) {
            const dateChecks = document.querySelectorAll('.date-check');
            activeMappings.push({
                source: select.getAttribute('data-source'),
                target: select.value,
                isDate: dateChecks[index] ? dateChecks[index].checked : false
            });
        }
    });

    if (activeMappings.length === 0) {
        showToast('Please map at least one column.', 'warning');
        return;
    }

    const data1 = XLSX.utils.sheet_to_json(wb1.Sheets[s1Name], { header: 0 });
    const data2 = XLSX.utils.sheet_to_json(wb2.Sheets[s2Name], { header: 0 });

    const keyMapping = activeMappings.find(m => m.source === keyCol);
    if (!keyMapping) {
        showToast(`Please map the Key Column (${keyCol}) first.`, 'warning');
        return;
    }

    showLoading('Running comparison...');

    // Use setTimeout to allow UI to update
    setTimeout(() => {
        try {
            const map2 = new Map();
            const duplicateKeys = [];

            data2.forEach(row => {
                let targetKeyName = keyMapping.target;
                if (targetKeyName === INFO_ONLY_TAG) targetKeyName = keyMapping.source;
                const rawKey = String(row[targetKeyName] || row[keyMapping.source] || "").trim();
                const keyLower = rawKey.toLowerCase();

                // FIX: Detect and warn about duplicate keys
                if (map2.has(keyLower)) {
                    duplicateKeys.push(rawKey);
                }
                map2.set(keyLower, row);
            });

            // Warn about duplicates
            if (duplicateKeys.length > 0) {
                const uniqueDupes = [...new Set(duplicateKeys)].slice(0, 5);
                showToast(`Warning: ${duplicateKeys.length} duplicate key(s) found in comparison sheet. Examples: ${uniqueDupes.join(', ')}${duplicateKeys.length > 5 ? '...' : ''}`, 'warning');
            }

            tableColumns = [{ key: "Unique ID", label: `ID (${escapeHtml(keyCol)})` }, { key: "Status", label: "Status" }];
            activeMappings.forEach(m => {
                tableColumns.push({
                    key: m.source,
                    label: escapeHtml(m.source) + (m.target === INFO_ONLY_TAG ? ' (Info)' : ''),
                    isInfo: m.target === INFO_ONLY_TAG
                });
            });

            allComparisonData = [];
            let skippedRows = 0;

            data1.forEach(row1 => {
                // FIX: Handle undefined key values safely
                const rawKeyVal = row1[keyCol];
                if (rawKeyVal === undefined || rawKeyVal === null || String(rawKeyVal).trim() === '') {
                    skippedRows++;
                    return; // Skip rows without a valid key
                }

                const keyVal1 = String(rawKeyVal).trim();
                const row2 = map2.get(keyVal1.toLowerCase());
                let rowObj = { "Unique ID": keyVal1, "Status": "Match", "_html": {} };
                let hasIssue = false;

                if (!row2) {
                    rowObj["Status"] = "Row Missing";
                    hasIssue = true;
                    activeMappings.forEach(m => {
                        const val1 = row1[m.source] || "";
                        rowObj[m.source] = m.target === INFO_ONLY_TAG ? val1 : "Missing in Target";
                        rowObj._html[m.source] = m.target === INFO_ONLY_TAG
                            ? `<td class="p-3 text-sm text-slate-500 italic bg-gray-50 border-b border-gray-100">${escapeHtml(val1)}</td>`
                            : `<td class="p-3 text-sm text-amber-700 bg-amber-50 border-b border-amber-100 font-medium">Missing</td>`;
                    });
                    rowObj._html["Status"] = `<td class="p-3 text-sm font-semibold text-amber-500 border-b border-gray-100"><span class="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Missing</span></td>`;
                } else {
                    activeMappings.forEach(m => {
                        let val1 = row1[m.source];
                        if (m.target === INFO_ONLY_TAG) {
                            val1 = val1 ? String(val1).trim() : "";
                            rowObj[m.source] = val1;
                            rowObj._html[m.source] = `<td class="p-3 text-sm text-slate-500 italic bg-gray-50 border-b border-gray-100">${escapeHtml(val1)}</td>`;
                        } else {
                            let val2 = row2[m.target];
                            if (m.isDate) { val1 = normalizeDate(val1); val2 = normalizeDate(val2); }
                            else { val1 = val1 ? String(val1).trim() : ""; val2 = val2 ? String(val2).trim() : ""; }
                            if (val1.toLowerCase() !== val2.toLowerCase()) {
                                rowObj["Status"] = "Mismatch"; hasIssue = true;
                                rowObj[m.source] = `${val1} vs ${val2}`;
                                rowObj._html[m.source] = `<td class="p-3 text-sm border-b border-red-100 bg-red-50 text-red-700">
                                    <div class="line-through text-red-400 text-xs">${escapeHtml(val1) || '(empty)'}</div>
                                    <div class="font-bold">${escapeHtml(val2) || '(empty)'}</div>
                                </td>`;
                            } else {
                                rowObj[m.source] = "";
                                rowObj._html[m.source] = `<td class="p-3 border-b border-gray-100 text-center"><svg class="w-4 h-4 text-emerald-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg></td>`;
                            }
                        }
                    });
                    rowObj._html["Status"] = hasIssue ?
                        `<td class="p-3 text-sm font-semibold border-b border-gray-100"><span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Mismatch</span></td>` :
                        `<td class="p-3 text-sm font-semibold border-b border-gray-100"><span class="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">Match</span></td>`;
                }
                if (hasIssue) allComparisonData.push(rowObj);
            });

            // Warn about skipped rows
            if (skippedRows > 0) {
                showToast(`${skippedRows} row(s) skipped due to missing key values.`, 'warning');
            }

            currentFilteredData = [...allComparisonData];
            buildTableHeaders();
            renderTable();
            document.getElementById('resultsSection').classList.remove('hidden');
            applyProfileFilters();

            // FIX: Show success message when no discrepancies found
            if (allComparisonData.length === 0) {
                showToast('🎉 Comparison complete! No discrepancies found. All data matches perfectly!', 'success');
            } else {
                showToast(`Comparison complete. Found ${allComparisonData.length} discrepancies.`, 'info');
            }

        } catch (err) {
            showToast('An error occurred during comparison: ' + err.message, 'error');
        } finally {
            hideLoading();
        }
    }, 50);
}

// --- STANDARD UTILS ---
function normalizeDate(val) {
    if (!val) return "";
    if (typeof val === 'number') return formatDateLocally(new Date(Math.round((val - 25569) * 86400 * 1000)));
    if (val instanceof Date) return formatDateLocally(val);
    let strVal = String(val).trim();
    const dmyMatch = strVal.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
    const tryDate = new Date(strVal);
    return !isNaN(tryDate.getTime()) ? formatDateLocally(tryDate) : strVal;
}
function formatDateLocally(dateObj) { return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`; }

function buildTableHeaders() {
    const headerRow = document.getElementById('headerRow');
    const filterRow = document.getElementById('filterRow');
    headerRow.innerHTML = '';
    filterRow.innerHTML = '';

    tableColumns.forEach(col => {
        // Use DOM APIs for safety
        const th = document.createElement('th');
        th.className = 'px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200';
        th.textContent = col.label;
        headerRow.appendChild(th);

        const filterTh = document.createElement('th');
        filterTh.className = 'px-3 py-2 bg-slate-50 border-b border-slate-200';

        if (col.key === "Status") {
            filterTh.innerHTML = `<select class="w-full text-xs border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500 filter-input" onchange="applyFilters()"><option value="">All</option><option value="Mismatch">Mismatch</option><option value="Row Missing">Missing</option></select>`;
        } else {
            filterTh.innerHTML = `<div class="space-y-1"><input type="text" class="w-full text-xs border-slate-300 rounded focus:ring-sky-500 focus:border-sky-500 filter-input" placeholder="Filter..." onkeyup="applyFilters()"><span class="text-[10px] text-slate-400 block font-normal">!Text to exclude</span></div>`;
        }
        filterRow.appendChild(filterTh);
    });
}

window.applyFilters = function () {
    const inputs = document.querySelectorAll('.filter-input');
    currentFilteredData = allComparisonData.filter(row => {
        return tableColumns.every((col, index) => {
            // FIX: Check if input exists at this index
            if (!inputs[index]) return true;

            const filterRaw = inputs[index].value.trim();
            if (!filterRaw) return true;
            const cellVal = String(row[col.key] || "").toLowerCase();
            const filterVal = filterRaw.toLowerCase();
            if (col.key === "Status") return cellVal === filterVal;
            if (filterVal.startsWith("!")) {
                const notVal = filterVal.substring(1).trim();
                return !notVal ? true : !cellVal.includes(notVal);
            }
            return cellVal.includes(filterVal);
        });
    });
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    document.getElementById('rowCountDisplay').innerText = `Showing ${currentFilteredData.length} rows`;
    const displayData = currentFilteredData.slice(0, 5000);
    displayData.forEach(row => {
        let tr = `<tr><td class="p-3 text-sm text-slate-700 font-mono border-b border-gray-100">${escapeHtml(row["Unique ID"])}</td>${row._html["Status"]}`;
        for (let i = 2; i < tableColumns.length; i++) tr += row._html[tableColumns[i].key];
        tbody.innerHTML += tr + `</tr>`;
    });
    if (currentFilteredData.length > 5000) tbody.innerHTML += `<tr><td colspan="${tableColumns.length}" class="text-center p-4 text-slate-500 italic">...Display limited to 5000 rows. Export to see all...</td></tr>`;

    // FIX: Better message when no data
    if (currentFilteredData.length === 0 && allComparisonData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${tableColumns.length}" class="text-center p-8">
            <div class="flex flex-col items-center text-emerald-600">
                <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span class="text-lg font-semibold">Perfect Match!</span>
                <span class="text-sm text-slate-500">No discrepancies were found between the two datasets.</span>
            </div>
        </td></tr>`;
    } else if (currentFilteredData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${tableColumns.length}" class="text-center p-8 text-slate-500">No rows match current filters.</td></tr>`;
    }
}

window.exportReport = function () {
    if (currentFilteredData.length === 0) {
        showToast('No data to export.', 'warning');
        return;
    }
    const exportData = currentFilteredData.map(row => {
        let cleanRow = {};
        tableColumns.forEach(col => cleanRow[col.label] = row[col.key]);
        return cleanRow;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reconciliation Report");
    XLSX.writeFile(wb, "Filtered_Discrepancies.xlsx");
    showToast('Report exported successfully!', 'success');
}
