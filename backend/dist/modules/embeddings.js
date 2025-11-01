import { CohereClient } from "cohere-ai";
/**
 * Computes a weighted average of embeddings.
 * @param embeddings Array of embedding vectors.
 * @param weights Array of weights corresponding to embeddings.
 * @returns Combined embedding vector.
 */
function weightedAverage(embeddings, weights) {
    if (embeddings.length === 0 ||
        embeddings.length !== weights.length ||
        embeddings[0] === undefined) {
        // Return a zero vector if no embeddings are provided
        return new Array(1024).fill(0); // Adjust dimension based on Cohere model (e.g., 1024 for embed-english-v3.0)
    }
    const normalizedWeights = weights.length > 0
        ? weights.map((w) => w / weights.reduce((sum, w) => sum + w, 0))
        : weights;
    const dimension = embeddings[0].length;
    const combined = new Array(dimension).fill(0);
    embeddings.forEach((embedding, i) => {
        embedding.forEach((value, j) => {
            if (normalizedWeights[i] !== undefined) {
                combined[j] += value * normalizedWeights[i];
            }
        });
    });
    // Normalize to unit vector
    const magnitude = Math.sqrt(combined.reduce((sum, val) => sum + val * val, 0));
    return combined.map((val) => (magnitude > 0 ? val / magnitude : val));
}
/**
 * Converts segmented text from a ScanResult into embeddings using Cohere's embedding API.
 * Generates embeddings for each field and a weighted average combined embedding.
 * @param scanResult The ScanResult object containing segmented text.
 * @param apiKey The Cohere API key.
 * @returns A Promise resolving to the EmbeddingResult.
 */
export async function generateEmbedding(scanResult, apiKey) {
    try {
        const cohere = new CohereClient({ token: apiKey });
        // Define fields to embed and their weights
        const fields = [
            { name: "title", text: scanResult.title, weight: 0.3 },
            {
                name: "meta_description",
                text: scanResult.meta_description || "",
                weight: 0.2,
            },
            { name: "headings", text: scanResult.headings, weight: 0.2 },
            {
                name: "intro_paragraphs",
                text: scanResult.intro_paragraphs,
                weight: 0.2,
            },
            { name: "keywords", text: scanResult.keywords, weight: 0.1 },
            { name: "body_summary", text: scanResult.body_summary, weight: 0.1 },
        ];
        // Filter out empty or undefined fields
        const validFields = fields.filter((field) => field.text && field.text.trim().length > 0);
        // Generate embeddings for each field
        const texts = validFields.map((field) => field.text);
        const response = await cohere.embed({
            texts: texts,
            model: "embed-english-v3.0",
            inputType: "search_document",
        });
        const embeddings = response.embeddings;
        const metaEmbeddings = {};
        const fieldEmbeddings = [];
        const weights = [];
        validFields.forEach((field, i) => {
            if (embeddings[i]) {
                // Type guard to ensure embeddings[i] is defined
                metaEmbeddings[field.name] = embeddings[i];
                fieldEmbeddings.push(embeddings[i]);
                weights.push(field.weight);
            }
        });
        // Compute weighted average
        const combinedEmbedding = weightedAverage(fieldEmbeddings, weights);
        return {
            embedding: combinedEmbedding,
            combinedEmbedding,
            metaEmbeddings,
        };
    }
    catch (error) {
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
}
//# sourceMappingURL=embeddings.js.map