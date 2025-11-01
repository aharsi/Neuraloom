// routes/discover.ts
import { Router } from "express";
import { runDiscoveryCycle } from "../modules/discovery.js";
import { runBatchScanAndEmbed } from "../modules/batchWorker.js";
import { monitorDecay } from "../modules/decayMonitor.js";

const router = Router();

// === ENDPOINTS ===
router.post("/trigger", async (req, res) => {
  try {
    const { added, skipped } = await runDiscoveryCycle();
    res.json({ success: true, added, skipped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/process", async (req, res) => {
  try {
    await runBatchScanAndEmbed();
    res.json({ success: true, message: "Batch processing started" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/decay/check", async (req, res) => {
  try {
    await monitorDecay();
    res.json({ success: true, message: "Decay check started" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/status", async (req, res) => {
  res.json({
    discovery: "active",
    batchWorker: "active",
    decayMonitor: "scheduled",
    timestamp: new Date().toISOString(),
  });
});

router.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `No endpoint at /discover${req.originalUrl}`,
    available: ["/trigger", "/process", "/decay/check", "/status"],
  });
});

export default router;
