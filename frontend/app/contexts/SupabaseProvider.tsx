"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ReactNode } from "react";

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient();
  return children;
}
