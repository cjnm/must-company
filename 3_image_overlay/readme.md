# PDF Image Extraction and OCR with Translation

This script extracts images from a PDF, performs OCR (Optical Character Recognition) on the images, translates the recognized text, overlays the translated text back onto the images, and creates a PDF from the new images.

## Prerequisites

- Node.js
- npm (Node Package Manager)

## Dependencies

- pdf-lib
- pdf2pic
- tesseract.js
- sharp
- path
- fs (File System)
- bing-translate-api

Install the dependencies using npm:

```sh
npm install pdf-lib pdf2pic tesseract.js sharp path fs bing-translate-api
```