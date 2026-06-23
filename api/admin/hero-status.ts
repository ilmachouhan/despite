import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  // Vercel filesystem is serverless/ephemeral. Use bundled /assets/hero.png instead.
  return res.json({ hasCustomImage: false });
}
