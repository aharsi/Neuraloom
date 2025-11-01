// modules/commoncrawlConnector.ts
import axios from "axios";
import { parseStringPromise } from "xml2js";
export async function fetchLatestCommonCrawlIndex() {
    try {
        const resp = await axios.get("https://index.commoncrawl.org/collinfo.json", {
            timeout: 10000,
            headers: { "User-Agent": "NeuraLoomDiscovery/1.0" },
        });
        const coll = resp.data;
        if (!Array.isArray(coll) || coll.length === 0)
            return null;
        // coll[0] is newest usually; pick the first with an id
        const id = coll[0].id || (coll[0].name ? coll[0].name : null);
        return id;
    }
    catch (err) {
        console.error("Failed to fetch Common Crawl collinfo:", err.message);
        return null;
    }
}
/**
 * Query Common Crawl index for pages matching a prefix or pattern.
 * Note: CC index returns newline-separated JSON; we parse N lines.
 */
export async function queryCommonCrawlIndex(indexId, pattern = ".edu", limit = 100) {
    try {
        // The index endpoint:
        // https://index.commoncrawl.org/CC-MAIN-YYYY-NN-index?url=<pattern>&output=json
        const url = `https://index.commoncrawl.org/${encodeURIComponent(indexId)}-index?url=*${encodeURIComponent(pattern)}*&output=json`;
        const resp = await axios.get(url, {
            timeout: 20000,
            headers: { "User-Agent": "NeuraLoomDiscovery/1.0" },
        });
        // Response is newline-separated JSON; break into lines
        const body = typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data);
        const lines = body.split("\n").filter(Boolean).slice(0, limit);
        const entries = [];
        for (const line of lines) {
            try {
                const j = JSON.parse(line);
                if (j && j.url)
                    entries.push({
                        url: j.url,
                        title: j.filename || undefined,
                        source: "commoncrawl",
                    });
            }
            catch {
                // ignore parse errors for some lines
            }
        }
        return entries;
    }
    catch (err) {
        console.error("CommonCrawl index query failed:", err.message);
        return [];
    }
}
//# sourceMappingURL=commoncrawlconnector.js.map