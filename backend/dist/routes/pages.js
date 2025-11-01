// routes/pages.ts
import { Router } from "express";
import { supabase } from "../supabaseClient.js";
const router = Router();
// GET /pages/:id
router.get("/:id", async (req, res) => {
    const { id } = req.params;
    if (!id || id.length < 10) {
        return res.status(400).json({ error: "Invalid ID" });
    }
    try {
        const { data, error } = await supabase
            .from("pages")
            .select(`
        id, url, title, body_summary, source,
        decay_probability, is_decayed, created_at,
        date, author, meta_description, keywords, hints
      `)
            .eq("id", id)
            .single();
        if (error) {
            console.error("Supabase error:", error);
            return res.status(500).json({ error: error.message });
        }
        if (!data) {
            return res.status(404).json({ error: "Page not found" });
        }
        res.json(data);
    }
    catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
export default router;
//# sourceMappingURL=pages.js.map