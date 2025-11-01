// components/Navbar.tsx
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);

      // Only redirect to /auth if NOT on auth page and no user
      if (!user && !pathname.startsWith("/auth")) {
        router.push("/auth");
      }
    };
    getUser();
  }, [supabase, router, pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  // Show nothing or skeleton during loading
  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </nav>
    );
  }

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-800">
          Neuraloom
        </Link>

        {isDashboard && user ? (
          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-700">
              Hi,{" "}
              <span className="font-medium">
                {user.user_metadata?.full_name ||
                  user.email?.split("@")[0] ||
                  "User"}
              </span>
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <ul className="flex space-x-6 text-sm font-medium uppercase tracking-wide">
            <li>
              <Link
                href="#features"
                className="hover:text-blue-600 transition-colors"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="#about"
                className="hover:text-blue-600 transition-colors"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="#pricing"
                className="hover:text-blue-600 transition-colors"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="#testimonials"
                className="hover:text-blue-600 transition-colors"
              >
                Testimonials
              </Link>
            </li>
            <li>
              <Link
                href="#faq"
                className="hover:text-blue-600 transition-colors"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="#cta"
                className="hover:text-blue-600 transition-colors"
              >
                Contact
              </Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}
