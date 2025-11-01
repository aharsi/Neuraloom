import { Router } from "express";
import { scanUrl } from "../modules/scanner.js";
import { generateEmbedding } from "../modules/embeddings.js";
import { savePage } from "../supabaseClient.js";
const router = Router();
router.post("/", async (req, res) => {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
        return res
            .status(400)
            .json({ error: "URL is required and must be a string" });
    }
    try {
        // Scan the URL
        const scanResult = await scanUrl(url);
        // Generate embedding
        const apiKey = process.env.COHERE_API_KEY || "your-api-key-here";
        const embeddingResult = await generateEmbedding(scanResult, apiKey);
        // Save to Supabase
        const pageRecord = await savePage(scanResult, embeddingResult);
        res.json({
            scan: scanResult,
            embedding: embeddingResult.combinedEmbedding,
            metaEmbeddings: embeddingResult.metaEmbeddings,
            pageId: pageRecord.id,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ error: `Failed to scan and save: ${error.message}` });
    }
});
export default router;
//# sourceMappingURL=scan.js.map