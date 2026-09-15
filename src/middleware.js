import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

function redirectTo(url, request) {
  return NextResponse.redirect(new URL(url, request.url));
}

export async function middleware(request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, let the request through — don't crash
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const nextPath = request.nextUrl.pathname + request.nextUrl.search;
  const role = user?.user_metadata?.role;

  // Not logged in — redirect to login
  if (!user && (pathname.startsWith("/client") || pathname.startsWith("/influencer"))) {
    return redirectTo(`/auth/login?next=${encodeURIComponent(nextPath)}`, request);
  }

  // Already logged in — redirect away from auth pages (except reset-password where recovery session is needed)
  if (user && pathname.startsWith("/auth") && !pathname.startsWith("/auth/reset-password")) {
    if (role === "client") return redirectTo("/client/dashboard", request);
    if (role === "influencer") return redirectTo("/influencer/dashboard", request);
  }

  // Wrong role protection
  if (user && pathname.startsWith("/client") && role !== "client") {
    if (role === "influencer") return redirectTo("/influencer/dashboard", request);
    return redirectTo("/auth/login", request);
  }

  if (user && pathname.startsWith("/influencer") && role !== "influencer") {
    if (role === "client") return redirectTo("/client/dashboard", request);
    return redirectTo("/auth/login", request);
  }

  return response;
}

export const config = {
  matcher: ["/client/:path*", "/influencer/:path*", "/auth/:path*"],
};
