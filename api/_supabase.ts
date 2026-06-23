type Subscriber = {
  email: string;
  source: string;
  timestamp: string;
  userAgent?: string;
};

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_TABLE = process.env.SUPABASE_TABLE || "despite_leads";

export function supabaseEnabled() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export async function supabaseRequest(pathname: string, options: RequestInit = {}) {
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

export async function insertSubscriber(subscriber: Subscriber) {
  await supabaseRequest(`${SUPABASE_TABLE}`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({
      email: subscriber.email,
      source: subscriber.source,
      user_agent: subscriber.userAgent || null,
      created_at: subscriber.timestamp,
    }),
  });
}

export async function getSubscribers(): Promise<Subscriber[]> {
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

export async function deleteSubscriber(email: string) {
  await supabaseRequest(`${SUPABASE_TABLE}?email=eq.${encodeURIComponent(email.toLowerCase())}`, {
    method: "DELETE",
  });
}
