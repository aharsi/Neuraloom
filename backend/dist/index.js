import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import scanRouter from "./routes/scan.js";
import checkDecayRouter from "./routes/checkDecay.js";
import reconstructRouter from "./routes/reconstruct.js";
import pagesRouter from "./routes/pages.js";
import discoverRouter from "./routes/discover.js";
import { startDecayMonitor } from "./modules/decayMonitor.js";
import { startDiscoveryScheduler } from "./modules/discoveryScheduler.js";
import { runBatchScanAndEmbed } from "./modules/batchWorker.js";
// Load environment variables
dotenv.config();
// Validate required environment variables
const requiredEnv = ["SUPABASE_URL", "SUPABASE_KEY", "COHERE_API_KEY"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`❌ Missing environment variables: ${missingEnv.join(", ")}`);
    process.exit(1);
}
const PORT = process.env.PORT || 5000;
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
});
// Routes
app.use("/scan", scanRouter);
app.use("/check-decay", checkDecayRouter);
app.use("/reconstruct", reconstructRouter);
app.use("/pages", pagesRouter);
app.use("/discover", discoverRouter);
// Root route
app.get("/", (_req, res) => {
    res.json({ message: "Backend is running" });
});
// Start scheduled jobs
try {
    // Decay monitor runs every 6 hours
    // startDecayMonitor("0 0 */6 * * *");
    // Discovery scheduler runs every 6 hours
    startDiscoveryScheduler("0 */6 * * *");
}
catch (err) {
    console.error("Error starting scheduled jobs:", err.message);
}
// Optional: fallback batch runner every 5 minutes
setInterval(() => {
    runBatchScanAndEmbed().catch((err) => console.error("Batch worker error:", err.message));
}, 1000 * 60 * 5);
// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map