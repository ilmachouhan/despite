import React, { useState, useEffect } from "react";
import { Subscriber } from "../types";
import { LogOut, Search, Trash2, Download, RefreshCw, KeyRound, CheckCircle, ShieldAlert } from "lucide-react";

interface AdminPanelProps {
  onBackToSite: () => void;
}

export default function AdminPanel({ onBackToSite }: AdminPanelProps) {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Load token from sessionStorage on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem("despite_admin_token");
    if (savedToken) {
      setAuthToken(savedToken);
      setIsAuthenticated(true);
      fetchSubscribers(savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError(false);
    
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("despite_admin_token", data.token);
        setAuthToken(data.token);
        setIsAuthenticated(true);
        fetchSubscribers(data.token);
      } else {
        setIsError(true);
        setErrorMessage(data.error || "Access Denied. Passcode is invalid.");
      }
    } catch (err) {
      setIsError(true);
      setErrorMessage("Could not connect to the authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscribers = async (tokenString: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/subscribers", {
        headers: {
          "x-admin-token": tokenString,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribers(data.subscribers || []);
      } else {
        setErrorMessage(data.error || "Failed to fetch subscribers.");
        if (res.status === 403) {
          handleLogout();
        }
      }
    } catch (err) {
      setErrorMessage("Network error occurred while fetching subscribers.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (email: string) => {
    if (!authToken) return;
    if (!confirm(`Are you sure you want to permanently remove subscriber ${email}?`)) return;

    try {
      const res = await fetch(`/api/admin/subscribers/${encodeURIComponent(email)}`, {
        method: "DELETE",
        headers: {
          "x-admin-token": authToken,
        },
      });

      if (res.ok) {
        setSubscribers(prev => prev.filter(sub => sub.email !== email));
        showSuccess("Receipt successfully purged.");
      } else {
        alert("Failed to delete entry.");
      }
    } catch (err) {
      alert("Error contacting subscriber purging API.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("despite_admin_token");
    setAuthToken(null);
    setIsAuthenticated(false);
    setSubscribers([]);
    setPasscode("");
    setIsError(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Convert array to CSV and download
  const downloadCSV = () => {
    if (subscribers.length === 0) return;
    
    const headers = ["Index", "Email", "Platform Source", "Registered Timestamp", "User Agent"];
    const rows = subscribers.map((sub, i) => [
      i + 1,
      sub.email,
      sub.source,
      sub.timestamp,
      `"${sub.userAgent?.replace(/"/g, '""') || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `despite_relentless_receipts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess("CSV file downloaded successfully.");
  };

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-mono selection:bg-rose-600 selection:text-white" id="admin_root">
      {/* Top micro bar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
          <h1 className="text-sm font-bold tracking-widest text-zinc-300 uppercase">
            DESPITE // RECEIPTS CONTROL SERVER
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToSite}
            className="text-xs text-zinc-500 hover:text-zinc-200 hover:underline transition-all duration-200"
          >
            ← BACK TO VISUAL MIRROR
          </button>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-400 border border-rose-950 px-2.5 py-1 rounded bg-rose-950/20 hover:bg-rose-950/40 transition-all duration-200"
            >
              <LogOut size={12} />
              LOGOUT
            </button>
          )}
        </div>
      </header>

      {/* Main Core View Area */}
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-neutral-950 via-black to-black">
          <div className="w-full max-w-md border border-zinc-900 bg-zinc-950/50 p-8 rounded-xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-600/50 to-transparent" />
            
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-full bg-rose-950/30 border border-rose-900/40 text-rose-500 mb-4 animate-pulse">
                <KeyRound size={24} />
              </div>
              <h2 className="text-lg font-bold tracking-widest text-white uppercase">
                AUTHENTICATION REQUIRED
              </h2>
              <p className="text-xs text-zinc-500 mt-2 font-serif max-w-xs mx-auto">
                Access to the relentless member queue is strictly locked. Hand over your credential.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] tracking-wider text-zinc-400 mb-2 uppercase">
                  ENTER KEYBOARD PASSCODE (Try: &apos;despite&apos; or &apos;despite2026&apos;)
                </label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••••••••"
                  required
                  autoFocus
                  className="w-full bg-black/80 border border-zinc-800 focus:border-rose-600 focus:ring-1 focus:ring-rose-600 focus:outline-none rounded px-4 py-3 text-center text-rose-500 tracking-widest placeholder:text-zinc-800 text-sm font-bold transition-all transition-duration-300"
                />
              </div>

              {isError && (
                <div className="flex items-center gap-2 border border-rose-950/50 bg-rose-950/20 px-3 py-2.5 rounded text-rose-400 text-[11px] font-sans">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 text-white font-extrabold text-xs py-3 rounded tracking-widest uppercase transition-all duration-300 shadow-lg shadow-rose-950/30 cursor-pointer"
              >
                {isLoading ? "Validating security..." : "UNLOCK RECIEPTS // UNLOCK"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top Banner Alert */}
          {successMsg && (
            <div className="border border-green-950 bg-emerald-950/20 px-4 py-3 rounded flex items-center gap-2.5 text-xs text-emerald-400 font-sans">
              <CheckCircle size={14} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* KPI Bento Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-zinc-900 bg-zinc-950/30 p-5 rounded-lg flex flex-col justify-between">
              <span className="text-[10px] text-zinc-500 tracking-wider uppercase">
                TOTAL CAPTURED SUBMITTERS
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  {subscribers.length}
                </span>
                <span className="text-xs text-emerald-500 font-sans font-bold">
                  (100% Locked)
                </span>
              </div>
            </div>

            <div className="border border-zinc-900 bg-zinc-950/30 p-5 rounded-lg flex flex-col justify-between">
              <span className="text-[10px] text-zinc-500 tracking-wider uppercase">
                SUBMISSION CHANNEL
              </span>
              <div className="mt-2 font-mono text-xs text-rose-500 flex flex-col gap-1">
                <div className="flex justify-between">
                  <span>LANDING PAGE:</span>
                  <span className="font-bold text-white">
                    {subscribers.filter(s => s.source === "landing_page").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>DESKTOP SCROLL:</span>
                  <span className="font-bold text-white">
                    {subscribers.filter(s => s.source === "scroll_hook").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-zinc-900 bg-red-950/5 p-5 rounded-lg flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
              <span className="text-[10px] text-zinc-500 tracking-wider uppercase">
                ADMIN CONSOLE INTEGRITY
              </span>
              <div className="mt-2 font-sans text-xs text-zinc-400 leading-relaxed">
                Database active. Verified as secure. Directly syncing with <span className="text-rose-500 font-mono">/src/data/subscribers.json</span>.
              </div>
            </div>
          </section>

          {/* Main Logs Table */}
          <section className="border border-zinc-900 bg-zinc-950/20 rounded-xl overflow-hidden shadow-xl">
            {/* Control Filters Bar */}
            <div className="p-4 border-b border-zinc-900/80 bg-zinc-950/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH RECEIPTS BY EMAIL OR CONTEXT..."
                  className="w-full bg-black/60 border border-zinc-800 text-xs text-zinc-300 rounded pl-10 pr-4 py-2.5 focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600 font-mono"
                />
              </div>

              <div className="flex gap-2 shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => fetchSubscribers(authToken || "")}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 px-3.5 py-2.5 rounded text-xs text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
                >
                  <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
                  REFRESH
                </button>
                <button
                  onClick={downloadCSV}
                  disabled={subscribers.length === 0}
                  className="flex items-center gap-1.5 border border-rose-950 bg-rose-950/20 hover:bg-rose-950/30 hover:border-rose-800 px-3.5 py-2.5 rounded text-xs text-rose-400 hover:text-rose-300 transition-all font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={12} />
                  EXPORT CSV
                </button>
              </div>
            </div>

            {/* List items */}
            {isLoading && subscribers.length === 0 ? (
              <div className="p-16 text-center text-zinc-600 text-xs">
                <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-rose-600" />
                Querying subscriber queue records...
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="p-16 text-center text-zinc-600 text-xs font-serif">
                {subscribers.length === 0 ? "No relentlessness receipts recorded yet. Launch coming soon and capture them." : "Your query didn't trigger any matching logs."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-[#050505] text-zinc-500 text-[10px] border-b border-zinc-900/60 font-mono">
                    <tr>
                      <th className="py-3 px-4 font-normal">INDEX</th>
                      <th className="py-3 px-4 font-normal">LOCK DATE</th>
                      <th className="py-3 px-4 font-normal">EMAIL ADDRESS</th>
                      <th className="py-3 px-4 font-normal">CONTEXT CHANNEL</th>
                      <th className="py-3 px-4 font-normal">DEVICE METADATA</th>
                      <th className="py-3 px-4 font-normal text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 font-mono">
                    {filteredSubscribers.map((sub, i) => (
                      <tr key={sub.email} className="hover:bg-zinc-950/40 transition-colors">
                        <td className="py-4 px-4 text-zinc-600">
                          {String(i + 1).padStart(3, "0")}
                        </td>
                        <td className="py-4 px-4 text-zinc-400 text-[11px]">
                          {new Date(sub.timestamp).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit"
                          })}
                        </td>
                        <td className="py-4 px-4 font-bold text-white selection:bg-rose-600">
                          {sub.email}
                        </td>
                        <td className="py-4 px-4 text-rose-500 text-[10px]">
                          <span className="bg-rose-950/10 border border-rose-950/40 px-1.5 py-0.5 rounded uppercase">
                            {sub.source}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[10px] text-zinc-500 max-w-xs truncate" title={sub.userAgent}>
                          {sub.userAgent || "Unknown Origin"}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleDelete(sub.email)}
                            className="text-zinc-600 hover:text-rose-500 p-1 rounded hover:bg-rose-950/10 transition-all cursor-pointer inline-flex"
                            title="Purge Subscriber Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Table Footer */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950/40 text-[10px] text-zinc-500 flex items-center justify-between">
              <span>Showing {filteredSubscribers.length} of {subscribers.length} submissions</span>
              <span>Secure Session active</span>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

