import { CohereClient } from "cohere-ai";
import { supabase } from "../supabaseClient.js";
/**
 * Retrieves the embedding and metadata for a page from Supabase.
 * @param pageId The ID of the page.
 * @returns The embedding vector and page metadata or null if not found.
 */
async function getEmbeddingAndMetaByPageId(pageId) {
    try {
        // Fetch embedding
        const { data: embeddingData, error: embeddingError } = await supabase
            .from("embeddings")
            .select("embedding")
            .eq("page_id", pageId)
            .single();
        if (embeddingError) {
            throw new Error(`Failed to retrieve embedding: ${embeddingError.message}`);
        }
        // Fetch page metadata
        const { data: pageData, error: pageError } = await supabase
            .from("pages")
            .select("title, meta_description, headings, intro_paragraphs, keywords, embedding_meta")
            .eq("id", pageId)
            .single();
        if (pageError) {
            throw new Error(`Failed to retrieve page metadata: ${pageError.message}`);
        }
        return {
            embedding: embeddingData?.embedding || null,
            metaEmbeddings: pageData?.embedding_meta,
            page: pageData,
        };
    }
    catch (error) {
        throw new Error(`Failed to retrieve embedding and metadata for page ${pageId}: ${error.message}`);
    }
}
/**
 * Generates a human-readable summary from an embedding using Cohere's chat API.
 * Saves the summary to the Supabase reconstructions table.
 * @param input Either a pageId or an embedding vector.
 * @param apiKey The Cohere API key.
 * @returns The generated summary and saved reconstruction record.
 */
export async function reconstructPage(input, apiKey) {
    try {
        let embedding = input.embedding;
        let metaEmbeddings;
        let page;
        // If only pageId is provided, fetch the embedding and metadata from Supabase
        if (!embedding && input.pageId) {
            const result = await getEmbeddingAndMetaByPageId(input.pageId);
            embedding = result.embedding;
            metaEmbeddings = result.metaEmbeddings;
            page = result.page;
            if (!embedding) {
                throw new Error(`No embedding found for page ID ${input.pageId}`);
            }
        }
        if (!embedding) {
            throw new Error("Either pageId or embedding must be provided");
        }
        const cohere = new CohereClient({ token: apiKey });
        // Craft a prompt with enriched context from metadata
        let prompt = `
      Generate a concise, human-readable summary (100-200 words) of the content represented by this embedding vector.
      The embedding represents a webpage's main content. Focus on capturing the semantic essence in clear, natural language.
      Do not include specific details that cannot be inferred from the embedding or provided metadata.
    `;
        if (page) {
            prompt += `\nAdditional context from page metadata:
      - Title: ${page.title}
      - Meta Description: ${page.meta_description || "N/A"}
      - Headings: ${page.headings || "N/A"}
      - Intro Paragraphs: ${page.intro_paragraphs || "N/A"}
      - Keywords: ${page.keywords || "N/A"}
      `;
        }
        // Call Cohere's chat API
        const response = await cohere.chat({
            model: "command-r-08-2024",
            message: prompt,
            maxTokens: 200,
            temperature: 0.7,
        });
        const summary = response.text?.trim() || "No summary generated";
        // Save the reconstruction to Supabase
        let reconstructionRecord;
        if (input.pageId) {
            const { data, error } = await supabase
                .from("reconstructions")
                .insert({
                page_id: input.pageId,
                reconstruction: summary,
            })
                .select()
                .single();
            if (error || !data) {
                throw new Error(`Failed to save reconstruction: ${error?.message || "No data returned"}`);
            }
            reconstructionRecord = data;
        }
        else {
            // If no pageId, return a dummy record
            reconstructionRecord = {
                id: "temp-id",
                page_id: "unknown",
                reconstruction: summary,
                created_at: new Date().toISOString(),
            };
        }
        return {
            summary,
            reconstructionRecord,
        };
    }
    catch (error) {
        throw new Error(`Failed to reconstruct page: ${error.message}`);
    }
}
//# sourceMappingURL=reconstructor.js.map