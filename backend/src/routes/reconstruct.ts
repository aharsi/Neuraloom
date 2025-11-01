import { Router } from "express";
import type { Request, Response } from "express";
import { reconstructPage } from "../modules/reconstructor.js";
import type { ReconstructionRecord } from "../types.js";

const router = Router();

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Page ID is required" });
  }

  try {
    const apiKey = process.env.COHERE_API_KEY || "your-api-key-here";
    const { summary, reconstructionRecord } = await reconstructPage(
      { pageId: id },
      apiKey
    );
    res.json({ summary, reconstructionRecord });
  } catch (error) {
    res
      .status(500)
      .json({
        error: `Failed to reconstruct page: ${(error as Error).message}`,
      });
  }
});

export default router;
