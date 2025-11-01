import { Router } from "express";
import type { Request, Response } from "express";
import { monitorDecay } from "../modules/decayMonitor.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    await monitorDecay();
    res.json({
      message: "Decay check completed. Check server logs for details.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: `Failed to check decay: ${(error as Error).message}` });
  }
});

export default router;
