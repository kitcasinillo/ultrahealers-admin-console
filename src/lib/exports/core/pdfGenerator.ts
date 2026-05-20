import { jsPDF } from 'jspdf';
import { hasMeaningfulData, NO_DATA_MSG } from './utils';

export class PDFGenerator {
  doc: jsPDF;
  currentY: number;

  constructor(orientation: 'p' | 'l' = 'p', title: string, subtitle?: string, dateRangeLabel?: string) {
    this.doc = new jsPDF(orientation, 'mm', 'a4');
    this.currentY = 20;

    this.doc.setFontSize(22);
    this.doc.setTextColor(27, 37, 75);
    this.doc.text(title, 14, this.currentY);
    this.currentY += 8;

    this.doc.setFontSize(10);
    this.doc.setTextColor(163, 174, 208);
    this.doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, this.currentY);
    this.currentY += 6;
    
    if (subtitle || dateRangeLabel) {
      const text = dateRangeLabel ? `Reporting Period: ${dateRangeLabel}` : subtitle!;
      this.doc.text(text, 14, this.currentY);
      this.currentY += 10;
    } else {
      this.currentY += 4;
    }
  }

  checkPageBreak(requiredSpace = 40) {
    if (this.currentY > this.doc.internal.pageSize.getHeight() - requiredSpace) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  addSectionTitle(title: string) {
    this.checkPageBreak();
    this.doc.setFontSize(14);
    this.doc.setTextColor(27, 37, 75);
    this.doc.text(title, 14, this.currentY);
    this.currentY += 5;
  }
}

export const generatePdf = (
  title: string,
  subtitle: string | undefined,
  dateRangeLabel: string | undefined,
  orientation: 'p' | 'l',
  filename: string,
  buildContent: (doc: jsPDF, autoTable: any, gen: PDFGenerator) => void
) => {
  const gen = new PDFGenerator(orientation, title, subtitle, dateRangeLabel);
  
  import('jspdf-autotable').then(({ default: autoTable }) => {
    buildContent(gen.doc, autoTable, gen);
    gen.doc.save(filename);
  }).catch(err => {
    console.error("Failed to generate styled PDF report:", err);
  });
};

export const addDataTable = (
  doc: jsPDF,
  autoTable: any,
  gen: PDFGenerator,
  options: {
    title?: string;
    head: string[][];
    data: any[];
    mapFn?: (row: any, index: number) => any[];
    checkKey?: string;
    theme?: 'striped' | 'grid';
    headColor?: [number, number, number];
    colSpan?: number;
    fontSize?: number;
    columnStyles?: any;
    margin?: any;
    startY?: number;
  }
) => {
  if (options.title) {
    gen.addSectionTitle(options.title);
  }

  const { 
    head, data, mapFn, checkKey, 
    theme = 'striped', headColor = [67, 24, 255], 
    fontSize = 9, colSpan, columnStyles, margin, startY 
  } = options;
  
  const body = hasMeaningfulData(data, checkKey) 
    ? (mapFn ? data.map(mapFn) : data)
    : [[{ content: NO_DATA_MSG, colSpan: colSpan || head[0].length, styles: { halign: 'center' as const, fontStyle: 'italic' as const } }]];

  autoTable(doc, {
    startY: startY || gen.currentY,
    head,
    body,
    theme,
    headStyles: { fillColor: headColor },
    styles: { fontSize, cellPadding: 2 },
    columnStyles,
    margin
  });
  
  // Only update currentY if we are the ones controlling vertical flow
  if (!margin || !margin.left || margin.left === 14) {
    gen.currentY = (doc as any).lastAutoTable.finalY + 15;
  }
};
