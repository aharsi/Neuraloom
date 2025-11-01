// app/auth/callback/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    // Await cookies() to get the actual cookie store
    const cookieStore = await cookies();

    // Pass a function returning the resolved cookie store
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
    });

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to dashboard
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
