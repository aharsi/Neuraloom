import { createClient } from "@supabase/supabase-js";
import type {
  ScanResult,
  EmbeddingResult,
  PageRecord,
  ReconstructionRecord,
  PendingScanRecord,
} from "./types.js";

import { config } from "dotenv";

import { computeDecayProbability } from "./modules/decayScorer.js";
import { generateReconstructionHints } from "./modules/hintGenerator.js";

// Load environment variables
config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL and SUPABASE_KEY must be defined in .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Saves a scanned page and its embeddings to Supabase.
 * @param scanResult The scanned page data.
 * @param embeddingResult The embedding vectors (combined and meta).
 * @returns The saved page record.
 */
export async function savePage(
  scanResult: ScanResult,
  embeddingResult: EmbeddingResult
): Promise<PageRecord> {
  try {
    // Save page data
    const { data: pageData, error: pageError } = await supabase
      .from("pages")
      .insert({
        url: scanResult.url,
        title: scanResult.title,
        content: scanResult.body_summary,
        date: scanResult.date,
        author: scanResult.author,
        meta_description: scanResult.meta_description,
        headings: scanResult.headings,
        intro_paragraphs: scanResult.intro_paragraphs,
        keywords: scanResult.keywords,
        is_decayed: false,
        embedding_combined: embeddingResult.combinedEmbedding,
        embedding_meta: embeddingResult.metaEmbeddings,
      })
      .select()
      .single();

    if (pageError || !pageData) {
      throw new Error(
        `Failed to save page: ${pageError?.message || "No data returned"}`
      );
    }

    // Save embedding data
    const { error: embeddingError } = await supabase.from("embeddings").insert({
      page_id: pageData.id,
      embedding: embeddingResult.combinedEmbedding, // Store combined embedding for consistency
    });

    if (embeddingError) {
      throw new Error(`Failed to save embedding: ${embeddingError.message}`);
    }

    return pageData as PageRecord;
  } catch (error) {
    throw new Error(
      `Failed to save page and embedding: ${(error as Error).message}`
    );
  }
}

/**
 * Retrieves a page by its URL.
 * @param url The URL of the page.
 * @returns The page record or null if not found.
 */
export async function getPageByURL(url: string): Promise<PageRecord | null> {
  try {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("url", url)
      .eq("is_decayed", false)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to retrieve page: ${error.message}`);
    }

    return (data as PageRecord) || null;
  } catch (error) {
    throw new Error(
      `Failed to retrieve page by URL: ${(error as Error).message}`
    );
  }
}

/**
 * Retrieves a page by its ID.
 * @param id The ID of the page.
 * @returns The page record or null if not found.
 */
export async function getPageById(id: string): Promise<PageRecord | null> {
  try {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("id", id)
      .eq("is_decayed", false)
      .single();

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to retrieve page: ${error.message}`);
    }

    return (data as PageRecord) || null;
  } catch (error) {
    throw new Error(
      `Failed to retrieve page by ID: ${(error as Error).message}`
    );
  }
}

/**
 * Marks a page as decayed by its ID.
 * @param id The ID of the page.
 * @returns The updated page record.
 */
export async function markPageDecayed(id: string): Promise<PageRecord> {
  try {
    const { data, error } = await supabase
      .from("pages")
      .update({ is_decayed: true })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(
        `Failed to mark page as decayed: ${
          error?.message || "No data returned"
        }`
      );
    }

    return data as PageRecord;
  } catch (error) {
    throw new Error(
      `Failed to mark page as decayed: ${(error as Error).message}`
    );
  }
}

/**
 * Saves a reconstruction for a page.
 * @param pageId The ID of the page.
 * @param reconstruction The reconstructed content.
 * @returns The saved reconstruction record.
 */
