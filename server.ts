import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DATA_FILE = path.join(process.cwd(), "src", "data", "subscribers.json");
const HERO_IMAGE_PATH = path.join(process.cwd(), "src", "data", "hero_background.bin");
const HERO_MIME_PATH = path.join(process.cwd(), "src", "data", "hero_background_mime.txt");

// Ensure data folder and file exists
function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

interface Subscriber {
  email: string;
  source: string;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_TABLE || "despite_leads";

function supabaseEnabled() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

async function supabaseRequest(pathname: string, options: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase error ${response.status}: ${text}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function insertSubscriberToSupabase(subscriber: Subscriber) {
  if (!supabaseEnabled()) return;

  await supabaseRequest(`${SUPABASE_TABLE}`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      email: subscriber.email,
      source: subscriber.source,
      user_agent: subscriber.userAgent || null,
      created_at: subscriber.timestamp,
    }),
  });
}

async function getSupabaseSubscribers(): Promise<Subscriber[] | null> {
  if (!supabaseEnabled()) return null;

  const rows = await supabaseRequest(`${SUPABASE_TABLE}?select=email,source,user_agent,created_at&order=created_at.desc`, {
    method: "GET",
  });

  return (rows || []).map((row: any) => ({
    email: row.email,
    source: row.source || "landing_page",
    timestamp: row.created_at,
    userAgent: row.user_agent || undefined,
  }));
}

async function deleteSupabaseSubscriber(email: string) {
  if (!supabaseEnabled()) return;
  await supabaseRequest(`${SUPABASE_TABLE}?email=eq.${encodeURIComponent(email.toLowerCase())}`, {
    method: "DELETE",
  });
}

// Read subscribers safely
function getSubscribers(): Subscriber[] {
  ensureDataFile();
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading subscribers file: ", err);
    return [];
  }
}

// Write subscribers safely
function saveSubscribers(subscribers: Subscriber[]) {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(subscribers, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing subscribers file: ", err);
  }
}

// Express JSON body parser with increased limit to support base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// API: Custom hero image upload
app.post("/api/admin/upload-hero", (req, res) => {
  const { image } = req.body;
  
  if (!image || typeof image !== "string") {
    return res.status(400).json({ error: "No image custom content provided." });
  }

  try {
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Invalid image base64 structure." });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    const dir = path.dirname(HERO_IMAGE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(HERO_IMAGE_PATH, buffer);
    fs.writeFileSync(HERO_MIME_PATH, mimeType, "utf-8");

    res.json({ success: true, mimeType });
  } catch (err) {
    console.error("Error writing image upload: ", err);
    res.status(500).json({ error: "Failed to write image configuration to disk." });
  }
});

// API: Check if custom hero background exists
app.get("/api/admin/hero-status", (req, res) => {
  const exists = fs.existsSync(HERO_IMAGE_PATH);
  res.json({ hasCustomImage: exists });
});

// API: Fetch custom hero background image
app.get("/api/hero-image.png", (req, res) => {
  if (fs.existsSync(HERO_IMAGE_PATH)) {
    let mime = "image/png";
    if (fs.existsSync(HERO_MIME_PATH)) {
      try {
        mime = fs.readFileSync(HERO_MIME_PATH, "utf-8").trim();
      } catch (err) {
        // Fallback mime
      }
    }
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(HERO_IMAGE_PATH);
  } else {
    res.status(404).send("Not found");
  }
});

// API: Subscribe email
app.post("/api/subscribe", async (req, res) => {
  const { email, source } = req.body;
  
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const subscribers = getSubscribers();
  
  // Check duplication in local backup first
  const exists = subscribers.some(sub => sub.email.toLowerCase() === cleanEmail);
  if (exists) {
    return res.status(200).json({ success: true, count: subscribers.length, message: "You have already completed your registration. Your receipts are locked." });
  }

  // Record subscriber
  const newSub: Subscriber = {
    email: cleanEmail,
    source: source || "landing_page",
    timestamp: new Date().toISOString(),
    ip: String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || ""),
    userAgent: req.headers["user-agent"]
  };

  // Local backup, useful for local dev and emergency backup
  subscribers.push(newSub);
  saveSubscribers(subscribers);

  // Supabase primary storage when configured
  try {
    await insertSubscriberToSupabase(newSub);
  } catch (err) {
    console.error("Supabase subscriber save failed, local backup still saved:", err);
  }

  res.status(201).json({
    success: true,
    count: subscribers.length,
    message: "Receipt registered successfully. You've been locked into the founding lineup."
  });
});

// API: Admin authentication & verification
app.post("/api/admin/verify", (req, res) => {
  const { passcode } = req.body;
  if (passcode === "despite2026" || passcode === "despite") {
    return res.json({ success: true, token: "despite-validated-token-2026" });
  }
  return res.status(401).json({ error: "Invalid credentials. Access Denied." });
});

// API: Get subscribers (Secret/Passcode secured)
app.get("/api/admin/subscribers", async (req, res) => {
  const token = req.headers["x-admin-token"];
  if (token !== "despite-validated-token-2026") {
    return res.status(403).json({ error: "Unauthorized access to receipts list." });
  }

  try {
    const supabaseSubscribers = await getSupabaseSubscribers();
    if (supabaseSubscribers) {
      return res.json({ subscribers: supabaseSubscribers });
    }
  } catch (err) {
    console.error("Supabase read failed, falling back to local backup:", err);
  }

  const subscribers = getSubscribers();
  res.json({ subscribers });
});

// API: Delete subscriber
app.delete("/api/admin/subscribers/:email", async (req, res) => {
  const token = req.headers["x-admin-token"];
  if (token !== "despite-validated-token-2026") {
    return res.status(403).json({ error: "Unauthorized access." });
  }

  const { email } = req.params;
  let subscribers = getSubscribers();
  const initialLength = subscribers.length;
  subscribers = subscribers.filter(sub => sub.email.toLowerCase() !== email.toLowerCase());
  saveSubscribers(subscribers);

  try {
    await deleteSupabaseSubscriber(email);
  } catch (err) {
    console.error("Supabase delete failed, local backup was updated:", err);
  }

  if (subscribers.length === initialLength && !supabaseEnabled()) {
    return res.status(404).json({ error: "Email target not found." });
  }

  res.json({ success: true, count: subscribers.length });
});

// Start server setup
async function start() {
  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[DESPITE APP] Running on http://localhost:${PORT}`);
  });
}

start();

