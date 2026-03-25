import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // Basic Auth Protection (Dashboard & Admin)
  if (
    !user &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role & Subscription Checks (Only if logged in)
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, subscription_status")
      .eq("id", user.id)
      .single();

    // Admin Protection: Only 'admin' role can enter /admin
    if (pathname.startsWith("/admin") && profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Subscription Protection: Restricted features require 'active' status
    // PRD: "Non-subscribers receive restricted access"
    const restrictedFeatures = ["/dashboard/scores", "/dashboard/draws"];
    if (
      restrictedFeatures.some((p) => pathname.startsWith(p)) &&
      profile?.subscription_status !== "active"
    ) {
      return NextResponse.redirect(
        new URL("/dashboard?error=subscription_required", request.url),
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
