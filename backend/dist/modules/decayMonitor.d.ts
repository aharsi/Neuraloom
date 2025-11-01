/**
 * Monitors all active pages in Supabase, checks their status, and marks decayed pages.
 * Logs results for debugging.
 */
export declare function monitorDecay(): Promise<void>;
/**
 * Starts the decay monitor to run on a cron schedule.
 * @param cronSchedule The cron schedule (e.g., '0 0 * / 6 * * *' for every 6 hours).
 */
export declare function startDecayMonitor(cronSchedule?: string): void;
//# sourceMappingURL=decayMonitor.d.ts.map