import axios from "axios";
import cron from "node-cron";
import { getAllActivePages, markPageDecayed } from "../supabaseClient.js";
/**
 * Checks the status of a single URL using an HTTP HEAD request, falling back to GET if needed.
 * @param url The URL to check.
 * @returns A promise resolving to a DecayCheckResult.
 */
async function checkUrlStatus(url) {
    try {
        // Try HEAD request first (faster, less bandwidth)
        const response = await axios.head(url, {
            timeout: 5000, // 5-second timeout
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; DecayMonitorBot/1.0)",
            },
        });
        return {
            url,
            isDecayed: response.status >= 400, // Consider 4xx/5xx as decayed
            status: response.status,
        };
    }
    catch (error) {
        const axiosError = error;
        // Fallback to GET if HEAD fails (some servers don't support HEAD)
        if (axiosError.response?.status === 405 ||
            axiosError.code === "ERR_INVALID_REQUEST") {
            try {
                const response = await axios.get(url, {
                    timeout: 5000,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (compatible; DecayMonitorBot/1.0)",
                    },
                });
                return {
                    url,
                    isDecayed: response.status >= 400,
                    status: response.status,
                };
            }
            catch (getError) {
                const getAxiosError = getError;
                return {
                    url,
                    isDecayed: true, // Mark as decayed on any error in GET
                    error: getAxiosError.message,
                };
            }
        }
        // Handle timeout, DNS errors, or 404
        return {
            url,
            isDecayed: true,
            error: axiosError.message,
        };
    }
}
/**
 * Monitors all active pages in Supabase, checks their status, and marks decayed pages.
 * Logs results for debugging.
 */
export async function monitorDecay() {
    console.log("Starting decay monitor check...");
    try {
        // Retrieve all active pages
        const activePages = await getAllActivePages();
        console.log(`Found ${activePages.length} active pages to check.`);
        // Check each page's status
        const results = await Promise.all(activePages.map(async (page) => await checkUrlStatus(page.url)));
        // Process results and mark decayed pages
        for (const result of results) {
            console.log(`Checked ${result.url}: ${result.isDecayed ? "Decayed" : "Alive"}${result.status ? ` (Status: ${result.status})` : ""}${result.error ? ` (Error: ${result.error})` : ""}`);
            if (result.isDecayed) {
                const page = activePages.find((p) => p.url === result.url);
                if (page) {
                    try {
                        await markPageDecayed(page.id);
                        console.log(`Marked ${result.url} as decayed.`);
                    }
                    catch (error) {
                        console.error(`Failed to mark ${result.url} as decayed: ${error.message}`);
                    }
                }
            }
        }
        console.log("Decay monitor check completed.");
    }
    catch (error) {
        console.error(`Decay monitor failed: ${error.message}`);
    }
}
/**
 * Starts the decay monitor to run on a cron schedule.
 * @param cronSchedule The cron schedule (e.g., '0 0 * / 6 * * *' for every 6 hours).
 */
export function startDecayMonitor(cronSchedule = "0 0 */6 * * *") {
    console.log(`Starting decay monitor with cron schedule ${cronSchedule}`);
    // Run immediately on start
    monitorDecay().catch((error) => {
        console.error(`Initial decay monitor run failed: ${error.message}`);
    });
    // Schedule periodic runs
    cron.schedule(cronSchedule, () => {
        monitorDecay().catch((error) => {
            console.error(`Cron decay monitor run failed: ${error.message}`);
        });
    });
}
//# sourceMappingURL=decayMonitor.js.map