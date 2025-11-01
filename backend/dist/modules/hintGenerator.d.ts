import type { ScanResult } from "../types.js";
/**
 * Generate a short summary (50-120 words) and 5 keywords from a scanned page.
 */
export declare function generateReconstructionHints(scan: ScanResult, apiKey: string): Promise<{
    summaryHint: any;
    keywords: any[];
}>;
//# sourceMappingURL=hintGenerator.d.ts.map