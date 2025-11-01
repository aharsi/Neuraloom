// app/dashboard/pages/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Globe,
  Clock,
} from "lucide-react";

interface Page {
  id: string;
  url: string;
  title: string;
  body_summary: string;
  source: string;
  decay_probability: number;
  is_decayed: boolean;
  created_at: string;
  date?: string;
  author?: string;
  meta_description?: string;
  keywords?: string;
  hints?: any;
}

export default function PageDetail() {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [rescanning, setRescanning] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClientComponentClient();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  // DEBUG
  useEffect(() => {
    console.log("URL ID:", id);
  }, [id]);

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

  // Fetch page from backend API
  const fetchPage = async () => {
    if (!id) {
      setMessage({ type: "error", text: "Invalid page ID" });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND_URL}/pages/${id}`);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Page not found");
      }

      const data: Page = await res.json();
      console.log("Page loaded:", data); // DEBUG
      setPage(data);
    } catch (err: any) {
      console.error("Fetch failed:", err);
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchPage();
  }, [id]);

  // Re-scan
  const handleRescan = async () => {
    setRescanning(true);
    setMessage(null);
    try {
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      const res = await fetch(`${BACKEND_URL}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: page?.url,
          source: page?.source,
          priority: 0.9,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: "success", text: "Re-scan queued!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setRescanning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-blue-800 text-lg">Loading page...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-red-600 text-lg">Page not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-gray-100">
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <Link
                href="/dashboard/pages"
                className="text-sm text-blue-600 hover:underline"
              >
                ← All Pages
              </Link>
              <br />
              <br />
              <div>
                <h1 className="text-3xl font-bold text-blue-800 mb-2 line-clamp-2">
                  {page.title || "Untitled Page"}
                </h1>
                <a
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {page.url}
                </a>
              </div>
              <button
                onClick={handleRescan}
                disabled={rescanning}
                className="flex items-center gap-2 px-4 py-2 bg-purple-800 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${rescanning ? "animate-spin" : ""}`}
                />
                {rescanning ? "Scanning..." : "Re-scan"}
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`mb-6 p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content */}
            <div className="lg:col-span-2">
              <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  Content
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {page.body_summary ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: page.body_summary }}
                    />
                  ) : (
                    <p className="text-gray-500 italic">
                      No content available.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Decay Risk */}
              <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-blue-800">
                    Decay Risk
                  </h2>
                  {page.is_decayed && (
                    <span className="flex items-center gap-1 text-red-700 text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />
                      Decayed
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-800">
                    {(page.decay_probability * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {page.decay_probability > 0.7
                      ? "High"
                      : page.decay_probability > 0.4
                      ? "Medium"
                      : "Low"}{" "}
                    Risk
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">
                  Metadata
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Source:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {page.source}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Added:</span>
                    <span>
                      {format(new Date(page.created_at), "MMM dd, yyyy HH:mm")}
                    </span>
                  </div>
                  {page.author && (
                    <div className="text-xs text-gray-600">
                      Author: {page.author}
                    </div>
                  )}
                </div>
              </div>

              {/* Keywords */}
              {page.keywords && (
                <div className="bg-white/30 backdrop-blur-md border border-gray-200/50 rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-blue-800 mb-4">
                    Keywords
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {page.keywords
                      .split(",")
                      .slice(0, 8)
                      .map((kw, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                        >
                          {kw.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
