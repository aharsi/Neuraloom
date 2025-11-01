import type { ScanResult, EmbeddingResult, PageRecord, ReconstructionRecord, PendingScanRecord } from "./types.js";
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
/**
 * Saves a scanned page and its embeddings to Supabase.
 * @param scanResult The scanned page data.
 * @param embeddingResult The embedding vectors (combined and meta).
 * @returns The saved page record.
 */
export declare function savePage(scanResult: ScanResult, embeddingResult: EmbeddingResult): Promise<PageRecord>;
/**
 * Retrieves a page by its URL.
 * @param url The URL of the page.
 * @returns The page record or null if not found.
 */
export declare function getPageByURL(url: string): Promise<PageRecord | null>;
/**
 * Retrieves a page by its ID.
 * @param id The ID of the page.
 * @returns The page record or null if not found.
 */
export declare function getPageById(id: string): Promise<PageRecord | null>;
/**
 * Marks a page as decayed by its ID.
 * @param id The ID of the page.
 * @returns The updated page record.
 */
export declare function markPageDecayed(id: string): Promise<PageRecord>;
/**
 * Saves a reconstruction for a page.
 * @param pageId The ID of the page.
 * @param reconstruction The reconstructed content.
 * @returns The saved reconstruction record.
 */
export declare function saveReconstruction(pageId: string, reconstruction: string): Promise<ReconstructionRecord>;
/**
 * Retrieves all active (non-decayed) pages.
 * @returns An array of active page records.
 */
export declare function getAllActivePages(): Promise<PageRecord[]>;
/**
 * Save a scanned and embedded page into Supabase with extras.
 */
export declare function savePageWithExtras(scan: ScanResult, emb: EmbeddingResult, extras?: {
    source?: string;
    metadata?: any;
}): Promise<PageRecord>;
/**
 * Add pending scan to queue
 */
export declare function addPendingScan(url: string, source?: string, priority?: number, metadata?: any): Promise<PendingScanRecord>;
export declare function getPendingBatch(batchSize?: number): Promise<PendingScanRecord[]>;
export declare function markPendingProcessing(id: string): Promise<void>;
export declare function markPendingDone(id: string): Promise<void>;
export declare function markPendingFailed(id: string, reason?: string): Promise<void>;
export declare function getPendingById(id: string): Promise<PendingScanRecord | null>;
//# sourceMappingURL=supabaseClient.d.ts.map