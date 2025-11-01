import axios from "axios";
import { parseStringPromise } from "xml2js";
import PQueue from "p-queue";
import { supabase, addPendingScan } from "../supabaseClient.js";
const DISCOVERY_BATCH = Number(process.env.DISCOVERY_BATCH_SIZE || 50);
// Add at top
const LAST_N_HOURS = 720; // Only discover content from last 24 hours
// Helper: get cutoff time
const getCutoffDate = () => {
    const date = new Date();
    date.setHours(date.getHours() - LAST_N_HOURS);
    return date.toISOString();
};
/**
 * Canonicalize URL: remove fragments & tracking params, lowercase host.
 */
function canonicalizeUrl(raw) {
    try {
        const url = new URL(raw);
        url.hash = "";
        url.searchParams.forEach((_, k) => {
            if (k.startsWith("utm_") || ["fbclid", "gclid"].includes(k))
                url.searchParams.delete(k);
        });
        return url.toString();
    }
    catch {
        return raw;
    }
}
/**
 * Connector: arXiv RSS feed (default: Computer Science)
 */
export async function connectorArxiv(rssUrl = "https://export.arxiv.org/rss/cs") {
    try {
        const res = await axios.get(rssUrl, { timeout: 10000 });
        const parsed = await parseStringPromise(res.data);
        const items = parsed.rss.channel[0].item || [];
        const cutoff = getCutoffDate();
        return items
            .filter((it) => {
            const pubDate = it.pubDate?.[0];
            if (!pubDate)
                return false;
            return new Date(pubDate) > new Date(cutoff);
        })
            .map((it) => ({
            url: canonicalizeUrl(it.link?.[0] || it.guid?.[0] || ""),
            title: it.title?.[0],
            source: "arxiv",
        }));
    }
    catch (err) {
        console.error("arXiv connector failed:", err.message);
        return [];
    }
}
/**
 * Connector: OpenAlex (recent works)
 */
export async function connectorOpenAlex(cursor, perPage = 50) {
    try {
        const base = "https://api.openalex.org/works";
        const params = {
            "per-page": perPage,
            filter: `publication_date:>${getCutoffDate().split("T")[0]}`,
        };
        if (cursor)
            params.cursor = cursor;
        const resp = await axios.get(base, { params, timeout: 10000 });
        const results = resp.data?.results || [];
        return results.map((r) => {
            const url = r?.doi
                ? `https://doi.org/${r.doi}`
                : r?.primary_location?.source_url || r?.id;
            return {
                url: canonicalizeUrl(url),
                title: r.display_name,
                source: "openalex",
            };
        });
    }
    catch (err) {
        console.error("OpenAlex connector failed:", err.message);
        return [];
    }
}
/**
 * Connector: CrossRef (recent publications)
 */
export async function connectorCrossRef(rows = 50) {
    try {
        const mailto = process.env.CROSSREF_MAILTO || "you@example.com";
        const cutoff = getCutoffDate().split("T")[0];
        const resp = await axios.get("https://api.crossref.org/works", {
            params: {
                rows,
                filter: `from-pub-date:${cutoff}`,
                mailto: mailto,
            },
            timeout: 10000,
        });
        const items = resp.data.message.items || [];
        return items.map((it) => {
            const url = it.DOI ? `https://doi.org/${it.DOI}` : it.URL;
            return {
                url: canonicalizeUrl(url),
                title: Array.isArray(it.title) ? it.title[0] : it.title,
                source: "crossref",
            };
        });
    }
    catch (err) {
        console.error("CrossRef connector failed:", err.message);
        return [];
    }
}
/**
 * Connector: Common Crawl (very lightweight demo)
 */
export async function connectorCommonCrawl(query = "education filetype:pdf") {
    try {
        const indexUrl = `${process.env.COMMONCRAWL_INDEX_API || "https://index.commoncrawl.org/"}CC-MAIN-2024-22-index?url=*${encodeURIComponent("education")}*&output=json`;
        const resp = await axios.get(indexUrl, {
            timeout: 10000,
            headers: { "User-Agent": "NeuraLoomDiscovery/1.0" },
        });
        const lines = (resp.data || "").split("\n").slice(0, 200);
        return lines
            .map((l) => {
            try {
                const obj = JSON.parse(l);
                return {
                    url: canonicalizeUrl(obj.url),
                    title: obj.filename || undefined,
                    source: "commoncrawl",
                };
            }
            catch {
                return null;
            }
        })
            .filter(Boolean);
    }
    catch (err) {
        console.error("CommonCrawl connector failed:", err.message);
        return [];
    }
}
/**
 * Main: Run discovery cycle and insert into Supabase
 */
export async function runDiscoveryCycle() {
    console.log("🚀 Running discovery cycle...");
    const connectors = [
        () => connectorArxiv(),
        () => connectorOpenAlex(),
        () => connectorCrossRef(),
        () => connectorCommonCrawl(),
    ];
    const queue = new PQueue({ concurrency: 2 });
    const rawResults = [];
    await Promise.all(connectors.map((c) => queue.add(async () => {
        try {
            const res = await c();
            rawResults.push(...res);
        }
        catch (err) {
            console.error("Connector error:", err.message);
        }
    })));
    // Deduplicate URLs
    const map = new Map();
    for (const r of rawResults) {
        if (r.url && !map.has(r.url))
            map.set(r.url, r);
    }
    const candidates = Array.from(map.values()).filter((item) => {
        const u = item.url.toLowerCase();
        return (u.includes("arxiv.org") ||
            u.includes("doi.org") ||
            u.includes(".edu") ||
            u.includes("/paper") ||
            u.endsWith(".pdf") ||
            u.match(/\/abs\/\d+/) ||
            ["research", "journal", "study", "education"].some((k) => u.includes(k)));
    });
    let added = 0, skipped = 0;
    for (const c of candidates.slice(0, DISCOVERY_BATCH)) {
        try {
            const { data: existing } = await supabase
                .from("pages")
                .select("id")
                .eq("url", c.url)
                .limit(1);
            if (existing && existing.length > 0) {
                skipped++;
                continue;
            }
            const { data: pending } = await supabase
                .from("pending_scan")
                .select("id")
                .eq("url", c.url)
                .limit(1);
            if (pending && pending.length > 0) {
                skipped++;
                continue;
            }
            let pr = 0;
            if (c.url.includes("doi.org"))
                pr += 0.8;
            if (c.url.endsWith(".pdf"))
                pr += 0.5;
            if (c.source === "arxiv")
                pr += 0.4;
            await addPendingScan(c.url, c.source, pr, { title: c.title });
            added++;
        }
        catch (err) {
            console.error("❌ Failed to enqueue:", c.url, err.message);
            skipped++;
        }
    }
    console.log(`Discovering content from last ${LAST_N_HOURS} hours...`);
    console.log(`✅ Discovery complete. Added ${added}, skipped ${skipped}.`);
    return { added, skipped };
}
//# sourceMappingURL=discovery.js.map