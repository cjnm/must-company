const { PDFDocument } = require('pdf-lib');
const { fromPath } = require('pdf2pic');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { translate } = require('bing-translate-api');

let translations = new Map();

/**
 * Extracts images from a PDF file and saves them as PNG files.
 * @param {string} pdfPath - The path to the PDF file.
 */
async function extractImages(pdfPath) {
    const pdfDoc = await PDFDocument.load(await fs.promises.readFile(pdfPath));
    const numPages = pdfDoc.getPageCount();

    const options = {
        density: 2500,
        saveFilename: "raw",
        savePath: "./images",
        format: "png"
    };

    const converter = fromPath(pdfPath, options);

    for (let i = 0; i < numPages; i++) {
        await converter(i + 1);
    }
}

/**
 * Performs OCR on a given image.
 * @param {string} imagePath - The path to the image file.
 * @returns {Promise<object>} The OCR result data.
 */
async function performOCR(imagePath) {
    const result = await Tesseract.recognize(imagePath, 'kor', {
        // logger: m => console.log(m)
    });
    return result.data;
}

/**
 * Translates a given word.
 * @param {object} word - The word object containing text and bbox.
 * @returns {Promise<string>} The translated text.
 */
async function _translate(word) {
    const skipped_words = ['>', '<', '`'];
    if (skipped_words.some(char => word.text.includes(char))) {
        return '';
    }

    if (Number(word.text) == word.text) {
        return word.text;
    }

    let translated_text = translations.get(word.text);

    if (translated_text) {
        return translated_text;
    }

    const { translation } = await translate(word.text);
    console.log({ word: word.text, translation });

    translations.set(word.text, translation);
    return translation ? translation : '?';
}

/**
 * Overlays translated text on images.
 * @param {string[]} imagePaths - The array of image paths.
 */
async function overlayTextOnImage(imagePaths) {
    for (let i = 0; i < imagePaths.length; i++) {
        const imageFile = path.join(__dirname, imagePaths[i]);
        const ocrData = await performOCR(imageFile);
        const words = ocrData.words;

        // Load the image
        let image = sharp(imageFile);
        const { width, height } = await image.metadata();

        // Create a buffer with the same size as the image to overlay text
        let svgOverlay = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

        for (let j = 0; j < words.length; j++) {
            const replacementText = await _translate(words[j]);
            const { x0, y0, x1, y1 } = words[j].bbox;

            // Create a rectangle to cover the old text and add new text
            svgOverlay += `
                <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="white"/>
                <text x="${x0}" y="${y0 + (y1 - y0)}" font-size="${y1 - y0}" fill="black">${replacementText}</text>
            `;
        }

        svgOverlay += '</svg>';

        // Composite the overlay on the original image
        await image
            .composite([{ input: Buffer.from(svgOverlay), blend: 'over' }])
            .toFile(`./images/overlay.${i + 1}.png`);
    }
}

/**
 * Creates a PDF from the overlay images.
 * @param {string[]} imagePaths - The array of overlay image paths.
 * @param {string} outputPdfPath - The path to save the output PDF.
 */
async function createPdfFromImages(imagePaths, outputPdfPath) {
    const pdfDoc = await PDFDocument.create();

    for (let imagePath of imagePaths) {
        const imageBytes = await fs.promises.readFile(imagePath);
        const image = await pdfDoc.embedPng(imageBytes);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height
        });
    }

    const pdfBytes = await pdfDoc.save();
    await fs.promises.writeFile(outputPdfPath, pdfBytes);
    console.log(`PDF created at ${outputPdfPath}`);
}

// Main function to run the process
(async () => {
    try {
        await extractImages('demo.pdf');
        await overlayTextOnImage(['./images/raw.1.png', './images/raw.2.png']);
        await createPdfFromImages(['./images/overlay.1.png', './images/overlay.2.png'], './translated.pdf');
        console.log('Image processing complete');
    } catch (err) {
        console.error('Error processing image:', err);
    }
})();
