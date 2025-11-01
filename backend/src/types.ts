/**
 * Interface for the scan result from scanner module.
 */
export interface ScanResult {
  url: string;
  title: string;
  content: string;

  // optional metadata
  date?: string;
  author?: string;
  meta_description?: string;

  headings?: string;
  intro_paragraphs?: string;
  keywords?: string;
  body_summary?: string;

  // optional: where it came from
  source?: string;

  // ✅ NEW: optional decay + reconstruction info (used later)
  decay_probability?: number;
  reconstruction_hints?: {
    keywords?: string[];
    summary?: string;
  };
}

/**
 * Interface for the embedding result from embeddings module.
 */
export interface EmbeddingResult {
  embedding: number[]; // core embedding (content-based)
  combinedEmbedding: number[]; // combined text + meta vector
  metaEmbeddings?: Record<string, number[]>; // optional per-section vectors
}

/**
 * Interface for a stored page record in Supabase.
 */
export interface PageRecord extends ScanResult {
  id: string;
  created_at: string;
  is_decayed: boolean;

  // embeddings stored in DB
  embedding_combined: number[];
  embedding_meta?: Record<string, number[]>;

  // ✅ optional fields to match Supabase table
  reconstruction_hints?: {
    keywords?: string[];
    summary?: string;
    decayProbability?: number;
  };
}

/**
 * Interface for an embedding record in Supabase.
 */
export interface EmbeddingRecord {
  id: string;
  page_id: string;
  embedding: number[];
  created_at: string;
}

/**
 * Interface for a stored reconstruction record in Supabase.
 */
export interface ReconstructionRecord {
  id: string;
  page_id: string;
  reconstruction: string;
  created_at: string;
}

/**
 * Interface for reconstruction input.
 */
export interface ReconstructionInput {
  pageId?: string;
  embedding?: number[] | null;
}

/**
 * Interface for pending_scan table record.
 */
export interface PendingScanRecord {
  id: string;
  url: string;
  source?: string;
  priority?: number;
  status?: "pending" | "processing" | "failed" | "done";
  metadata?: Record<string, any>;
  added_at?: string;
  last_attempted?: string | null;
  attempts?: number;
}

export interface DecayCheckResult {
  url: string;
  isDecayed: boolean;
  status?: number;
  error?: string;
}
