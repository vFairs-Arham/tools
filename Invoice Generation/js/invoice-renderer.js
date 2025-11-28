// js/invoice-renderer.js
import { log } from './app.js';

// Format Currency
function formatCurrency(num) {
    if (isNaN(num)) return "$0.00";
    return "$" + Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Inject Data into the Hidden Template
function fillTemplate(row) {
    const userId = row['User ID'] || 'Unknown';
    const firstName = row['First Name'] || '';
    const lastName = row['Last Name'] || '';

    // IDs must match index.html template IDs
    document.getElementById('tpl-user-id').textContent = userId;
    document.getElementById('tpl-date').textContent = row['Date Registered'] || new Date().toLocaleDateString();

    document.getElementById('tpl-user-details').innerHTML = `
        <p style="margin: 5px 0;"><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${row['Email'] || 'N/A'}</p>
    `;

    document.getElementById('tpl-package-name').textContent = row['Package Name'] || 'Standard Package';
    document.getElementById('tpl-payment-date').textContent = row['Date Registered'] || '--';

    // Calculations
    const pkgAmount = parseFloat(row['Package Amount']) || 0;
    const paidAmount = parseFloat(row['Paid Amount']) || 0;
    const discount = pkgAmount - paidAmount;

    document.getElementById('tpl-sub-total').textContent = formatCurrency(pkgAmount);
    document.getElementById('tpl-sub-total-summary').textContent = formatCurrency(pkgAmount);
    document.getElementById('tpl-discount').textContent = formatCurrency(discount);
    document.getElementById('tpl-total').textContent = formatCurrency(paidAmount);
    document.getElementById('tpl-total-invoiced').textContent = formatCurrency(paidAmount);
}

// Generate Single PDF (Preview)
export async function generateSinglePdf(row, filenameCol) {
    fillTemplate(row);

    const element = document.getElementById('invoice-element');
    const fileName = getSafeFilename(row, filenameCol);

    const opt = {
        margin: 0.5,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Use html2pdf to download directly
    await html2pdf().set(opt).from(element).save();
}

// Generate Bulk ZIP
export async function generateBulkZip(dataRows, filenameCol, onProgress) {
    const zip = new JSZip();
    const folder = zip.folder("Invoices");
    const element = document.getElementById('invoice-element');

    for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];

        // Update Progress
        const percent = Math.round(((i + 1) / dataRows.length) * 100);
        onProgress(percent, `Generating ${i + 1} of ${dataRows.length}...`);

        try {
            fillTemplate(row);
            const fileName = getSafeFilename(row, filenameCol);

            const opt = {
                margin: 0.5,
                filename: fileName,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

            // Generate Blob
            const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
            folder.file(fileName, pdfBlob);

            log(`Generated: ${fileName}`, 'info');

        } catch (err) {
            log(`Failed to generate row ${i}: ${err.message}`, 'error');
        }
    }

    onProgress(100, "Compressing Zip...");
    const zipContent = await zip.generateAsync({ type: "blob" });
    saveAs(zipContent, "Invoices.zip");
}

function getSafeFilename(row, colName) {
    let raw = row[colName];
    if (!raw) raw = row['User ID'] || 'Invoice';

    // Sanitize filename
    const safe = String(raw).replace(/[^a-z0-9_-]/gi, '_').trim();
    return `Invoice_${safe}.pdf`;
}