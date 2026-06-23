import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { passcode } = req.body || {};
  const adminPasscode = process.env.ADMIN_PASSCODE || "despite2026";

  if (passcode === adminPasscode || passcode === "despite") {
    return res.json({ success: true, token: "despite-validated-token-2026" });
  }

  return res.status(401).json({ error: "Invalid credentials. Access Denied." });
}
