// modules/monitoring.ts
import { supabase } from "../supabaseClient.js";
export async function logFailure(url, reason) {
    try {
        await supabase.from("system_logs").insert({
            level: "error",
            message: `Failed scan ${url}: ${reason}`,
            metadata: { url, reason },
        });
    }
    catch (err) {
        console.error("Failed to write system log:", err.message);
    }
}
export async function checkFailureSpikes(windowMinutes = 5, threshold = 30) {
    // Basic check: count 'error' logs in last window
    const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();
    const { data, error } = await supabase
        .from("system_logs")
        .select("id")
        .gte("created_at", since)
        .eq("level", "error");
    if (error) {
        console.error("Failed to query system logs:", error.message);
        return false;
    }
    const count = (data || []).length;
    if (count >= threshold) {
        console.warn(`High error spike detected: ${count} errors in last ${windowMinutes} minutes`);
        // TODO: call webhook / send alert
        return true;
    }
    return false;
}
//# sourceMappingURL=monitoring.js.map