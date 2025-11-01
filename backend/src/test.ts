import { scanUrl } from "./modules/scanner.js";
import { generateEmbedding } from "./modules/embeddings.js";
import { savePageWithExtras, getPageByURL } from "./supabaseClient.js";
import type { ScanResult } from "./types.js";

const testUrls = [
  "https://example.com",
  "https://whatispiping.com",
  "https://www.wikipedia.org",
];

(async () => {
  console.log("🚀 Starting full pipeline test...");

  for (const url of testUrls) {
    try {
      console.log(`\n🔍 Scanning URL: ${url}...`);
      const scan: ScanResult = await scanUrl(url);
      console.log("✅ Scan complete:", {
        title: scan.title,
        keywords: scan.keywords,
        bodyLength: scan.body_summary?.length,
      });

      console.log("🧠 Generating embeddings...");
      const embeddingResult = await generateEmbedding(
        scan,
        process.env.COHERE_API_KEY || ""
      );
      console.log(
        `✅ Embeddings generated. Combined vector length: ${embeddingResult.combinedEmbedding.length}`
      );

      console.log("💾 Saving page with extras...");
      const savedPage = await savePageWithExtras(scan, embeddingResult, {
        source: "test-script",
        metadata: { testRun: true },
      });
      console.log(`✅ Page saved: ${savedPage.url}`);

      console.log("📥 Fetching back from Supabase...");
      const fetched = await getPageByURL(url);
      console.log("✅ Fetched page record:", {
        title: fetched?.title,
        decayProbability: (fetched as any)?.decay_probability ?? null,
        hints: (fetched as any)?.hints ?? null,
        embeddingLength: fetched?.embedding_combined.length,
      });
    } catch (err) {
      console.error(`❌ Test failed for ${url}:`, (err as Error).message);
    }
  }

  console.log("\n🎉 Full pipeline test complete!");
})();
