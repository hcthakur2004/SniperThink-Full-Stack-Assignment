import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

// Common English stopwords to filter out from keywords
const STOPWORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with","by",
  "is","are","was","were","be","been","being","have","has","had","do","does",
  "did","will","would","could","should","may","might","shall","can","need",
  "this","that","these","those","it","its","i","you","he","she","we","they",
  "me","him","her","us","them","my","your","his","our","their","what","which",
  "who","how","when","where","why","not","no","as","if","so","up","out","into",
  "more","also","just","about","from","than","then","there","here","all","any",
  "each","both","few","other","such","same","own","new","first","last","long",
]);

/**
 * Extract text content from a file (PDF or TXT).
 */
export async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf-8");
  }

  throw new Error(`Unsupported file type: ${ext}`);
}

/**
 * Count total words in text.
 */
export function countWords(text) {
  const words = text.match(/\b\w+\b/g);
  return words ? words.length : 0;
}

/**
 * Count paragraphs — split by blank lines.
 */
export function countParagraphs(text) {
  const paras = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return paras.length;
}

/**
 * Return top N keywords by frequency (excluding stopwords).
 */
export function extractKeywords(text, topN = 10) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

  const freq = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

/**
 * Full processing pipeline — returns result object.
 */
export async function processFile(filePath) {
  const text = await extractText(filePath);
  const wordCount = countWords(text);
  const paragraphCount = countParagraphs(text);
  const topKeywords = extractKeywords(text, 10);

  return { wordCount, paragraphCount, topKeywords };
}
