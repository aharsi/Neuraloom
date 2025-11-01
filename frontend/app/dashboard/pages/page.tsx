// app/dashboard/pages/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Page {
  id: string;
  url: string;
  title: string;
  domain: string; // Mapped from source
  source: string;
  decay_probability: number;
  is_decayed: boolean;
  created_at: string;
  date?: string; // Optional
  author?: string;
  meta_description?: string;
  keywords?: string;
  body_summary?: string;
  hints?: any;
}

interface DecayPoint {
  date: string;
  decay: number;
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [decayFilter, setDecayFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const supabase = createClientComponentClient();
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) router.push("/auth");
    };
    checkUser();
  }, [supabase, router]);

  // Fetch pages (EXACTLY matches your schema)
  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("pages")
        .select(
          `
          id, url, title, source,
          decay_probability, is_decayed,
          created_at, date, author,
          meta_description, keywords, body_summary, hints
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      const { data, count, error } = await query;
      if (error) {
        console.error("Supabase error:", error);
        setError(error.message);
        return;
      }

      // Map source → domain (no alias needed)
      const mapped = (data || []).map((p) => ({
        ...p,
        domain: p.source,
      }));

      console.log("Fetched pages:", mapped); // Debug

      setPages(mapped);
      setTotal(count || 0);
    } catch (err: any) {
      console.error("Failed to fetch pages:", err);
      setError(err.message || "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [page]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("pages_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pages" },
        () => fetchPages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, page]);

  // Filters
  const filteredPages = useMemo(() => {
    return pages.filter((p) => {
      const matchesSearch =
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.url.toLowerCase().includes(search.toLowerCase()) ||
        p.source.toLowerCase().includes(search.toLowerCase());

      const matchesSource = sourceFilter === "all" || p.source === sourceFilter;

      const matchesDecay =
        decayFilter === "all" ||
        (decayFilter === "high" && p.decay_probability > 0.7) ||
        (decayFilter === "medium" &&
          p.decay_probability > 0.4 &&
          p.decay_probability <= 0.7) ||
        (decayFilter === "low" && p.decay_probability <= 0.4);

      return matchesSearch && matchesSource && matchesDecay;
    });
  }, [pages, search, sourceFilter, decayFilter]);

  // Decay chart data (last 7 days)
  const decayChartData: DecayPoint[] = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return format(d, "yyyy-MM-dd");
    });

    return last7Days.map((date) => {
      const pagesOnDay = pages.filter(
        (p) => format(new Date(p.created_at), "yyyy-MM-dd") === date
      );
      const avgDecay = pagesOnDay.length
        ? pagesOnDay.reduce((sum, p) => sum + p.decay_probability, 0) /
          pagesOnDay.length
        : 0;
      return {
        date: format(new Date(date), "MMM dd"),
        decay: Number(avgDecay.toFixed(3)),
      };
    });
  }, [pages]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-100">
      <main className="pt-24 pb-12 px-6">
        <Link
          href="/dashboard/pages"
          className="text-sm text-blue-600 hover:underline"
        >
          ← All Pages
        </Link>
        <br />
        <br />
        <div className="container mx-auto max-w-7xl">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-blue-800 mb-2">All Pages</h1>
            <p className="text-gray-600">
              Browse, search, and monitor all processed content.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              Error: {error}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Search title, URL, or source..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>
              <div>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                >
                  <option value="all">All Sources</option>
                  <option value="manual">Manual</option>
                  <option value="arxiv">arXiv</option>
                  <option value="doaj">DOAJ</option>
                  <option value="semanticscholar">Semantic Scholar</option>
                  <option value="researchgate">ResearchGate</option>
                </select>
              </div>
              <div>
                <select
                  value={decayFilter}
                  onChange={(e) => setDecayFilter(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                >
                  <option value="all">All Decay Risk</option>
                  <option value="high">High (&gt;70%)</option>
                  <option value="medium">Medium (40-70%)</option>
                  <option value="low">Low (≤40%)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pages List */}
            <div className="lg:col-span-2">
              <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-blue-800">
                    Pages ({filteredPages.length} of {total})
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-24 bg-gray-200 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : filteredPages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No pages found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filteredPages.map((p) => (
                      <div
                        key={p.id}
                        className="p-4 bg-white/50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div
                          key={p.id}
                          className="p-4 bg-white/50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow flex flex-col"
                        >
                          <div className="flex justify-between items-start flex-1">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-blue-800 line-clamp-1">
                                {p.title || "Untitled"}
                              </h3>
                              <p className="text-sm text-gray-600 truncate">
                                {p.url}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                  {p.source}
                                </span>
                                <span>
                                  Added:{" "}
                                  {format(
                                    new Date(p.created_at),
                                    "MMM dd, yyyy"
                                  )}
                                </span>
                                {p.is_decayed && (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                    Decayed
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <div className="text-2xl font-bold text-gray-800">
                                {(p.decay_probability * 100).toFixed(0)}%
                              </div>
                              <div className="text-xs text-gray-500">
                                decay risk
                              </div>
                            </div>
                          </div>

                          {/* VIEW DETAILS BUTTON */}
                          <div className="mt-4">
                            <Link
                              href={`/dashboard/pages/${p.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-700 text-white text-xs font-medium rounded-md hover:bg-blue-800 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Decay Trend Chart */}
            <div>
              <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm h-full">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  Decay Trend (7 Days)
                </h2>
                {decayChartData.every((d) => d.decay === 0) ? (
                  <p className="text-gray-500 text-center py-8">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={decayChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number) => [
                          `${(value * 100).toFixed(1)}%`,
                          "Decay",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="decay"
                        stroke="#ef4444"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
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
