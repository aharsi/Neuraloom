import axios from "axios";
import * as cheerio from "cheerio";
import type { ScanResult } from "../types.js";

/**
 * Simple keyword extraction by frequency (basic NLP).
 * @param text The text to extract keywords from.
 * @returns A string of top keywords.
 */
function extractKeywords(text: string): string {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
  ]);
  const wordFreq: Record<string, number> = {};

  words.forEach((word) => {
    if (!stopWords.has(word) && word.length > 3) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
    .join(", ");

  return sortedWords || "No keywords extracted";
}

/**
 * Fetches the HTML from a URL, cleans it, extracts metadata and segmented content,
 * and returns a structured ScanResult object. Truncates content to 10,000 characters
 * if excessively long to optimize for embeddings.
 *
 * @param url The URL to scan.
 * @returns A Promise resolving to the ScanResult.
 */
export async function scanUrl(url: string): Promise<ScanResult> {
  try {
    // Fetch HTML content
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ScannerBot/1.0)",
      },
    });
    const html = response.data;

    // Load HTML into Cheerio for parsing
    const $ = cheerio.load(html);

    // Strip scripts, styles, and unnecessary elements
    $("script, style, noscript, iframe, footer, nav, header").remove();

    // Extract title
    let title = $("title").text().trim();
    if (!title) {
      title = $("h1").first().text().trim() || "Untitled";
    }

    // Extract meta description
    const metaDescription =
      $('meta[name="description"]').attr("content")?.trim() || "";

    // Extract metadata (date and author from meta tags)
    let date: string | undefined =
      $(
        'meta[name="date"], meta[property="article:published_time"], meta[name="publication_date"]'
      ).attr("content") || undefined;
    let author: string | undefined =
      $(
        'meta[name="author"], meta[property="article:author"], meta[name="byline"]'
      ).attr("content") || undefined;

    // Extract headings (h1, h2, h3)
    const headings = $("h1, h2, h3")
      .map((i, el) => $(el).text().trim())
      .get()
      .join(" | ");

    // Extract first two paragraphs
    const paragraphs = $("p")
      .slice(0, 2)
      .map((i, el) => $(el).text().trim())
      .get();
    const introParagraphs = paragraphs.join(" ") || "";

    // Extract keywords (from meta or content)
    let keywords = $('meta[name="keywords"]').attr("content")?.trim() || "";
    if (!keywords) {
      const contentForKeywords = `${title} ${metaDescription} ${headings} ${introParagraphs}`;
      keywords = extractKeywords(contentForKeywords);
    }

    // Extract main text content (prioritize article/main, fallback to body)
    let contentElement = $("article, main");
    if (contentElement.length === 0) {
      contentElement = $("body");
    }
    let bodySummary = contentElement.text().trim().replace(/\s+/g, " ");

    // Truncate body summary if too long
    const MAX_CONTENT_LENGTH = 10000;
    if (bodySummary.length > MAX_CONTENT_LENGTH) {
      bodySummary =
        bodySummary.substring(0, MAX_CONTENT_LENGTH) + "... (truncated)";
    }

    return {
      url,
      title,
      content: bodySummary,
      date,
      author,
      meta_description: metaDescription,
      headings,
      intro_paragraphs: introParagraphs,
      keywords,
      body_summary: bodySummary,
    };
  } catch (error) {
    throw new Error(`Failed to scan URL: ${(error as Error).message}`);
  }
}
