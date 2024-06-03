const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

/**
 * Merges multiple PDF files into a single PDF.
 * @param {string[]} pdfPaths - An array of file paths to the PDFs to be merged.
 * @param {string} outputPath - The file path to save the merged PDF.
 */
async function mergePDFs(pdfPaths, outputPath) {
  const mergedPdf = await PDFDocument.create();

  for (const pdfPath of pdfPaths) {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  fs.writeFileSync(outputPath, mergedPdfBytes);
  console.log(`Merged PDF saved to ${outputPath}`);
}

// Example usage: Merge 'pdf1.pdf' and 'pdf2.pdf' into 'output.pdf'
const pdfsToMerge = ['pdf1.pdf', 'pdf2.pdf'];
mergePDFs(pdfsToMerge, 'output.pdf');
