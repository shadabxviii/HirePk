import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/**
 * Extract plain text from a local PDF file path.
 * @param {string} filePath - Absolute or relative path to PDF
 * @returns {Promise<string>} Extracted text content
 */
export const extractTextFromPdf = async (filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error("PDF file not found for text extraction.");
  }

  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const text = (data.text || "").trim();

  if (!text || text.length < 20) {
    throw new Error("Could not extract meaningful text from the PDF. Ensure the file is not scanned/image-only.");
  }

  return text;
};
