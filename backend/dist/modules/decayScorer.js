// modules/decayScorer.ts
import sslChecker from "ssl-checker";
import whois from "whois-json";
/**
 * Return days between two dates
 */
function daysBetween(a, b) {
    return Math.round(Math.abs((+a - +b) / (1000 * 60 * 60 * 24)));
}
/**
 * Compute a decay probability (0..1) using multiple signals:
 * - domain age (WHOIS) -> newer domains more risky
 * - SSL days left -> short remaining cert -> risky
 * - content size / truncated flag -> smaller content slightly riskier
 * - host hints (if host contains free hosting providers, increase risk)
 */
export async function computeDecayProbability(url, contentTruncated = false) {
    try {
        const u = new URL(url);
        const host = u.hostname;
        let domainAgeFactor = 0.5; // default
        try {
            const who = (await whois(host, { follow: 3, timeout: 10000 }));
            // who['created'] or who.creationDate vary by provider; try common fields
            const created = who.creationDate ||
                who.created ||
                who["Creation Date"] ||
                who["createdate"];
            if (created) {
                const createdDate = new Date(created);
                const days = daysBetween(createdDate, new Date());
                // older domain -> less risky
                domainAgeFactor = days < 365 ? 0.9 : days < 3650 ? 0.4 : 0.2;
            }
        }
        catch (err) {
            // whois may fail sometimes; keep default
            console.warn("WHOIS lookup failed:", err.message);
        }
        let sslFactor = 0.5;
        try {
            const ssl = await sslChecker(host, {
                method: "GET",
                timeout: 10000,
            });
            if (ssl.validTo) {
                const expires = new Date(ssl.validTo);
                const daysLeft = Math.max(0, daysBetween(new Date(), expires));
                sslFactor = daysLeft < 7 ? 0.9 : daysLeft < 30 ? 0.6 : 0.2;
            }
        }
        catch (err) {
            // No SSL or invalid -> more risky
            sslFactor = 0.8;
        }
        // host risk heuristics
        let hostRisk = 0.3;
        if (host.includes("github.io") ||
            host.includes("wordpress.com") ||
            host.includes("wixsite"))
            hostRisk = 0.7;
        const truncFactor = contentTruncated ? 0.2 : 0;
        // weighted sum
        const score = Math.min(1, Math.max(0, 0.45 * domainAgeFactor +
            0.35 * sslFactor +
            0.15 * hostRisk +
            truncFactor));
        return score;
    }
    catch (err) {
        console.error("computeDecayProbability error:", err.message);
        return 0.5; // fallback
    }
}
//# sourceMappingURL=decayScorer.js.map