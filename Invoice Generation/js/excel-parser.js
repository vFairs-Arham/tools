// js/excel-parser.js

let parsedData = [];
let parsedHeaders = [];

// Define STRICT requirements here
const REQUIRED_COLUMNS = ['User ID', 'Package Amount', 'Paid Amount'];

export function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

                // Parse to JSON
                const rawData = XLSX.utils.sheet_to_json(firstSheet);

                if (rawData.length === 0) {
                    throw new Error("The Excel file appears to be empty.");
                }

                // Normalize Data (Trim keys, fix casing issues)
                parsedData = rawData.map(row => {
                    const newRow = {};
                    Object.keys(row).forEach(key => {
                        const cleanKey = key.trim();
                        // Normalize specific known keys to Title Case for consistency
                        if (cleanKey.toLowerCase() === 'user id') newRow['User ID'] = row[key];
                        else if (cleanKey.toLowerCase() === 'package amount') newRow['Package Amount'] = row[key];
                        else if (cleanKey.toLowerCase() === 'paid amount') newRow['Paid Amount'] = row[key];
                        else newRow[cleanKey] = row[key];
                    });
                    return newRow;
                });

                // Validation Step
                const firstRow = parsedData[0];
                parsedHeaders = Object.keys(firstRow);

                const missing = REQUIRED_COLUMNS.filter(col => !parsedHeaders.includes(col));

                if (missing.length > 0) {
                    throw new Error(`Missing required columns: ${missing.join(', ')}. Please check your Excel headers.`);
                }

                resolve(parsedHeaders);

            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsArrayBuffer(file);
    });
}

export function getExcelData() {
    return parsedData;
}

export function getExcelHeaders() {
    return parsedHeaders;
}