// modules/batchWorker.ts
import PQueue from "p-queue";
import pRetry from "p-retry";
import pLimit from "p-limit";
import {
  getPendingBatch,
  markPendingProcessing,
  markPendingDone,
  markPendingFailed,
} from "../supabaseClient.js";
import { scanUrl } from "./scanner.js";
import { generateEmbedding } from "./embeddings.js";
import { savePageWithExtras } from "../supabaseClient.js"; // we'll add this helper to save decayProbability & hints
import type { PendingScanRecord } from "../types.js";

const BATCH_SIZE = Number(process.env.DISCOVERY_BATCH_SIZE || 20);
const CONCURRENCY = Number(process.env.BATCH_CONCURRENCY || 4);

/**
 * Process a single pending record:
 * - mark processing
 * - scan -> embedding -> savePage (with scoring + hints)
 * - mark done / failed
 */
async function processPending(pending: PendingScanRecord) {
  const id = pending.id;
  try {
    await markPendingProcessing(id);
  } catch (err) {
    console.error("Failed to mark processing", id, (err as Error).message);
    // continue; still attempt processing
  }

  try {
    // Wrap the heavy operation in retry (e.g., transient network issues)
    await pRetry(
      async () => {
        // 1) scan
        const scan = await scanUrl(pending.url);
        // 2) embedding
        const apiKey = process.env.COHERE_API_KEY || "";
        const emb = await generateEmbedding(scan, apiKey);
        // 3) compute decay score and generate hints inside savePageWithExtras helper
        await savePageWithExtras(scan, emb, {
          source: pending.source || "discovery",
          metadata: pending.metadata || {},
        });
      },
      {
        retries: 2,
        onFailedAttempt: (err) =>
          console.warn(
            `Attempt failed for ${pending.url}: ${(err as any).message}`
          ),
      }
    );

    await markPendingDone(id);
    console.log(`Processed and saved: ${pending.url}`);
  } catch (err) {
    console.error(
      `Processing failed for ${pending.url}:`,
      (err as Error).message
    );
    try {
      await markPendingFailed(id, (err as Error).message);
    } catch (e) {
      console.error("Failed to mark pending failed:", (e as Error).message);
    }
  }
}

/**
 * Run a batch: fetch pending items, process them with concurrency.
 */
export async function runBatchScanAndEmbed() {
  console.log("Starting batchScanAndEmbed...");
  const batch = await getPendingBatch(BATCH_SIZE);
  if (!batch || batch.length === 0) {
    console.log("No pending items found.");
    return;
  }
  console.log(`Fetched ${batch.length} pending items.`);

  // process with queue/concurrency
  const limit = pLimit(CONCURRENCY);
  await Promise.all(batch.map((p) => limit(() => processPending(p))));
  console.log("Batch processing complete.");
}
