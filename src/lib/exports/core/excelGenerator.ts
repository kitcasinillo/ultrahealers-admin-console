import * as XLSX from 'xlsx';
import { getAutoFitColumns, hasMeaningfulData, NO_DATA_MSG } from './utils';

export class ExcelGenerator {
  wb: XLSX.WorkBook;
  filename: string;

  constructor(filename: string) {
    this.wb = XLSX.utils.book_new();
    this.filename = filename;
  }

  addSheet(options: {
    data: any[];
    sheetName: string;
    mapFn?: (row: any, i: number) => any;
    checkKey?: string;
  }) {
    const { data, sheetName, mapFn, checkKey } = options;
    const isMeaningful = hasMeaningfulData(data, checkKey);
    const mappedData = (isMeaningful && mapFn) ? data.map(mapFn) : data;
    
    const finalData = isMeaningful ? mappedData : [{ 'Status': NO_DATA_MSG }];
    const ws = XLSX.utils.json_to_sheet(finalData);

    ws['!cols'] = getAutoFitColumns(finalData);
    XLSX.utils.book_append_sheet(this.wb, ws, sheetName);
  }

  addSheetWithHeader(options: {
    data: any[];
    sheetName: string;
    title: string;
    subTitle: string;
    dateRangeLabel?: string;
    mapFn?: (row: any, i: number) => any;
    checkKey?: string;
  }) {
    const { data, sheetName, title, subTitle, dateRangeLabel, mapFn, checkKey } = options;
    const isMeaningful = hasMeaningfulData(data, checkKey);
    const mappedData = (isMeaningful && mapFn) ? data.map(mapFn) : data;
    const finalData = isMeaningful ? mappedData : [{ 'Status': NO_DATA_MSG }];

    const header = [
      ["ULTRAHEALERS ADMIN CONSOLE"],
      [title.toUpperCase()],
      [`Section: ${subTitle}`],
      [`Generated: ${new Date().toLocaleString()}`]
    ];
    
    if (dateRangeLabel) {
      header.push([`Reporting Period: ${dateRangeLabel}`]);
    }
    header.push([]); // Spacer

    const ws = XLSX.utils.aoa_to_sheet(header);
    XLSX.utils.sheet_add_json(ws, finalData, { origin: "A7" });
    
    // Auto-width for headered sheets
    const keys = Object.keys(finalData[0]);
    ws['!cols'] = keys.map((key, i) => ({
      wch: Math.max(
        key.length,
        ...finalData.map(d => String(d[key] || '').length),
        i === 0 ? 30 : 10
      ) + 2
    }));

    XLSX.utils.book_append_sheet(this.wb, ws, sheetName);
  }

  save() {
    XLSX.writeFile(this.wb, this.filename);
  }
}
