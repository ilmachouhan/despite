import type { VercelRequest, VercelResponse } from "@vercel/node";
import { deleteSubscriber } from "../../_supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method not allowed" });

  const token = req.headers["x-admin-token"];
  if (token !== "despite-validated-token-2026") {
    return res.status(403).json({ error: "Unauthorized access." });
  }

  const email = String(req.query.email || "");
  if (!email) return res.status(400).json({ error: "Email missing." });

  try {
    await deleteSubscriber(email);
    return res.json({ success: true });
  } catch (err) {
    console.error("Vercel delete subscriber error:", err);
    return res.status(500).json({ error: "Could not delete subscriber." });
  }
}
