import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSubscribers } from "../../_supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = req.headers["x-admin-token"];
  if (token !== "despite-validated-token-2026") {
    return res.status(403).json({ error: "Unauthorized access to receipts list." });
  }

  try {
    const subscribers = await getSubscribers();
    return res.json({ subscribers });
  } catch (err) {
    console.error("Vercel admin subscribers error:", err);
    return res.status(500).json({ error: "Could not fetch subscribers." });
  }
}
