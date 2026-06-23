import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(501).json({ error: "Hero uploads are disabled on Vercel. Replace public/assets/hero.png in the project instead." });
}
