import * as XLSX from 'xlsx';

/**
 * Converts a CSV Blob to an XLSX file and triggers a download.
 * @param {Blob} blob 
 * @param {string} fileName 
 * @returns {Promise<void>}
 */
export function convertCsvToXlsx(blob: Blob, fileName: string = 'Converted_File.xlsx') {
    // USing UTF-8 conversion CSV to XLSX to prevent from edge cases
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        try {
          const csvString = reader.result as string;
          const workbook = XLSX.read(csvString, { type: 'string', codepage: 65001 });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          for (const cell in worksheet) {
            if (cell[0] === "!") continue;
            let value = worksheet[cell].v;
            if (typeof value === 'number') {
              worksheet[cell].v = value.toString();
              worksheet[cell].z = '0'; 
            }
            if (typeof value !== 'number') {
              worksheet[cell].z = '@'; 
            }
          }
          const newWorkbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'Sheet1');
          XLSX.writeFile(newWorkbook, fileName);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
  
      reader.onerror = () => reject(reader.error);
  
      reader.readAsText(blob);
    });
  }