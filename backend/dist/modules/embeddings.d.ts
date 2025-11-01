import type { ScanResult, EmbeddingResult } from "../types.js";
/**
 * Converts segmented text from a ScanResult into embeddings using Cohere's embedding API.
 * Generates embeddings for each field and a weighted average combined embedding.
 * @param scanResult The ScanResult object containing segmented text.
 * @param apiKey The Cohere API key.
 * @returns A Promise resolving to the EmbeddingResult.
 */
export declare function generateEmbedding(scanResult: ScanResult, apiKey: string): Promise<EmbeddingResult>;
//# sourceMappingURL=embeddings.d.ts.map