import type { ScanResult } from "../types.js";
/**
 * Fetches the HTML from a URL, cleans it, extracts metadata and segmented content,
 * and returns a structured ScanResult object. Truncates content to 10,000 characters
 * if excessively long to optimize for embeddings.
 *
 * @param url The URL to scan.
 * @returns A Promise resolving to the ScanResult.
 */
export declare function scanUrl(url: string): Promise<ScanResult>;
//# sourceMappingURL=scanner.d.ts.map