// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface PageStats {
  total: number;
  embedded: number;
  reconstructed: number;
  decayed: number;
  pending: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PageStats>({
    total: 0,
    embedded: 0,
    reconstructed: 0,
    decayed: 0,
    pending: 0,
  });
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
        setLoading(false);
        fetchStats();
      }
    };

    const fetchStats = async () => {
      try {
        // === 1. PAGES: total, decayed, decay_probability ===
        const {
          data: pages,
          error: pagesError,
          count: totalCount,
        } = await supabase
          .from("pages")
          .select(
            "id, is_decayed, decay_probability, embedding_combined, embedding_meta",
            { count: "exact" }
          );

        if (pagesError) throw pagesError;

        const decayed = pages.filter((p) => p.is_decayed).length;
        const hasCombinedEmbedding = pages.filter(
          (p) => p.embedding_combined
        ).length;
        const hasMetaEmbedding = pages.filter((p) => p.embedding_meta).length;

        // === 2. EMBEDDINGS: count pages with at least one embedding row ===
        const { data: embeddings } = await supabase
          .from("embeddings")
          .select("page_id", { count: "exact" });

        const embeddedPages = new Set(embeddings?.map((e) => e.page_id)).size;

        // === 3. RECONSTRUCTIONS: count pages with reconstruction ===
        const { data: reconstructions } = await supabase
          .from("reconstructions")
          .select("page_id", { count: "exact" });

        const reconstructedPages = new Set(
          reconstructions?.map((r) => r.page_id)
        ).size;

        // === 4. PENDING SCANS: count non-completed ===
        const { count: pendingCount } = await supabase
          .from("pending_scan")
          .select("*", { count: "exact", head: true })
          .neq("status", "completed");

        setStats({
          total: totalCount || 0,
          embedded: embeddedPages,
          reconstructed: reconstructedPages,
          decayed,
          pending: pendingCount || 0,
        });
      } catch (err: any) {
        console.error("Failed to fetch stats:", err);
      }
    };

    getUser();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-blue-800 text-lg">Loading NeuraLoom...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-100">
      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Welcome Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-blue-800 mb-2">
              Welcome back,{" "}
              {user.user_metadata?.full_name?.split(" ")[0] || "Researcher"}!
            </h1>
            <p className="text-gray-600">
              Monitor your web content pipeline and semantic knowledge base.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
              <h3 className="text-3xl font-bold text-blue-800">
                {stats.total}
              </h3>
              <p className="text-gray-600 text-sm">Total Pages</p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
              <h3 className="text-3xl font-bold text-blue-800">
                {stats.embedded}
              </h3>
              <p className="text-gray-600 text-sm">Embedded</p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
              <h3 className="text-3xl font-bold text-blue-800">
                {stats.reconstructed}
              </h3>
              <p className="text-gray-600 text-sm">Reconstructed</p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
              <h3 className="text-3xl font-bold text-red-600">
                {stats.decayed}
              </h3>
              <p className="text-gray-600 text-sm">Decayed</p>
            </div>
            <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
              <h3 className="text-3xl font-bold text-blue-800">
                {stats.pending}
              </h3>
              <p className="text-gray-600 text-sm">Pending Scans</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      action: "New page discovered: arxiv.org/abs/2501.12345",
                      time: "2 mins ago",
                      icon: "Globe",
                    },
                    {
                      action: "Embedding saved for 'Quantum NLP Survey'",
                      time: "8 mins ago",
                      icon: "Brain",
                    },
                    {
                      action: "Reconstruction generated: 'AI Ethics 2025'",
                      time: "15 mins ago",
                      icon: "FileText",
                    },
                    {
                      action: "Decay alert: 'Legacy Blog' (prob: 0.82)",
                      time: "1 hour ago",
                      icon: "Alert",
                    },
                    {
                      action: "Connector: DOAJ added 32 open-access papers",
                      time: "2 hours ago",
                      icon: "Link",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700">{item.action}</p>
                        <p className="text-gray-500 text-xs">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <Link
                    href="/dashboard/discover"
                    className="block w-full text-left px-4 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm text-center"
                  >
                    + Discover New Content
                  </Link>
                  <Link
                    href="/dashboard/pages"
                    className="block w-full text-left px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm text-center"
                  >
                    Browse Pages
                  </Link>
                  <Link
                    href="/dashboard/reconstructions"
                    className="block w-full text-left px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm text-center"
                  >
                    View Reconstructions
                  </Link>
                  <Link
                    href="/dashboard/decay"
                    className="block w-full text-left px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm text-center"
                  >
                    Decay Monitor
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Pages Grid */}
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">
              Recently Processed Pages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Quantum NLP Survey 2025",
                  domain: "arxiv.org",
                  status: "Embedded",
                  decay: `Low (${(0.12).toFixed(2)})`,
                  last: "8m ago",
                },
                {
                  title: "AI Ethics Framework v3",
                  domain: "ethics.ai",
                  status: "Reconstructed",
                  decay: `Medium (${(0.45).toFixed(2)})`,
                  last: "15m ago",
                },
                {
                  title: "Legacy ML Blog Post",
                  domain: "oldblog.com",
                  status: "Decayed",
                  decay: `High (${(0.82).toFixed(2)})`,
                  last: "1h ago",
                },
                {
                  title: "Semantic Search Paper",
                  domain: "semanticscholar.org",
                  status: "Pending",
                  decay: "—",
                  last: "Now",
                },
                {
                  title: "Open Access Journal",
                  domain: "doaj.org",
                  status: "Embedded",
                  decay: `Low (${(0.05).toFixed(2)})`,
                  last: "2h ago",
                },
                {
                  title: "Research Gate PDF",
                  domain: "researchgate.net",
                  status: "Failed",
                  decay: `High (${(0.91).toFixed(2)})`,
                  last: "3h ago",
                },
              ].map((page, i) => (
                <div
                  key={i}
                  className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-blue-800 text-sm line-clamp-2">
                      {page.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        page.status === "Embedded"
                          ? "bg-green-100 text-green-700"
                          : page.status === "Reconstructed"
                          ? "bg-blue-100 text-blue-700"
                          : page.status === "Decayed"
                          ? "bg-red-100 text-red-700"
                          : page.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {page.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p className="flex items-center gap-1">
                      <span className="text-gray-500">Domain:</span>{" "}
                      {page.domain}
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="text-gray-500">Decay:</span>{" "}
                      <span
                        className={
                          page.decay.includes("High") ? "text-red-600" : ""
                        }
                      >
                        {page.decay}
                      </span>
                    </p>
                    <p className="text-gray-500">Updated: {page.last}</p>
                  </div>
                  <button className="mt-4 w-full py-2 border border-blue-800 text-blue-800 rounded-md text-xs font-medium hover:bg-blue-50 transition-colors">
                    View Details
                  </button>
                </div>
              ))}
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
