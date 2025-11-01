import { Router } from "express";
import { monitorDecay } from "../modules/decayMonitor.js";
const router = Router();
router.get("/", async (req, res) => {
    try {
        await monitorDecay();
        res.json({
            message: "Decay check completed. Check server logs for details.",
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ error: `Failed to check decay: ${error.message}` });
    }
});
export default router;
//# sourceMappingURL=checkDecay.js.map