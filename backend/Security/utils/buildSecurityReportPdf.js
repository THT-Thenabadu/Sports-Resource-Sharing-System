const PDFDocument = require('pdfkit');

function formatRange(fromDate, toDate) {
  const f = fromDate instanceof Date ? fromDate.toISOString().slice(0, 10) : String(fromDate);
  const t = toDate instanceof Date ? toDate.toISOString().slice(0, 10) : String(toDate);
  return `${f} to ${t}`;
}

function formatDatetime() {
  const now = new Date();
  return now.toLocaleString();
}

function drawTable(doc, headers, data, startY) {
  const margin = 50;
  const usableWidth = doc.page.width - margin * 2;
  const colWidth = usableWidth / headers.length;
  
  // Calculate dynamic heights for text wrapping
  const getRowHeight = (row, isHeader = false) => {
    doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(isHeader ? 10 : 9);
    let maxHeight = 26; // Min height
    row.forEach((cell) => {
      const h = doc.heightOfString(String(cell || ''), { width: colWidth - 14, align: 'left' });
      if (h + 12 > maxHeight) maxHeight = h + 12;
    });
    return maxHeight;
  };

  let currentY = startY;

  // Render Headers
  const headerHeight = getRowHeight(headers, true);
  if (currentY + headerHeight > doc.page.height - margin) {
    doc.addPage();
    currentY = margin;
  }
  
  // Header Background
  doc.rect(margin, currentY, usableWidth, headerHeight).fillAndStroke('#0f4c81', '#0f4c81');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
  
  headers.forEach((h, i) => {
    doc.text(h, margin + (i * colWidth) + 7, currentY + 6, {
      width: colWidth - 14,
      align: 'left'
    });
  });
  
  currentY += headerHeight;
  
  // Render Data Rows
  data.forEach((row, rowIndex) => {
    const rowHeight = getRowHeight(row, false);
    
    if (currentY + rowHeight > doc.page.height - 60) {
      doc.addPage();
      currentY = margin;
      
      // Reprint Headers on new page
      const hHeight = getRowHeight(headers, true);
      doc.rect(margin, currentY, usableWidth, hHeight).fillAndStroke('#0f4c81', '#0f4c81');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
      headers.forEach((h, i) => {
        doc.text(h, margin + (i * colWidth) + 7, currentY + 6, { width: colWidth - 14, align: 'left' });
      });
      currentY += hHeight;
    }
    
    // Alternating row colors
    if (rowIndex % 2 === 0) {
      doc.rect(margin, currentY, usableWidth, rowHeight).fill('#f9fafb');
    }
    
    // Row underline
    doc.lineWidth(0.5).strokeColor('#e2e8f0');
    doc.moveTo(margin, currentY + rowHeight).lineTo(margin + usableWidth, currentY + rowHeight).stroke();
    
    doc.fillColor('#334155').font('Helvetica').fontSize(9);
    row.forEach((cell, i) => {
      doc.text(String(cell != null ? cell : ''), margin + (i * colWidth) + 7, currentY + 6, {
        width: colWidth - 14,
        align: 'left'
      });
    });
    
    currentY += rowHeight;
  });
  
  return currentY;
}

/**
 formatted PDF report 
 */
function streamSecurityReportPdf(res, { reportType, fromDate, toDate, title, sections }) {
  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
  const filename = `sportek-${reportType}-${formatRange(fromDate, toDate).replace(/\s/g, '')}.pdf`.replace(/to/g, '-');

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  doc.pipe(res);

  // --- Document Header ---
  doc.rect(0, 0, doc.page.width, 85).fill('#041c39');
  
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(22);
  doc.text('Sportek Security', 50, 25);
  doc.fillColor('#a9d6f7').font('Helvetica').fontSize(11);
  doc.text('Property Management Report', 50, 52);

  // --- Report Details ---
  let cursorY = 110;
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(16);
  doc.text(title, 50, cursorY);
  
  cursorY += 24;
  doc.fillColor('#475569').font('Helvetica').fontSize(10);
  doc.text(`Reporting Period: ${formatRange(fromDate, toDate)}`, 50, cursorY);
  doc.text(`Generated On: ${formatDatetime()}`, 50, cursorY + 14);

  cursorY += 45;

  // --- Render Sections ---
  sections.forEach((section) => {
    if (cursorY > doc.page.height - 120) {
      doc.addPage();
      cursorY = 50;
    }

    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(13);
    doc.text(section.heading, 50, cursorY);
    
    // Sub-underline for section heading
    doc.lineWidth(1).strokeColor('#cbd5e1');
    doc.moveTo(50, cursorY + 16).lineTo(doc.page.width - 50, cursorY + 16).stroke();
    cursorY += 28;

    if (section.paragraph) {
      doc.fillColor('#475569').font('Helvetica').fontSize(10);
      doc.text(section.paragraph, 50, cursorY, { width: doc.page.width - 100, align: 'justify' });
      cursorY += doc.heightOfString(section.paragraph, { width: doc.page.width - 100 }) + 15;
    }

    if (section.rows && section.rows.length) {
      doc.fillColor('#334155').font('Helvetica').fontSize(10);
      section.rows.forEach((line) => {
        doc.text(`•  ${line}`, 55, cursorY);
        cursorY += 16;
      });
      cursorY += 15;
    }

    if (section.table) {
      cursorY = drawTable(doc, section.table.headers, section.table.data, cursorY);
      cursorY += 25;
    }
  });

  // --- Footer Page Numbers ---
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fillColor('#94a3b8').fontSize(8).font('Helvetica');
    const footerText = `Page ${i + 1} of ${pages.count}  |  Sportek Security Official Report`;
    doc.text(footerText, 0, doc.page.height - 35, { align: 'center', width: doc.page.width });
  }

  doc.end();
}

module.exports = { streamSecurityReportPdf, formatRange };
