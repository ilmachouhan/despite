import type { VercelRequest, VercelResponse } from "@vercel/node";
import { insertSubscriber } from "./_supabase";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, source } = req.body || {};

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const subscriber = {
    email: email.trim().toLowerCase(),
    source: source || "landing_page",
    timestamp: new Date().toISOString(),
    userAgent: String(req.headers["user-agent"] || ""),
  };

  try {
    await insertSubscriber(subscriber);
    return res.status(201).json({
      success: true,
      count: 1,
      message: "Receipt registered successfully. You've been locked into the founding lineup.",
    });
  } catch (err: any) {
    console.error("Vercel subscribe error:", err);
    return res.status(500).json({ error: "Could not save receipt. Supabase connection failed." });
  }
}
