// app/dashboard/discover/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PendingScan {
  id: string;
  url: string;
  source: string;
  priority: "low" | "medium" | "high";
  status: string;
  added_at: string;
  attempts: number;
}

interface RecentDiscovery {
  url: string;
  title: string;
  domain: string;
  added_at: string;
}

export default function DiscoverPage() {
  const [url, setUrl] = useState("");
  const [source, setSource] = useState("manual");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [pending, setPending] = useState<PendingScan[]>([]);
  const [recent, setRecent] = useState<RecentDiscovery[]>([]);
  const [loading, setLoading] = useState(false);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();

  // === Auth Guard ===
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) router.push("/auth");
    };
    checkUser();
  }, [supabase, router]);

  // === Fetch Pending + Recent (from Supabase) ===
  const fetchData = async () => {
    try {
      const { data: pendingData } = await supabase
        .from("pending_scan")
        .select("id, url, source, priority, status, added_at, attempts")
        .order("added_at", { ascending: false })
        .limit(10);

      const { data: recentPages } = await supabase
        .from("pages")
        .select("url, title, domain: source, added_at: created_at")
        .order("created_at", { ascending: false })
        .limit(6);

      setPending(pendingData || []);
      setRecent(recentPages || []);
    } catch (err) {
      console.error("Failed to fetch discover data:", err);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("pending_scan_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pending_scan" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // === Add URL via Backend API ===
  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:5000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          source,
          priority:
            priority === "high" ? 0.9 : priority === "medium" ? 0.5 : 0.1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add URL");

      setMessage({ type: "success", text: "URL added to scan queue!" });
      setUrl("");
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  // === Trigger Discovery Cycle via Backend ===
  const handleRunDiscovery = async () => {
    setDiscoverLoading(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:5000/discover/trigger", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Discovery failed");

      setMessage({
        type: "success",
        text: `Discovery added ${data.added} new URLs`,
      });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setDiscoverLoading(false);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-100">
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-10">
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Back to Dashboard
            </Link>
            <br />
            <br />
            <h1 className="text-4xl font-bold text-blue-800 mb-2">
              Discover New Content
            </h1>
            <p className="text-gray-600">
              Add URLs to scan, monitor the pipeline, and expand your knowledge
              base.
            </p>
          </div>

          {/* Add URL Form */}
          <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm mb-8">
            <form
              onSubmit={handleAddUrl}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Web Page URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                >
                  <option value="manual">Manual</option>
                  <option value="arxiv">arXiv</option>
                  <option value="doaj">DOAJ</option>
                  <option value="semanticscholar">Semantic Scholar</option>
                  <option value="researchgate">ResearchGate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="md:col-span-4 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 md:flex-initial px-6 py-2.5 bg-blue-800 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Adding..." : "+ Add to Queue"}
                </button>
                <button
                  type="button"
                  onClick={handleRunDiscovery}
                  disabled={discoverLoading}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded-md font-medium disabled:opacity-50"
                >
                  {discoverLoading ? "Running..." : "Run Discovery"}
                </button>
              </div>
            </form>

            {message && (
              <div
                className={`mt-4 p-3 rounded-md text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Queue */}
            <div>
              <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  Pending Scan Queue ({pending.length})
                </h2>
                {pending.length === 0 ? (
                  <p className="text-gray-500 text-sm">No URLs in queue.</p>
                ) : (
                  <div className="space-y-3">
                    {pending.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-white/50 rounded-lg text-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-blue-800 truncate">
                            {item.url}
                          </p>
                          <p className="text-gray-500 text-xs">
                            Source: {item.source} • Attempts: {item.attempts}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                              item.priority
                            )}`}
                          >
                            {item.priority}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(item.added_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Discoveries */}
            <div>
              <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  Recently Discovered
                </h2>
                {recent.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No recent discoveries.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recent.map((page, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-white/50 rounded-lg text-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs shrink-0">
                          Globe
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-blue-800 line-clamp-1">
                            {page.title || "Untitled"}
                          </p>
                          <p className="text-gray-500 text-xs truncate">
                            {page.domain} •{" "}
                            {new Date(page.added_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="mt-8 bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              Discovery System Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="font-medium text-gray-700">Crawler Active</p>
                  <p className="text-gray-500">Processing queue every 2 min</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div>
                  <p className="font-medium text-gray-700">
                    Cohere API Connected
                  </p>
                  <p className="text-gray-500">Embeddings ready</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div>
                  <p className="font-medium text-gray-700">Decay Monitor</p>
                  <p className="text-gray-500">Running daily at 3 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-white/30 backdrop-blur-md border-t border-gray-200/50 mt-12">
        <div className="container mx-auto px-6 text-center text-sm text-gray-600">
          <p>© 2025 NeuraLoom – AI-Powered Web Intelligence</p>
        </div>
      </footer>
    </div>
  );
}
