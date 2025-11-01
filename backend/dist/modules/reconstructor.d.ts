import type { ReconstructionRecord, ReconstructionInput } from "../types.js";
/**
 * Generates a human-readable summary from an embedding using Cohere's chat API.
 * Saves the summary to the Supabase reconstructions table.
 * @param input Either a pageId or an embedding vector.
 * @param apiKey The Cohere API key.
 * @returns The generated summary and saved reconstruction record.
 */
export declare function reconstructPage(input: ReconstructionInput, apiKey: string): Promise<{
    summary: string;
    reconstructionRecord: ReconstructionRecord;
}>;
//# sourceMappingURL=reconstructor.d.ts.map