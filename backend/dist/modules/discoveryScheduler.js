// modules/discoveryScheduler.ts
import cron from "node-cron";
import { runDiscoveryCycle } from "./discovery.js";
export function startDiscoveryScheduler(cronSchedule = "0 */6 * * *") {
    console.log("Starting discovery scheduler with", cronSchedule);
    // run immediately
    runDiscoveryCycle().catch((err) => console.error("Initial discovery run failed", err.message));
    cron.schedule(cronSchedule, () => {
        runDiscoveryCycle().catch((err) => console.error("Scheduled discovery failed", err.message));
    });
}
//# sourceMappingURL=discoveryScheduler.js.map