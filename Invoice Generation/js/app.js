// js/app.js
import { parseExcelFile, getExcelData, getExcelHeaders } from './excel-parser.js';
import { generateSinglePdf, generateBulkZip } from './invoice-renderer.js';

// DOM Elements
const fileInput = document.getElementById('excelFile');
const fileNameDisplay = document.getElementById('file-name-display');
const configSection = document.getElementById('config-section');
const generateSection = document.getElementById('generate-section');
const filenameSelect = document.getElementById('filename-column-select');
const uploadError = document.getElementById('upload-error');
const logWindow = document.getElementById('log-window');
const btnPreview = document.getElementById('btnPreview');
const btnAll = document.getElementById('btnAll');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');
const statusBar = document.getElementById('status-bar');

// State
let isProcessing = false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. File Upload Handler
    fileInput.addEventListener('change', handleFileUpload);

    // 2. Button Handlers
    btnPreview.addEventListener('click', () => startProcess('single'));
    btnAll.addEventListener('click', () => startProcess('all'));

    // 3. Clear Log Handler
    document.getElementById('clear-log').addEventListener('click', () => {
        logWindow.innerHTML = '';
        log('Log cleared.', 'info');
    });
});

async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Reset UI
    configSection.classList.add('hidden');
    generateSection.classList.add('hidden');
    uploadError.classList.add('hidden');
    fileNameDisplay.classList.remove('hidden');
    fileNameDisplay.textContent = file.name;

    log(`Reading file: ${file.name}...`, 'info');

    try {
        const headers = await parseExcelFile(file);
        log(`File parsed successfully. Found ${headers.length} columns.`, 'success');

        // Populate Filename Column Select
        populateColumnSelect(headers);

        // Show Next Steps
        configSection.classList.remove('hidden');
        generateSection.classList.remove('hidden');

    } catch (error) {
        log(`Error: ${error.message}`, 'error');
        uploadError.textContent = error.message;
        uploadError.classList.remove('hidden');
        fileNameDisplay.classList.add('hidden');
        fileInput.value = ''; // Clear input
    }
}

function populateColumnSelect(headers) {
    filenameSelect.innerHTML = '';

    // Add default smart options if present
    const preferred = ['User ID', 'Email', 'Full Name', 'Name'];

    // Create options
    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        filenameSelect.appendChild(option);

        // Auto-select preference
        if (preferred.includes(header) && filenameSelect.value === headers[0]) {
            filenameSelect.value = header;
        }
    });
}

async function startProcess(mode) {
    if (isProcessing) return;
    isProcessing = true;

    const data = getExcelData();
    const filenameCol = filenameSelect.value;

    if (!data || data.length === 0) {
        alert("No data found.");
        isProcessing = false;
        return;
    }

    // UI Updates
    btnPreview.disabled = true;
    btnAll.disabled = true;
    statusBar.classList.remove('hidden');
    progressBar.style.width = '0%';

    log(`Starting ${mode === 'single' ? 'Preview' : 'Bulk Generation'}...`, 'info');

    try {
        if (mode === 'single') {
            await generateSinglePdf(data[0], filenameCol);
            log('Preview generated successfully.', 'success');
        } else {
            await generateBulkZip(data, filenameCol, (progress, message) => {
                progressBar.style.width = `${progress}%`;
                statusText.textContent = message;
            });
            log('Batch generation completed.', 'success');
        }
    } catch (error) {
        log(`Process failed: ${error.message}`, 'error');
        console.error(error);
    } finally {
        isProcessing = false;
        btnPreview.disabled = false;
        btnAll.disabled = false;
        statusText.textContent = "Ready";
    }
}

// Global Logger
export function log(message, type = 'info') {
    const div = document.createElement('div');
    div.className = `log-entry log-${type}`;
    div.textContent = `> ${message}`;
    logWindow.appendChild(div);
    logWindow.scrollTop = logWindow.scrollHeight;
}