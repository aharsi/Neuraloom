// modules/hintGenerator.ts
import { CohereClient } from "cohere-ai";
import type { ScanResult } from "../types.js";

/**
 * Generate a short summary (50-120 words) and 5 keywords from a scanned page.
 */
export async function generateReconstructionHints(
  scan: ScanResult,
  apiKey: string
) {
  try {
    const cohere = new CohereClient({ token: apiKey });
    const text = `${scan.title}\n\n${(scan as any).content.substring(0, 4000)}`; // safe length

    // Prompt: concise summary + keywords
    const prompt = `You are an assistant. Provide:
1) A concise 60-120 word summary of the following web page content.
2) A comma-separated list of 6 keywords (single words or short phrases).
Return JSON with keys: "summary" and "keywords". Content:
---BEGIN---
${text}
---END---
`;

    const resp = await cohere.chat({
      model: "command-xlarge-nightly", // choose a powerful text model available
      message: prompt,
      maxTokens: 200,
      temperature: 0.2,
    });

    // Attempt to parse JSON from response
    const out = resp.text?.trim() || "";
    // Try to extract JSON substring
    let jsonStr = out;
    const firstBrace = out.indexOf("{");
    const lastBrace = out.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace)
      jsonStr = out.slice(firstBrace, lastBrace + 1);

    let parsed: any = null;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // fallback: naive split: first paragraph summary, last line keywords
      const lines = out
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const summary = lines.slice(0, 5).join(" ");
      const keywords = lines.length ? lines[lines.length - 1] : "";
      parsed = { summary, keywords };
    }

    const summary =
      parsed.summary ||
      parsed.summary_hint ||
      parsed.summaryHint ||
      parsed.summary_text ||
      "";
    const keywordsRaw =
      parsed.keywords ||
      parsed.keyword ||
      parsed.keywords_list ||
      parsed.keywordsRaw ||
      "";
    const keywords = Array.isArray(keywordsRaw)
      ? keywordsRaw
      : typeof keywordsRaw === "string"
      ? keywordsRaw
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean)
      : [];

    return { summaryHint: summary.trim(), keywords: keywords.slice(0, 6) };
  } catch (err) {
    console.error("Hint generation failed:", (err as Error).message);
    return {
      summaryHint: (scan as any).content.substring(0, 400).trim() + "...",
      keywords: [],
    };
  }
}