export async function saveReconstruction(
  pageId: string,
  reconstruction: string
): Promise<ReconstructionRecord> {
  try {
    const { data, error } = await supabase
      .from("reconstructions")
      .insert({
        page_id: pageId,
        reconstruction,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(
        `Failed to save reconstruction: ${error?.message || "No data returned"}`
      );
    }

    return data as ReconstructionRecord;
  } catch (error) {
    throw new Error(
      `Failed to save reconstruction: ${(error as Error).message}`
    );
  }
}

/**
 * Retrieves all active (non-decayed) pages.
 * @returns An array of active page records.
 */
export async function getAllActivePages(): Promise<PageRecord[]> {
  try {
    const { data, error } = await supabase
      .from("pages")
      .select("*")
      .eq("is_decayed", false);

    if (error) {
      throw new Error(`Failed to retrieve active pages: ${error.message}`);
    }

    return (data as PageRecord[]) || [];
  } catch (error) {
    throw new Error(
      `Failed to retrieve active pages: ${(error as Error).message}`
    );
  }
}

/**
 * All functions for managing pending scans.
 *
 * @param url
 * @param source
 * @param priority
 * @param metadata
 * @returns
 */

/**
 * Generate hints or context clues for later use (like ranking, reconstruction, etc.)
 */
function generateHints(scan: ScanResult): string[] {
  const hints: string[] = [];

  if (scan.keywords) hints.push(`Keywords: ${scan.keywords}`);
  if (scan.headings) hints.push(`Main topics: ${scan.headings}`);
  if (scan.intro_paragraphs)
    hints.push(`Intro context: ${scan.intro_paragraphs.slice(0, 120)}...`);
  if (scan.meta_description)
    hints.push(`Meta description: ${scan.meta_description}`);

  return hints;
}

/**
 * Save a scanned and embedded page into Supabase with extras.
 */
export async function savePageWithExtras(
  scan: ScanResult,
  emb: EmbeddingResult,
  extras?: { source?: string; metadata?: any }
) {
  const { source = "discovery", metadata = {} } = extras || {};

  // 1️⃣ Compute scoring & hints
  const decayProbability = await computeDecayProbability(scan.url);
  const hints = generateHints(scan);

  // 2️⃣ Prepare record
  const record: Partial<PageRecord> = {
    url: scan.url,
    title: scan.title,
    content: scan.content || scan.body_summary || "",
    date: scan.date || undefined,
    author: scan.author || undefined,
    meta_description: scan.meta_description || undefined,
    headings: scan.headings || "",
    intro_paragraphs: scan.intro_paragraphs || "",
    keywords: scan.keywords || "",
    body_summary: scan.body_summary || "",
    embedding_combined: emb.combinedEmbedding,
    embedding_meta: emb.metaEmbeddings || {},
    decay_probability: decayProbability,
    source,
    created_at: new Date().toISOString(),
    is_decayed: false,
  };

  // 3️⃣ Save to Supabase
  const { error } = await supabase.from("pages").insert(record);

  if (error) {
    console.error("❌ Supabase insert failed:", error.message);
    throw new Error(`Failed to save page: ${error.message}`);
  }

  console.log(`✅ Page saved successfully: ${scan.url}`);
  return record as PageRecord;
}

/**
 * Add pending scan to queue
 */
export async function addPendingScan(
  url: string,
  source = "discovery",
  priority = 0,
  metadata: any = {}
): Promise<PendingScanRecord> {
  const { data, error } = await supabase
    .from("pending_scan")
    .insert({ url, source, priority, metadata })
    .select()
    .single();

  if (error) throw new Error(`Failed to add pending scan: ${error.message}`);
  return data as PendingScanRecord;
}

export async function getPendingBatch(
  batchSize = 20
): Promise<PendingScanRecord[]> {
  const { data, error } = await supabase
    .from("pending_scan")
    .select("*")
    .eq("status", "pending")
    .order("priority", { ascending: false })
    .limit(batchSize);

  if (error) throw new Error(`Failed to fetch pending batch: ${error.message}`);
  return (data as PendingScanRecord[]) || [];
}

export async function markPendingProcessing(id: string): Promise<void> {
  const { data, error: fetchError } = await supabase
    .from("pending_scan")
    .select("attempts")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch pending scan: ${fetchError.message}`);
  }

  const { error: updateError } = await supabase
    .from("pending_scan")
    .update({
      status: "processing",
      last_attempted: new Date().toISOString(),
      attempts: (data?.attempts || 0) + 1,
    })
    .eq("id", id);

  if (updateError) {
    throw new Error(
      `Failed to mark pending processing: ${updateError.message}`
    );
  }
}

export async function markPendingDone(id: string): Promise<void> {
  const { error } = await supabase
    .from("pending_scan")
    .update({ status: "done" })
    .eq("id", id);

  if (error) throw new Error(`Failed to mark pending done: ${error.message}`);
}

export async function markPendingFailed(
  id: string,
  reason?: string
): Promise<void> {
  const existing = await getPendingById(id);
  const { error } = await supabase
    .from("pending_scan")
    .update({
      status: "failed",
      metadata: {
        failedReason: reason,
        ...((existing?.metadata as any) || {}),
      },
    })
    .eq("id", id);

  if (error) throw new Error(`Failed to mark pending failed: ${error.message}`);
}

export async function getPendingById(
  id: string
): Promise<PendingScanRecord | null> {
  const { data, error } = await supabase
    .from("pending_scan")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116")
    throw new Error(`Failed to get pending by id: ${error.message}`);

  return (data as PendingScanRecord) || null;
}

// export async function markPendingProcessing(id: string): Promise<void> {
//   const { error } = await supabase.rpc("increment_attempts", { id });
//   if (error) {
//     throw new Error(`Failed to mark pending processing: ${error.message}`);
//   }
// }

// /**
//  * Compute a simple decay probability based on date freshness or other signals.
//  * You can improve this model later with NLP scoring or real metrics.
//  */
// function computeDecayProbability(scan: ScanResult): number {
//   if (!scan.date) return 0.5; // neutral if no date info

//   const pageDate = new Date(scan.date);
//   const now = new Date();
//   const diffDays = (now.getTime() - pageDate.getTime()) / (1000 * 3600 * 24);

//   // Example: decay increases over 180 days
//   const decay = Math.min(1, diffDays / 180);
//   return parseFloat(decay.toFixed(3));
// }
